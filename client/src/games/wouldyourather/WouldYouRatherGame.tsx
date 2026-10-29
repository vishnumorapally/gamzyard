// client/src/games/wouldyourather/WouldYouRatherGame.tsx
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Bot,
  HelpCircle,
  Sparkles,
  Flame,
  Check,
  Scale
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { WYRPrompt, getRandomWYRPrompts } from './prompts';
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

interface WouldYouRatherGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const WouldYouRatherGame: React.FC<WouldYouRatherGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [prompts, setPrompts] = useState<WYRPrompt[]>(() => getRandomWYRPrompts(5));
  const [currentIdx, setCurrentIdx] = useState(0);

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

    const botNames = ['Bramhi Bot', 'Allu AI', 'Pawan Bot', 'Chiru AI', 'Samantha Bot'];
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
  const [myChoice, setMyChoice] = useState<'A' | 'B' | null>(null);
  const [allVotes, setAllVotes] = useState<Record<string, 'A' | 'B'>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const currentPrompt = prompts[currentIdx] || prompts[0];

  const handleChoose = (choice: 'A' | 'B') => {
    if (myChoice !== null || isRevealed) return;
    setMyChoice(choice);
    sound.play('click');

    const votesMap: Record<string, 'A' | 'B'> = { [myPlayerId]: choice };

    // Simulate bot votes
    players.forEach(p => {
      if (p.isBot) {
        votesMap[p.id] = Math.random() > 0.5 ? 'A' : 'B';
      }
    });

    setAllVotes(votesMap);

    setTimeout(() => {
      setIsRevealed(true);
      sound.play('win');

      // Check majority
      const countA = Object.values(votesMap).filter(v => v === 'A').length;
      const countB = Object.values(votesMap).filter(v => v === 'B').length;
      const majorityChoice = countA >= countB ? 'A' : 'B';

      // Reward players who matched majority
      setPlayers(prev =>
        prev.map(p => {
          if (votesMap[p.id] === majorityChoice) {
            return { ...p, score: p.score + 10 };
          }
          return p;
        })
      );
    }, 1200);
  };

  const handleNextPrompt = () => {
    if (currentIdx + 1 >= prompts.length) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 75, spread: 80 });
    } else {
      setCurrentIdx(prev => prev + 1);
      setMyChoice(null);
      setAllVotes({});
      setIsRevealed(false);
    }
  };

  const handleRematch = () => {
    setPrompts(getRandomWYRPrompts(5));
    setCurrentIdx(0);
    setMyChoice(null);
    setAllVotes({});
    setIsRevealed(false);
    setGameOver(false);
    setPlayers(initialPlayers);
  };

  // Percentages
  const stats = useMemo(() => {
    if (!isRevealed) return { pctA: 50, pctB: 50, countA: 0, countB: 0 };
    const total = Object.values(allVotes).length || 1;
    const a = Object.values(allVotes).filter(v => v === 'A').length;
    const b = Object.values(allVotes).filter(v => v === 'B').length;
    return {
      pctA: Math.round((a / total) * 100),
      pctB: Math.round((b / total) * 100),
      countA: a,
      countB: b
    };
  }, [isRevealed, allVotes]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(99,102,241,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black tracking-wider text-indigo-400 uppercase">
              Would You Rather? · Dilemma {currentIdx + 1} of {prompts.length}
            </span>
          </div>
          <span className="text-xs text-amber-400 font-bold">
            {currentPrompt.topic}
          </span>
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
              <span className="text-xs font-mono font-black text-indigo-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* The Two Dilemma Cards Clash */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          {/* Option A */}
          <button
            disabled={isRevealed || myChoice !== null}
            onClick={() => handleChoose('A')}
            className={`p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              myChoice === 'A'
                ? 'bg-blue-950/90 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.4)] scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black tracking-wider uppercase">
                  Option A
                </span>
                {isRevealed && (
                  <span className="text-xl font-mono font-black text-blue-400">
                    {stats.pctA}%
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                "{currentPrompt.optionA}"
              </p>
            </div>

            {isRevealed && (
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-4 border border-slate-800">
                <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${stats.pctA}%` }} />
              </div>
            )}
          </button>

          {/* Option B */}
          <button
            disabled={isRevealed || myChoice !== null}
            onClick={() => handleChoose('B')}
            className={`p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              myChoice === 'B'
                ? 'bg-purple-950/90 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.4)] scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black tracking-wider uppercase">
                  Option B
                </span>
                {isRevealed && (
                  <span className="text-xl font-mono font-black text-purple-400">
                    {stats.pctB}%
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                "{currentPrompt.optionB}"
              </p>
            </div>

            {isRevealed && (
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-4 border border-slate-800">
                <div className="h-full bg-purple-500 transition-all duration-700" style={{ width: `${stats.pctB}%` }} />
              </div>
            )}
          </button>
        </div>

        {/* Next Dilemma Button */}
        {isRevealed && (
          <button
            onClick={handleNextPrompt}
            className="mt-1 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
          >
            Next Dilemma ▶
          </button>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-indigo-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">Dilemma Master!</h2>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              {[...players].sort((a, b) => b.score - a.score).map((p, rank) => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">#{rank + 1} {p.name}</span>
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
