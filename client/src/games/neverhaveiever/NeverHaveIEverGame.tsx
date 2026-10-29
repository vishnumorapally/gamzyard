// client/src/games/neverhaveiever/NeverHaveIEverGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Bot,
  HelpCircle,
  Sparkles,
  Flame,
  Check,
  X,
  RotateCcw,
  Hand
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { getRandomNHIEPrompts } from './prompts';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface NHIEPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  fingersLeft: number; // 5 down to 0
  answered: boolean;
  hasDoneIt: boolean | null;
}

interface NeverHaveIEverGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const NeverHaveIEverGame: React.FC<NeverHaveIEverGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [prompts, setPrompts] = useState<string[]>(() => getRandomNHIEPrompts(8));
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  const initialPlayers: NHIEPlayer[] = useMemo(() => {
    if (mode === 'room' && multiplayerData?.allPlayers && multiplayerData.allPlayers.length > 0) {
      return multiplayerData.allPlayers.map(p => ({
        id: p.socketId,
        name: p.name,
        avatar: p.avatar || 'fox',
        isBot: !!p.isBot,
        fingersLeft: 5,
        answered: false,
        hasDoneIt: null
      }));
    }

    const count = Math.max(2, Math.min(8, playerCount));
    const list: NHIEPlayer[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', isBot: false, fingersLeft: 5, answered: false, hasDoneIt: null }
    ];

    const botNames = ['Bramhi Bot', 'Allu AI', 'Rashmika AI', 'Mahesh Bot', 'Samantha AI', 'Prabhas Bot'];
    for (let i = 1; i < count; i++) {
      list.push({
        id: `bot_${i + 1}`,
        name: botNames[i - 1] || `Player ${i + 1}`,
        avatar: 'robot',
        isBot: true,
        fingersLeft: 5,
        answered: false,
        hasDoneIt: null
      });
    }
    return list;
  }, [mode, multiplayerData, playerCount]);

  const [players, setPlayers] = useState<NHIEPlayer[]>(initialPlayers);
  const [roundRevealed, setRoundRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [history, setHistory] = useState<string[]>([
    'Never Have I Ever Tollywood Edition begun! Put a finger down if you have done it!'
  ]);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const currentPrompt = prompts[currentPromptIdx] || prompts[0];

  // Human answer
  const handleVote = (hasDoneIt: boolean) => {
    const targetId = myPlayerId;
    sound.play(hasDoneIt ? 'loss' : 'win');

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === targetId) {
          const newFingers = hasDoneIt ? Math.max(0, p.fingersLeft - 1) : p.fingersLeft;
          return { ...p, answered: true, hasDoneIt, fingersLeft: newFingers };
        }
        return p;
      })
    );

    // Bot automatic answers
    players.forEach(p => {
      if (p.isBot) {
        const botDoneIt = Math.random() > 0.45;
        setTimeout(() => {
          setPlayers(prev =>
            prev.map(item => {
              if (item.id === p.id) {
                const newFingers = botDoneIt ? Math.max(0, item.fingersLeft - 1) : item.fingersLeft;
                return { ...item, answered: true, hasDoneIt: botDoneIt, fingersLeft: newFingers };
              }
              return item;
            })
          );
        }, 800 + Math.random() * 800);
      }
    });

    // Reveal results after short delay
    setTimeout(() => {
      setRoundRevealed(true);
    }, 1800);
  };

  const handleNextPrompt = () => {
    if (currentPromptIdx + 1 >= prompts.length) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    } else {
      setCurrentPromptIdx(prev => prev + 1);
      setRoundRevealed(false);
      setPlayers(prev => prev.map(p => ({ ...p, answered: false, hasDoneIt: null })));
    }
  };

  const handleRematch = () => {
    setPrompts(getRandomNHIEPrompts(8));
    setCurrentPromptIdx(0);
    setRoundRevealed(false);
    setGameOver(false);
    setPlayers(initialPlayers);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      {/* Header Card */}
      <div className="w-full bg-slate-950/95 border-2 border-purple-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black tracking-wider text-purple-400 uppercase">
              Never Have I Ever · Card {currentPromptIdx + 1} of {prompts.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            5 Fingers Mode
          </span>
        </div>

        {/* Players Fingers Status Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {players.map(p => (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                p.fingersLeft === 0
                  ? 'bg-rose-950/30 border-rose-900 opacity-60'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-white flex items-center gap-1 truncate max-w-[120px]">
                {p.isBot ? <Bot className="w-3 h-3 text-cyan-400" /> : <Users className="w-3 h-3 text-amber-400" />}
                <span className="truncate">{p.name}</span>
              </div>

              {/* 5 Finger Icons */}
              <div className="flex gap-1 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm transition-transform ${
                      i < p.fingersLeft ? 'text-amber-400 scale-100' : 'text-slate-700 scale-75 line-through'
                    }`}
                  >
                    🖐
                  </span>
                ))}
              </div>

              {/* Reveal Badge */}
              {roundRevealed && p.hasDoneIt !== null && (
                <div className={`mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  p.hasDoneIt ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {p.hasDoneIt ? 'I HAVE! 🙋‍♂️' : 'NEVER 😇'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Big Prompt Card */}
        <div className="w-full bg-slate-900 border-2 border-purple-500/30 rounded-2xl p-5 sm:p-6 text-center my-2 flex flex-col items-center gap-3 shadow-xl">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Statement
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed max-w-xl">
            "{currentPrompt}"
          </h2>

          {/* Interactive Voting Buttons for human */}
          {!roundRevealed && (
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => handleVote(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs tracking-wider uppercase shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> I Have Done It (-1 Finger)
              </button>
              <button
                onClick={() => handleVote(false)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs tracking-wider uppercase shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Never In My Life (Safe)
              </button>
            </div>
          )}

          {/* Next Button when revealed */}
          {roundRevealed && (
            <button
              onClick={handleNextPrompt}
              className="mt-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
            >
              Next Statement ▶
            </button>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-purple-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">Match Concluded!</h2>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              {[...players].sort((a, b) => b.fingersLeft - a.fingersLeft).map((p, rank) => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">#{rank + 1} {p.name}</span>
                  <span className="font-mono font-bold text-purple-400">{p.fingersLeft} fingers left</span>
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
