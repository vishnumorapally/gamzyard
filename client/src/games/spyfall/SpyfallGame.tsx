// client/src/games/spyfall/SpyfallGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  MapPin,
  Eye,
  EyeOff,
  Users,
  Bot,
  Timer,
  Compass,
  Vote,
  Sparkles,
  HelpCircle,
  AlertOctagon
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { SpyfallLocation, SPYFALL_LOCATIONS, getRandomLocation } from './locations';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface SpyfallPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  isSpy: boolean;
  assignedRole: string;
}

interface SpyfallGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const SpyfallGame: React.FC<SpyfallGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 5,
  multiplayerData,
  onExit
}) => {
  const [currentLocation, setCurrentLocation] = useState<SpyfallLocation>(() => getRandomLocation());
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [showIdentity, setShowIdentity] = useState(false);
  const [spyGuessLocation, setSpyGuessLocation] = useState<string | null>(null);
  const [votingPhase, setVotingPhase] = useState(false);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState<'agents' | 'spy' | null>(null);

  // Initialize players & assign spy
  const initialPlayers: SpyfallPlayer[] = useMemo(() => {
    const count = Math.max(3, Math.min(8, playerCount));
    const spyIdx = Math.floor(Math.random() * count);
    const botNames = ['Bramhi Bot', 'Nani AI', 'Mahesh AI', 'Samantha Bot', 'Vijay AI', 'Prabhas Bot', 'Pooja AI'];

    const list: SpyfallPlayer[] = [];
    const availableRoles = [...currentLocation.roles].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      const isMe = i === 0;
      const isSpy = i === spyIdx;
      list.push({
        id: isMe ? 'player_1' : `bot_${i + 1}`,
        name: isMe ? 'You' : botNames[i - 1] || `Player ${i + 1}`,
        avatar: isMe ? 'fox' : 'robot',
        isBot: !isMe,
        isSpy,
        assignedRole: isSpy ? 'Secret Infiltrator (SPY)' : availableRoles[i % availableRoles.length]
      });
    }
    return list;
  }, [playerCount, currentLocation]);

  const [players, setPlayers] = useState<SpyfallPlayer[]>(initialPlayers);
  const me = players.find(p => p.id === 'player_1') || players[0];
  const spyPlayer = players.find(p => p.isSpy);

  // Round timer
  useEffect(() => {
    if (gameOver || votingPhase) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setVotingPhase(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, votingPhase]);

  // Spy guesses the location
  const handleSpyGuess = (locName: string) => {
    setSpyGuessLocation(locName);
    const isCorrect = locName === currentLocation.name;

    setTimeout(() => {
      setGameOver(true);
      if (isCorrect) {
        setWinnerTeam('spy');
        sound.play('win');
        confetti({ particleCount: 75, spread: 80 });
      } else {
        setWinnerTeam('agents');
        sound.play('loss');
      }
      recordGameResult(me.isSpy ? (isCorrect ? 'win' : 'loss') : (isCorrect ? 'loss' : 'win'));
    }, 1000);
  };

  // Vote on suspected spy
  const handleVoteSuspect = (candidateId: string) => {
    if (myVote) return;
    setMyVote(candidateId);
    sound.play('click');

    const votes: Record<string, number> = { [candidateId]: 1 };
    players.forEach(p => {
      if (p.isBot) {
        const rand = players[Math.floor(Math.random() * players.length)].id;
        votes[rand] = (votes[rand] || 0) + 1;
      }
    });

    let maxV = -1;
    let convictedId: string | null = null;
    Object.entries(votes).forEach(([id, c]) => {
      if (c > maxV) {
        maxV = c;
        convictedId = id;
      }
    });

    setTimeout(() => {
      setGameOver(true);
      const isSpyCaught = convictedId === spyPlayer?.id;
      if (isSpyCaught) {
        setWinnerTeam('agents');
        sound.play('win');
        confetti({ particleCount: 75, spread: 80 });
      } else {
        setWinnerTeam('spy');
        sound.play('loss');
      }
      recordGameResult(me.isSpy ? (!isSpyCaught ? 'win' : 'loss') : (isSpyCaught ? 'win' : 'loss'));
    }, 1200);
  };

  const handleRematch = () => {
    const nextLoc = getRandomLocation();
    setCurrentLocation(nextLoc);
    setTimeLeft(180);
    setShowIdentity(false);
    setSpyGuessLocation(null);
    setVotingPhase(false);
    setMyVote(null);
    setGameOver(false);
    setWinnerTeam(null);

    const count = players.length;
    const spyIdx = Math.floor(Math.random() * count);
    const roles = [...nextLoc.roles].sort(() => 0.5 - Math.random());

    setPlayers(prev =>
      prev.map((p, i) => {
        const isSpy = i === spyIdx;
        return {
          ...p,
          isSpy,
          assignedRole: isSpy ? 'Secret Infiltrator (SPY)' : roles[i % roles.length]
        };
      })
    );
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-teal-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(20,184,166,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-black tracking-wider text-teal-400 uppercase">
              Spyfall · Telugu Locations Edition
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-mono font-bold text-teal-300">
            <Timer className="w-3.5 h-3.5" /> {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
        </div>

        {/* Secret Location & Role Card */}
        <div className="w-full bg-slate-900 border-2 border-teal-500/30 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Your Confidential Dossier
            </span>
            <button
              onClick={() => setShowIdentity(!showIdentity)}
              className="text-slate-400 hover:text-white p-1"
            >
              {showIdentity ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="my-2">
            {showIdentity ? (
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl sm:text-3xl font-black text-teal-300 font-serif">
                  {me.isSpy ? '🕵️ YOU ARE THE SPY!' : currentLocation.name}
                </div>
                <div className="text-xs text-amber-400 font-semibold">
                  Role: <strong className="text-white">{me.assignedRole}</strong>
                </div>
                {me.isSpy && (
                  <p className="text-xs text-slate-400 max-w-md mt-1">
                    You have no idea where everyone is! Bluff your answers, blend in, and guess the location to win!
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-500 italic">
                (Click eye icon to reveal your secret location and role)
              </div>
            )}
          </div>
        </div>

        {/* Possible Locations Grid (Visible to all, helps Spy guess) */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-teal-400" /> Possible Locations List (Click to accuse / Spy guess):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SPYFALL_LOCATIONS.map(loc => (
              <button
                key={loc.id}
                disabled={gameOver || (!me.isSpy && !votingPhase)}
                onClick={() => handleSpyGuess(loc.name)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-left transition-all active:scale-95"
              >
                <div className="text-xs font-bold text-white truncate">{loc.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{loc.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Voting & Suspects Area */}
        <div className="w-full flex flex-col items-center gap-2">
          <button
            onClick={() => setVotingPhase(true)}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
          >
            <Vote className="w-3.5 h-3.5" /> Call Emergency Vote on the Spy!
          </button>

          {votingPhase && !gameOver && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {players.filter(p => p.id !== 'player_1').map(p => (
                <button
                  key={p.id}
                  onClick={() => handleVoteSuspect(p.id)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 text-center text-xs font-bold text-white transition-all active:scale-95"
                >
                  Accuse {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-teal-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">
              {winnerTeam === 'spy' ? '🕵️ THE SPY WON!' : '🛡️ AGENTS TRIUMPH!'}
            </h2>
            <div className="text-xs text-slate-300">
              The Secret Location was: <strong className="text-teal-400 text-sm">{currentLocation.name}</strong>
            </div>
            <div className="text-xs text-slate-400">
              The Spy was: <strong className="text-rose-400 text-sm">{spyPlayer?.name}</strong>
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
