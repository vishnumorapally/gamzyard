// client/src/games/rapidfire/RapidFireGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Zap,
  Timer,
  Users,
  Bot,
  RotateCcw,
  Sparkles,
  Flame
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { RapidFireQuestion, getRandomRapidFireQuestions } from './questions';
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

interface RapidFireGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const RapidFireGame: React.FC<RapidFireGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [questions, setQuestions] = useState<RapidFireQuestion[]>(() => getRandomRapidFireQuestions(8));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [selectedChoice, setSelectedChoice] = useState<1 | 2 | null>(null);

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

    const botNames = ['Bramhi Bot', 'Nani AI', 'Mahesh AI', 'Samantha Bot'];
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
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const currentQ = questions[currentIdx] || questions[0];

  // 5-second ticking timer
  useEffect(() => {
    if (gameOver || selectedChoice !== null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, selectedChoice, currentIdx]);

  const handleTimeOut = () => {
    sound.play('loss');
    setStreak(0);
    advanceToNext();
  };

  const handleChoice = (opt: 1 | 2) => {
    if (selectedChoice !== null || gameOver) return;
    setSelectedChoice(opt);
    sound.play('click');

    const points = timeLeft >= 3 ? 15 : 10;
    setStreak(prev => prev + 1);

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === myPlayerId) return { ...p, score: p.score + points };
        if (p.isBot) {
          const botPts = Math.random() > 0.3 ? 10 : 0;
          return { ...p, score: p.score + botPts };
        }
        return p;
      })
    );

    setTimeout(() => {
      advanceToNext();
    }, 900);
  };

  const advanceToNext = () => {
    if (currentIdx + 1 >= questions.length) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 75, spread: 80 });
    } else {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(5);
      setSelectedChoice(null);
    }
  };

  const handleRematch = () => {
    setQuestions(getRandomRapidFireQuestions(8));
    setCurrentIdx(0);
    setTimeLeft(5);
    setSelectedChoice(null);
    setStreak(0);
    setGameOver(false);
    setPlayers(initialPlayers);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
              Rapid Fire Hot Seat · Shot {currentIdx + 1} of {questions.length}
            </span>
          </div>
          {/* Ticking timer pill */}
          <div className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${
            timeLeft <= 2 ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse' : 'bg-amber-950/80 border-amber-500 text-amber-300'
          }`}>
            ⏱ {timeLeft}s Left
          </div>
        </div>

        {/* Players Standings */}
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
              <span className="text-xs font-mono font-black text-amber-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Prompt Card */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Don't Think! React!
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white max-w-xl">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Rapid 2 Options */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-1">
          <button
            disabled={selectedChoice !== null}
            onClick={() => handleChoice(1)}
            className={`p-6 rounded-2xl border text-center font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-200 active:scale-95 ${
              selectedChoice === 1
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500 hover:bg-slate-800'
            }`}
          >
            {currentQ.option1}
          </button>

          <button
            disabled={selectedChoice !== null}
            onClick={() => handleChoice(2)}
            className={`p-6 rounded-2xl border text-center font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-200 active:scale-95 ${
              selectedChoice === 2
                ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500 hover:bg-slate-800'
            }`}
          >
            {currentQ.option2}
          </button>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">Rapid Fire Champion!</h2>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              {[...players].sort((a, b) => b.score - a.score).map((p, rank) => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">#{rank + 1} {p.name}</span>
                  <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
                </div>
              ))}
            </div>
            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="amber"
            />
          </div>
        </div>
      )}
    </div>
  );
};
