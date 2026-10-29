// client/src/games/rhymebattle/RhymeBattleGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Mic2, Timer, Send, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
}

interface RhymeBattleGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface RhymeTheme {
  rootWord: string;
  rhymes: string[];
}

const RHYME_THEMES: RhymeTheme[] = [
  { rootWord: 'LIGHT', rhymes: ['FIGHT', 'NIGHT', 'MIGHT', 'SIGHT', 'BITE', 'KITE', 'WHITE', 'KNIGHT', 'TIGHT', 'BRIGHT'] },
  { rootWord: 'STAR', rhymes: ['CAR', 'FAR', 'BAR', 'SCAR', 'JAR', 'TAR', 'WAR'] },
  { rootWord: 'FIRE', rhymes: ['WIRE', 'TIRE', 'HIRE', 'DESIRE', 'EMPIRE', 'INQUIRE', 'CHOIR'] },
  { rootWord: 'HERO', rhymes: ['ZERO', 'NERO', 'BOLERO'] },
  { rootWord: 'DANCE', rhymes: ['CHANCE', 'GLANCE', 'PRANCE', 'FRANCE', 'ADVANCE', 'STANCE'] },
  { rootWord: 'BLAST', rhymes: ['FAST', 'PAST', 'LAST', 'CAST', 'VAST', 'MAST'] }
];

