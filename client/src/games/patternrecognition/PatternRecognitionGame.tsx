// client/src/games/patternrecognition/PatternRecognitionGame.tsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Network, Trophy, Sparkles, CheckCircle2, XCircle, Zap, Bot } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';

interface PatternItem {
  id: number;
  type: 'sequence' | 'symbols' | 'grid';
  title: string;
  sequence: string[];
  options: string[];
  answer: string;
  explanation: string;
}

const PATTERNS: PatternItem[] = [
  {
    id: 1,
    type: 'sequence',
    title: 'Double Trouble',
    sequence: ['2', '6', '14', '30', '62', '?'],
    options: ['124', '126', '128', '132'],
    answer: '126',
    explanation: 'Rule: Each term is multiplied by 2 and adds 2 (x*2 + 2).'
  },
  {
    id: 2,
    type: 'symbols',
    title: 'Orbital Shift',
    sequence: ['▲', '▶', '▼', '◀', '▲', '?'],
    options: ['▲', '▶', '▼', '◀'],
    answer: '▶',
    explanation: 'Rule: Clockwise rotation by 90 degrees on each step.'
  },
  {
    id: 3,
    type: 'sequence',
    title: 'Square Stepper',
    sequence: ['1', '4', '9', '16', '25', '?'],
    options: ['30', '34', '36', '49'],
    answer: '36',
    explanation: 'Rule: Consecutive square numbers (1², 2², 3², 4², 5², 6²).'
  },
  {
    id: 4,
    type: 'symbols',
    title: 'Chromatic Pulse',
    sequence: ['🔴', '🔷', '🔴', '🔷', '🔷', '🔴', '🔷', '🔷', '?'],
    options: ['🔴', '🔷', '🔶', '🟢'],
    answer: '🔷',
    explanation: 'Rule: The number of blue diamonds increases by 1 after each red circle.'
  },
  {
    id: 5,
    type: 'sequence',
    title: 'Fibonacci Harmony',
    sequence: ['1', '1', '2', '3', '5', '8', '13', '?'],
    options: ['18', '20', '21', '24'],
    answer: '21',
    explanation: 'Rule: Sum of the two preceding numbers.'
  },
  {
    id: 6,
    type: 'symbols',
    title: 'Dice Dots Sequence',
    sequence: ['⚀', '⚂', '⚄', '⚁', '⚃', '?'],
    options: ['⚀', '⚅', '⚂', '⚄'],
    answer: '⚅',
    explanation: 'Rule: Alternating sequence of odds (1, 3, 5) followed by evens (2, 4, 6).'
  },
  {
    id: 7,
    type: 'sequence',
    title: 'Prime Progression',
    sequence: ['2', '3', '5', '7', '11', '13', '?'],
    options: ['15', '17', '19', '21'],
    answer: '17',
    explanation: 'Rule: Sequence of consecutive prime numbers.'
  },
  {
    id: 8,
    type: 'symbols',
    title: 'Phase Cycling',
    sequence: ['🌑', '🌓', '🌕', '🌗', '🌑', '?'],
    options: ['🌓', '🌕', '🌒', '🌑'],
    answer: '🌓',
    explanation: 'Rule: Repeating lunar phase cycle from New Moon to Full Moon.'
  }
];

