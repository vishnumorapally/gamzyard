// client/src/games/twotruthsalie/TwoTruthsLieGame.tsx
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { TwoTruthsSet, getRandomTwoTruths } from './prompts';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface TTLPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
}

interface TwoTruthsLieGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const TwoTruthsLieGame: React.FC<TwoTruthsLieGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [sets, setSets] = useState<TwoTruthsSet[]>(() => getRandomTwoTruths(5));
  const [currentSetIdx, setCurrentSetIdx] = useState(0);

  const initialPlayers: TTLPlayer[] = useMemo(() => {
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
    const list: TTLPlayer[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', isBot: false, score: 0 }
    ];

    const botNames = ['Bramhi Bot', 'Nani AI', 'Pooja AI', 'Mahesh Bot'];
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

  const [players, setPlayers] = useState<TTLPlayer[]>(initialPlayers);
  const [myChoice, setMyChoice] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const currentSet = sets[currentSetIdx] || sets[0];

  const handlePickLie = (index: number) => {
    if (myChoice !== null || isRevealed) return;
    setMyChoice(index);
    sound.play('click');

    const isCorrect = index === currentSet.lieIndex;

    setTimeout(() => {
      setIsRevealed(true);
      if (isCorrect) {
        sound.play('win');
        confetti({ particleCount: 35, spread: 60 });
      } else {
        sound.play('loss');
      }

      // Update scores
      setPlayers(prev =>
        prev.map(p => {
          if (p.id === myPlayerId && isCorrect) {
            return { ...p, score: p.score + 10 };
          }
          if (p.isBot) {
            const botCorrect = Math.random() > 0.45;
            return botCorrect ? { ...p, score: p.score + 10 } : p;
          }
          return p;
        })
      );
    }, 1200);
  };

  const handleNextSet = () => {
    if (currentSetIdx + 1 >= sets.length) {
      setGameOver(true);
      recordGameResult('win');
    } else {
      setCurrentSetIdx(prev => prev + 1);
      setMyChoice(null);
      setIsRevealed(false);
    }
  };

  const handleRematch = () => {
    setSets(getRandomTwoTruths(5));
    setCurrentSetIdx(0);
    setMyChoice(null);
    setIsRevealed(false);
    setGameOver(false);
    setPlayers(initialPlayers);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
              Two Truths and a Lie · Round {currentSetIdx + 1} of {sets.length}
            </span>
          </div>
          <span className="text-xs text-amber-400 font-bold">
            {currentSet.topic}
          </span>
        </div>

        {/* Players Scoreboard */}
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
              <span className="text-xs font-mono font-black text-emerald-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* 3 Statements to inspect */}
        <div className="w-full flex flex-col gap-3 my-2">
          {currentSet.statements.map((stmt, idx) => {
            const isLie = idx === currentSet.lieIndex;
            const isSelected = myChoice === idx;

            let cardStyle = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-emerald-500/50';
            if (isRevealed) {
              if (isLie) {
                cardStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
              } else {
                cardStyle = 'bg-slate-950/60 border-slate-900 text-slate-400 opacity-70';
              }
            } else if (isSelected) {
              cardStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200';
            }

            return (
              <button
                key={idx}
                disabled={isRevealed || myChoice !== null}
                onClick={() => handlePickLie(idx)}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-3 ${cardStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {stmt}
                  </p>
                </div>

                {isRevealed && isLie && (
                  <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs shrink-0 flex items-center gap-1 shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5" /> THIS IS THE LIE!
                  </span>
                )}
                {isRevealed && !isLie && (
                  <span className="text-[11px] font-bold text-emerald-400 shrink-0">
                    ✓ TRUE FACT
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lie Explanation Banner */}
        {isRevealed && (
          <div className="w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-4 text-center animate-fadeIn flex flex-col items-center gap-2">
            <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Fact Unveiled
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              {currentSet.explanation}
            </p>
            <button
              onClick={handleNextSet}
              className="mt-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
            >
              Next Set ▶
            </button>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-emerald-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">Lie Detector Champion!</h2>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              {[...players].sort((a, b) => b.score - a.score).map((p, rank) => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">#{rank + 1} {p.name}</span>
                  <span className="font-mono font-bold text-emerald-400">{p.score} pts</span>
                </div>
              ))}
            </div>
            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="emerald"
            />
          </div>
        </div>
      )}
    </div>
  );
};
