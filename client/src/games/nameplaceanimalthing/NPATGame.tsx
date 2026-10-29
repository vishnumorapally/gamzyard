// client/src/games/nameplaceanimalthing/NPATGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Users,
  Bot,
  AlertOctagon,
  Timer,
  RotateCcw,
  Check,
  X,
  Volume2,
  ChevronRight,
  Flame,
  User,
  MapPin,
  Package,
  Cat
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  NPAT_DICTIONARY,
  getRandomNPATLetter,
  validateNPATWord
} from './dictionary';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface NPATPlayer {
  id: string;
  name: string;
  avatar: string;
  role: 'p1' | 'p2' | 'p3' | 'p4';
  isBot: boolean;
  score: number;
}

interface PlayerSubmission {
  name: string;
  place: string;
  animal: string;
  thing: string;
  scoreBreakdown?: {
    name: number;
    place: number;
    animal: number;
    thing: number;
    total: number;
  };
}

interface NPATGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const NPATGame: React.FC<NPATGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
  multiplayerData,
  onExit
}) => {
  // Determine players
  const initialPlayers: NPATPlayer[] = useMemo(() => {
    if (mode === 'room' && multiplayerData?.allPlayers && multiplayerData.allPlayers.length > 0) {
      return multiplayerData.allPlayers.map((p, idx) => ({
        id: p.socketId,
        name: p.name,
        avatar: p.avatar || 'fox',
        role: `p${idx + 1}` as any,
        isBot: !!p.isBot,
        score: 0
      }));
    }

    const count = Math.max(2, Math.min(4, playerCount));
    const list: NPATPlayer[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', role: 'p1', isBot: false, score: 0 }
    ];

    const botNames = ['Arjun Bot', 'Priya AI', 'Rohan Bot'];
    for (let i = 1; i < count; i++) {
      list.push({
        id: `bot_${i + 1}`,
        name: botNames[i - 1] || `AI Player ${i + 1}`,
        avatar: 'robot',
        role: `p${i + 1}` as any,
        isBot: true,
        score: 0
      });
    }
    return list;
  }, [mode, multiplayerData, playerCount]);

  const [players, setPlayers] = useState<NPATPlayer[]>(initialPlayers);
  const [currentRound, setCurrentRound] = useState(1);
  const [activeLetter, setActiveLetter] = useState<string>(() => getRandomNPATLetter());
  const [isSpinning, setIsSpinning] = useState(false);
  const [myInputs, setMyInputs] = useState({ name: '', place: '', animal: '', thing: '' });
  const [submissions, setSubmissions] = useState<Record<string, PlayerSubmission>>({});
  const [stopCaller, setStopCaller] = useState<string | null>(null);
  const [panicCountdown, setPanicCountdown] = useState<number | null>(null);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<NPATPlayer | null>(null);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';

  // Can trigger STOP
  const canCallStop = useMemo(() => {
    return (
      !stopCaller &&
      !roundCompleted &&
      myInputs.name.trim().length > 0 &&
      myInputs.place.trim().length > 0 &&
      myInputs.animal.trim().length > 0 &&
      myInputs.thing.trim().length > 0
    );
  }, [myInputs, stopCaller, roundCompleted]);

  // Panic countdown when someone calls STOP
  useEffect(() => {
    if (panicCountdown === null) return;
    if (panicCountdown <= 0) {
      finalizeRound();
      return;
    }

    const timer = setInterval(() => {
      setPanicCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [panicCountdown]);

  // Bot AI auto-play
  useEffect(() => {
    if (roundCompleted || gameOver) return;

    players.forEach(p => {
      if (!p.isBot) return;

      const entry = NPAT_DICTIONARY[activeLetter];
      if (!entry) return;

      const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      const delay = (botDifficulty === 'hard' ? 12 : botDifficulty === 'medium' ? 18 : 25) * 1000 + Math.random() * 5000;

      const botTimer = setTimeout(() => {
        if (!roundCompleted) {
          const botSub: PlayerSubmission = {
            name: pickRandom(entry.names),
            place: pickRandom(entry.places),
            animal: pickRandom(entry.animals),
            thing: pickRandom(entry.things)
          };

          setSubmissions(prev => ({
            ...prev,
            [p.id]: botSub
          }));

          // Bot calls STOP if no one else has called it
          if (!stopCaller) {
            handleCallStop(p.name);
          }
        }
      }, delay);

      return () => clearTimeout(botTimer);
    });
  }, [activeLetter, currentRound, botDifficulty, roundCompleted, gameOver, players, stopCaller]);

  // Handle STOP call
  const handleCallStop = (callerName: string) => {
    if (stopCaller || roundCompleted) return;
    sound.play('click');
    setStopCaller(callerName);
    setPanicCountdown(10);

    if (isMultiplayer && multiplayerData?.roomId) {
      const socket = getSocket();
      socket.emit('game_action', {
        roomId: multiplayerData.roomId,
        action: 'call_stop',
        callerName
      });
    }
  };

  // Evaluate & finalize round
  const finalizeRound = useCallback(() => {
    setRoundCompleted(true);
    setPanicCountdown(null);

    // Record human player's submission
    const currentSubs: Record<string, PlayerSubmission> = {
      ...submissions,
      [myPlayerId]: { ...myInputs }
    };

    // Calculate scores for each player
    const scoredSubs: Record<string, PlayerSubmission> = {};
    const roundTotals: Record<string, number> = {};

    players.forEach(player => {
      const sub = currentSubs[player.id] || { name: '', place: '', animal: '', thing: '' };
      const breakdown = { name: 0, place: 0, animal: 0, thing: 0, total: 0 };

      // Helper to evaluate field
      const evalCategory = (cat: 'name' | 'place' | 'animal' | 'thing', dictKey: 'names' | 'places' | 'animals' | 'things') => {
        const word = sub[cat].trim();
        if (!validateNPATWord(dictKey, word, activeLetter)) return 0;

        // Check if another player wrote the same word
        const isShared = players.some(other => {
          if (other.id === player.id) return false;
          const otherWord = currentSubs[other.id]?.[cat]?.trim()?.toLowerCase();
          return otherWord === word.toLowerCase();
        });

        return isShared ? 5 : 10;
      };

      breakdown.name = evalCategory('name', 'names');
      breakdown.place = evalCategory('place', 'places');
      breakdown.animal = evalCategory('animal', 'animals');
      breakdown.thing = evalCategory('thing', 'things');
      breakdown.total = breakdown.name + breakdown.place + breakdown.animal + breakdown.thing;

      scoredSubs[player.id] = { ...sub, scoreBreakdown: breakdown };
      roundTotals[player.id] = breakdown.total;
    });

    setSubmissions(scoredSubs);

    // Update cumulative player scores
    setPlayers(prev =>
      prev.map(p => ({
        ...p,
        score: p.score + (roundTotals[p.id] || 0)
      }))
    );

    sound.play('win');

    // If 3 rounds completed, finish game
    if (currentRound >= 3) {
      setGameOver(true);
      // Determine overall winner
      setTimeout(() => {
        setPlayers(latestPlayers => {
          const sorted = [...latestPlayers].sort((a, b) => b.score - a.score);
          setWinner(sorted[0]);
          if (sorted[0]?.id === myPlayerId) {
            confetti({ particleCount: 120, spread: 90 });
          }
          recordGameResult(sorted[0]?.id === myPlayerId ? 'win' : 'loss');
          return latestPlayers;
        });
      }, 500);
    }
  }, [submissions, myPlayerId, myInputs, players, activeLetter, currentRound]);

  // Proceed to next round
  const handleNextRound = () => {
    setCurrentRound(prev => prev + 1);
    const nextLetter = getRandomNPATLetter();
    setActiveLetter(nextLetter);
    setMyInputs({ name: '', place: '', animal: '', thing: '' });
    setSubmissions({});
    setStopCaller(null);
    setPanicCountdown(null);
    setRoundCompleted(false);
  };

  // Rematch
  const handleRematch = () => {
    setPlayers(initialPlayers);
    setCurrentRound(1);
    setActiveLetter(getRandomNPATLetter());
    setMyInputs({ name: '', place: '', animal: '', thing: '' });
    setSubmissions({});
    setStopCaller(null);
    setPanicCountdown(null);
    setRoundCompleted(false);
    setGameOver(false);
    setWinner(null);
  };

  // Multiplayer listener
  useEffect(() => {
    if (!isMultiplayer || !multiplayerData?.roomId) return;
    const socket = getSocket();

    const handleGameAction = (data: any) => {
      if (data.action === 'call_stop') {
        sound.play('click');
        setStopCaller(data.callerName);
        setPanicCountdown(10);
      }
    };

    socket.on('game_action', handleGameAction);
    return () => {
      socket.off('game_action', handleGameAction);
    };
  }, [isMultiplayer, multiplayerData]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      {/* Game Header & Round Track */}
      <div className="w-full bg-slate-950/95 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col items-center gap-3 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-black tracking-wider text-indigo-400 uppercase">
              Round {currentRound} of 3
            </span>
          </div>
          <div className="text-xs font-bold text-slate-400">
            {players.length} Players Active
          </div>
        </div>

        {/* Big Glowing Round Letter Display */}
        <div className="flex flex-col items-center justify-center my-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Active Alphabet Letter
          </div>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 flex items-center justify-center shadow-[0_0_35px_rgba(99,102,241,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <span className="text-5xl sm:text-6xl font-black text-amber-300 font-mono">
                {activeLetter}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            Fill words starting with <strong className="text-white">'{activeLetter}'</strong>
          </div>
        </div>

        {/* Players Standings Bar */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map(p => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5 truncate">
                {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
              </div>
              <span className="text-xs font-mono font-black text-indigo-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Panic Countdown Banner */}
        {panicCountdown !== null && (
          <div className="w-full bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-400 animate-spin" />
              <div className="text-xs font-black text-rose-200">
                🚨 {stopCaller} CALLED STOP! FINISH QUICKLY!
              </div>
            </div>
            <div className="text-2xl font-mono font-black text-white">
              {panicCountdown}s
            </div>
          </div>
        )}
      </div>

      {/* Main Form Fields */}
      {!roundCompleted && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 mt-3 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Name (starting with {activeLetter})
              </label>
              <input
                type="text"
                value={myInputs.name}
                onChange={e => setMyInputs({ ...myInputs, name: e.target.value })}
                placeholder={`e.g. ${activeLetter === 'B' ? 'Bharat' : activeLetter === 'M' ? 'Manish' : `${activeLetter}...`}`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* 2. Place */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                Place (City, State, Country)
              </label>
              <input
                type="text"
                value={myInputs.place}
                onChange={e => setMyInputs({ ...myInputs, place: e.target.value })}
                placeholder={`e.g. ${activeLetter === 'B' ? 'Bengaluru' : activeLetter === 'M' ? 'Mumbai' : `${activeLetter}...`}`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* 3. Animal */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Cat className="w-3.5 h-3.5 text-amber-400" />
                Animal / Bird / Creature
              </label>
              <input
                type="text"
                value={myInputs.animal}
                onChange={e => setMyInputs({ ...myInputs, animal: e.target.value })}
                placeholder={`e.g. ${activeLetter === 'B' ? 'Bengal Tiger' : activeLetter === 'M' ? 'Monkey' : `${activeLetter}...`}`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* 4. Thing */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-pink-400" />
                Thing / Object
              </label>
              <input
                type="text"
                value={myInputs.thing}
                onChange={e => setMyInputs({ ...myInputs, thing: e.target.value })}
                placeholder={`e.g. ${activeLetter === 'B' ? 'Bat' : activeLetter === 'M' ? 'Mirror' : `${activeLetter}...`}`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          {/* Big Glowing STOP Button */}
          <div className="mt-5 flex justify-center">
            <button
              disabled={!canCallStop}
              onClick={() => handleCallStop('You')}
              className={`w-full max-w-sm py-4 rounded-2xl font-black text-lg tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl ${
                canCallStop
                  ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer scale-105 active:scale-95'
                  : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <AlertOctagon className="w-6 h-6 animate-pulse" />
              STOP!
            </button>
          </div>
        </div>
      )}

      {/* Round Scoring Review Card */}
      {roundCompleted && !gameOver && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 mt-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Round {currentRound} Score Breakdown
            </h3>
            <button
              onClick={handleNextRound}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
            >
              Next Round <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {players.map(player => {
              const sub = submissions[player.id];
              const b = sub?.scoreBreakdown;
              return (
                <div key={player.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {player.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400" /> : <Users className="w-3.5 h-3.5 text-amber-400" />}
                      {player.name}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      +{b?.total || 0} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-1.5 bg-slate-900 rounded-lg">
                      <div className="text-[10px] text-slate-400">Name</div>
                      <div className="font-semibold text-slate-200 truncate">{sub?.name || '—'}</div>
                      <div className="text-[10px] font-mono text-indigo-400">+{b?.name || 0} pts</div>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded-lg">
                      <div className="text-[10px] text-slate-400">Place</div>
                      <div className="font-semibold text-slate-200 truncate">{sub?.place || '—'}</div>
                      <div className="text-[10px] font-mono text-purple-400">+{b?.place || 0} pts</div>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded-lg">
                      <div className="text-[10px] text-slate-400">Animal</div>
                      <div className="font-semibold text-slate-200 truncate">{sub?.animal || '—'}</div>
                      <div className="text-[10px] font-mono text-amber-400">+{b?.animal || 0} pts</div>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded-lg">
                      <div className="text-[10px] text-slate-400">Thing</div>
                      <div className="font-semibold text-slate-200 truncate">{sub?.thing || '—'}</div>
                      <div className="text-[10px] font-mono text-pink-400">+{b?.thing || 0} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Over Leaderboard */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-indigo-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {winner?.id === myPlayerId ? '🏆 CHAMPION!' : 'MATCH COMPLETED'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {winner?.name} claimed the highest score across 3 rounds!
              </p>
            </div>

            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              {[...players].sort((a, b) => b.score - a.score).map((p, rank) => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">#{rank + 1}</span> {p.name}
                  </span>
                  <span className="font-mono font-bold text-indigo-400">{p.score} pts</span>
                </div>
              ))}
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="cyan"
            />
          </div>
        </div>
      )}
    </div>
  );
};