interface PatternRecognitionGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const PatternRecognitionGame: React.FC<PatternRecognitionGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [botScore, setBotScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const pattern = PATTERNS[currentIndex];
  const socket = getSocket();
  const roomId = multiplayerData?.roomId;
  const isMultiplayer = Boolean(roomId && mode !== 'bot');

  useEffect(() => {
    if (gameOver || selectedAnswer !== null) return;

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
  }, [currentIndex, gameOver, selectedAnswer]);

  useEffect(() => {
    if (gameOver || isMultiplayer || selectedAnswer !== null) return;
    const botTimeout = setTimeout(() => {
      if (Math.random() < 0.78) {
        setBotScore(b => b + 100);
      }
    }, Math.random() * 4000 + 2000);

    return () => clearTimeout(botTimeout);
  }, [currentIndex, gameOver, selectedAnswer, isMultiplayer]);

  const handleTimeout = () => {
    sound.play('loss');
    setStreak(0);
    setFeedback('wrong');
    setTimeout(() => {
      nextPattern();
    }, 1200);
  };

  const handleSelect = (opt: string) => {
    if (selectedAnswer !== null || gameOver) return;
    setSelectedAnswer(opt);

    if (opt === pattern.answer) {
      sound.play('win');
      setFeedback('correct');
      const pts = 100 + streak * 20 + timeLeft * 5;
      setScore(s => s + pts);
      setStreak(st => st + 1);
    } else {
      sound.play('loss');
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      nextPattern();
    }, 1200);
  };

  const nextPattern = () => {
    if (currentIndex + 1 >= PATTERNS.length) {
      setGameOver(true);
      sound.play('win');
      confetti({ particleCount: 75, spread: 65 });
      recordGameResult(score >= botScore ? 'win' : 'loss');
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setFeedback(null);
    setTimeLeft(12);
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setBotScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setFeedback(null);
    setTimeLeft(12);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] p-4 text-white max-w-xl mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900/90 p-4 rounded-3xl border border-cyan-500/30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
              Pattern Recognition
            </h2>
            <div className="text-xs text-slate-400 font-medium">
              Puzzle {currentIndex + 1} / {PATTERNS.length} • {pattern.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">You</span>
            <span className="text-xl font-black text-cyan-400">{score}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
              <Bot className="w-3 h-3 text-amber-400" /> Rival
            </span>
            <span className="text-xl font-black text-amber-400">{botScore}</span>
          </div>
        </div>
      </div>

      {/* Arena */}
      <div className="w-full relative bg-slate-950/90 rounded-3xl border border-cyan-500/30 p-6 flex flex-col items-center shadow-2xl backdrop-blur-xl">
        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 mb-6 overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-1000"
            style={{ width: `${(timeLeft / 12) * 100}%` }}
          />
        </div>

        {/* Sequence Display */}
        <div className="w-full py-8 px-4 bg-slate-900/80 rounded-2xl border border-slate-800/80 mb-6 flex flex-wrap items-center justify-center gap-3 shadow-inner">
          {pattern.sequence.map((item, idx) => (
            <div
              key={idx}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 transition-all ${
                item === '?'
                  ? 'border-dashed border-cyan-400 bg-cyan-950/30 text-cyan-300 animate-pulse'
                  : 'border-slate-700 bg-slate-850 text-slate-100 shadow-md'
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {feedback && (
          <div className="mb-4 text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-center animate-fade-in w-full">
            <span className="font-bold text-cyan-400">{pattern.explanation}</span>
          </div>
        )}

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {pattern.options.map((opt, idx) => {
            let style = 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white';
            if (selectedAnswer !== null) {
              if (opt === pattern.answer) {
                style = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30';
              } else if (opt === selectedAnswer) {
                style = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/30';
              } else {
                style = 'bg-slate-900/40 text-slate-600 border-slate-900';
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null || gameOver}
                onClick={() => handleSelect(opt)}
                className={`py-4 rounded-2xl font-black text-xl border-2 transition-all transform active:scale-95 flex items-center justify-center ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Over modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/40 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-500 flex items-center justify-center text-slate-950">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-1">
              {score >= botScore ? 'MASTER PATTERN SOLVER!' : 'CHALLENGE COMPLETE!'}
            </h3>
            <p className="text-slate-400 text-xs mb-4">IQ & Inductive Reasoning test finished</p>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Your Score</span>
                <span className="text-2xl font-black text-cyan-400">{score}</span>
              </div>
              <div className="w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Rival Score</span>
                <span className="text-2xl font-black text-amber-400">{botScore}</span>
              </div>
            </div>

            <button
              onClick={restart}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 font-bold rounded-2xl shadow-lg shadow-cyan-500/30 text-white transition-all active:scale-95 text-sm"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatternRecognitionGame;