export const RhymeBattleGame: React.FC<RhymeBattleGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const isHost = !isMultiplayer || multiplayerData?.you?.isHost || false;
  const roomId = multiplayerData?.roomId || '';

  const initialPlayers: Player[] = useMemo(() => {
    if (mode === 'room' && multiplayerData?.allPlayers && multiplayerData.allPlayers.length > 0) {
      return multiplayerData.allPlayers.map(p => ({
        id: p.socketId,
        name: p.name,
        avatar: p.avatar || 'fox',
        isBot: !!p.isBot,
        score: 0
      }));
    }

    const count = Math.max(2, Math.min(8, playerCount));
    const list: Player[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', isBot: false, score: 0 }
    ];

    const botNames = ['MC Nani', 'DJ Bramhi', 'Rap AI'];
    for (let i = 1; i < count; i++) {
      list.push({
        id: `bot_${i + 1}`,
        name: botNames[i - 1] || `Player ${i + 1}`,
        avatar: 'robot',
        isBot: true,
        score: 0
      });
    }
    return list;
  }, [mode, multiplayerData, playerCount]);

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [themeIdx, setThemeIdx] = useState(0);
  const [turnIdx, setTurnIdx] = useState(0);
  const [usedRhymes, setUsedRhymes] = useState<string[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(12);
  const [gameOver, setGameOver] = useState(false);

  const currentTheme = RHYME_THEMES[themeIdx] || RHYME_THEMES[0];
  const currentTurnPlayer = players[turnIdx] || players[0];
  const isMyTurn = currentTurnPlayer.id === myPlayerId;

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_RHYME_THEME', themeIdx: 0 });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_RHYME_THEME') {
        setThemeIdx(action.themeIdx);
        setUsedRhymes([]);
        setTurnIdx(0);
        setTimeLeft(12);
      } else if (action.type === 'RHYME_PLAYED') {
        setUsedRhymes(prev => [...prev, action.word]);
        setTurnIdx(action.nextTurn);
        setTimeLeft(12);
        sound.play('win');

        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, score: p.score + 15 } : p))
        );
      } else if (action.type === 'TIMEOUT') {
        sound.play('loss');
        setTurnIdx(action.nextTurn);
        setTimeLeft(12);
      } else if (action.type === 'REMATCH') {
        setThemeIdx(action.themeIdx);
        setUsedRhymes([]);
        setTurnIdx(0);
        setTimeLeft(12);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  // Turn timer
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [turnIdx, gameOver, usedRhymes]);

  // Bot Turn Simulation
  useEffect(() => {
    if (gameOver || !currentTurnPlayer.isBot) return;

    const botDelay = (botDifficulty === 'hard' ? 2 : botDifficulty === 'medium' ? 3.5 : 5) * 1000;
    const botTimer = setTimeout(() => {
      const candidates = currentTheme.rhymes.filter(r => !usedRhymes.includes(r));
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        applyRhyme(pick, currentTurnPlayer.id);
      } else {
        handleTimeout();
      }
    }, botDelay);

    return () => clearTimeout(botTimer);
  }, [turnIdx, gameOver, currentTurnPlayer, usedRhymes, currentTheme, botDifficulty]);

  const handleTimeout = () => {
    sound.play('loss');
    const next = (turnIdx + 1) % players.length;
    setTurnIdx(next);
    setTimeLeft(12);

    if (isMultiplayer) {
      sendAction({ type: 'TIMEOUT', nextTurn: next });
    }
  };

  const applyRhyme = (word: string, playerId: string) => {
    const clean = word.trim().toUpperCase();
    if (usedRhymes.includes(clean) || !currentTheme.rhymes.includes(clean)) {
      sound.play('loss');
      return;
    }

    sound.play('win');
    setInputWord('');
    setUsedRhymes(prev => [...prev, clean]);

    const next = (turnIdx + 1) % players.length;
    setTurnIdx(next);
    setTimeLeft(12);

    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, score: p.score + 15 } : p))
    );

    if (isMultiplayer) {
      sendAction({
        type: 'RHYME_PLAYED',
        word: clean,
        playerId,
        nextTurn: next
      });
    }

    if (usedRhymes.length + 1 >= currentTheme.rhymes.length || usedRhymes.length >= 8) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || gameOver || !inputWord) return;
    applyRhyme(inputWord, myPlayerId);
  };

  const handleRematch = () => {
    const nextIdx = (themeIdx + 1) % RHYME_THEMES.length;
    setThemeIdx(nextIdx);
    setUsedRhymes([]);
    setTurnIdx(0);
    setTimeLeft(12);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', themeIdx: nextIdx });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-purple-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black tracking-wider text-purple-400 uppercase">
              Rhyme Battle Showdown ({usedRhymes.length}/{currentTheme.rhymes.length} Rhymes)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timeLeft <= 4 ? 'bg-rose-500 text-white animate-pulse' : 'bg-purple-500/20 text-purple-300'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
              Turn: {currentTurnPlayer.name} {isMyTurn && '(YOU)'}
            </div>
          </div>
        </div>

        {/* Players Standings */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p, idx) => {
            const isTurn = idx === turnIdx;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                  isTurn ? 'bg-purple-950/70 border-purple-500 ring-1 ring-purple-400 shadow-md' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-purple-400">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        {/* Center Root Rhyme Stage */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Match this root rhyme:
          </span>
          <div className="text-3xl sm:text-4xl font-black text-purple-300 font-mono tracking-widest bg-purple-950/60 border-2 border-purple-500/60 rounded-2xl px-8 py-3 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse">
            "{currentTheme.rootWord}"
          </div>

          {/* Submission Input */}
          {!gameOver && (
            <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2 mt-2">
              <input
                type="text"
                disabled={!isMyTurn}
                value={inputWord}
                onChange={e => setInputWord(e.target.value.toUpperCase())}
                placeholder={isMyTurn ? `Type a word that rhymes with "${currentTheme.rootWord}"...` : `Waiting for ${currentTurnPlayer.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isMyTurn || !inputWord.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Rhyme
              </button>
            </form>
          )}

          {/* Used Rhymes List */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-2">
            {usedRhymes.map(r => (
              <span
                key={r}
                className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-purple-400" />
                {r} (+15 pts)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-purple-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Rhyme Battle Over!</h2>
            <div className="w-full flex flex-col gap-2 my-2">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-xl text-xs"
                  >
                    <span className="font-bold text-slate-200">
                      #{idx + 1} {p.name}
                    </span>
                    <span className="font-mono font-bold text-purple-400">{p.score} pts</span>
                  </div>
                ))}
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
};
