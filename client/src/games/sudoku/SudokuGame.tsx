// client/src/games/sudoku/SudokuGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Timer, RotateCcw, Edit3, Trash2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface SudokuGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

// Pre-tested valid Sudoku puzzle and solution
const INITIAL_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export const SudokuGame: React.FC<SudokuGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
  multiplayerData,
  onExit
}) => {
  const [grid, setGrid] = useState<number[][]>(() => INITIAL_PUZZLE.map(r => [...r]));
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Check victory
  const checkCompletion = (currentGrid: number[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentGrid[r][c] !== SOLUTION[r][c]) return false;
      }
    }
    return true;
  };

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({ r, c });
    sound.play('click');
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameOver) return;
    const { r, c } = selectedCell;

    // Fixed original cells cannot be changed
    if (INITIAL_PUZZLE[r][c] !== 0) return;

    const isCorrect = SOLUTION[r][c] === num;
    if (isCorrect) {
      sound.play('win');
      const newGrid = grid.map(row => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);

      if (checkCompletion(newGrid)) {
        setHasWon(true);
        setGameOver(true);
        recordGameResult('win');
        confetti({ particleCount: 70, spread: 80 });
      }
    } else {
      sound.play('loss');
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 3) {
        setGameOver(true);
        recordGameResult('loss');
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell || gameOver) return;
    const { r, c } = selectedCell;
    if (INITIAL_PUZZLE[r][c] !== 0) return;

    sound.play('click');
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = 0;
    setGrid(newGrid);
  };

  const handleRematch = () => {
    setGrid(INITIAL_PUZZLE.map(r => [...r]));
    setSelectedCell(null);
    setMistakes(0);
    setSeconds(0);
    setGameOver(false);
    setHasWon(false);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(99,102,241,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black tracking-wider text-indigo-400 uppercase">
              Classic Sudoku Master
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              {formatTime(seconds)}
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Mistakes: {mistakes}/3
            </div>
          </div>
        </div>

        {/* 9x9 Sudoku Board */}
        <div className="grid grid-cols-9 gap-0.5 bg-indigo-900/60 p-1 rounded-2xl border-2 border-indigo-500/60 shadow-2xl">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isFixed = INITIAL_PUZZLE[r][c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isInSelectedRowCol = selectedCell?.r === r || selectedCell?.c === c;

              // 3x3 block borders
              const borderClasses = `
                ${(c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-indigo-400/80' : ''}
                ${(r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-indigo-400/80' : ''}
              `;

              let bgClass = 'bg-slate-950';
              if (isSelected) bgClass = 'bg-indigo-600 text-white ring-2 ring-indigo-300 z-10';
              else if (isInSelectedRowCol) bgClass = 'bg-slate-900';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono text-sm sm:text-base font-black transition-all ${borderClasses} ${bgClass} ${
                    isFixed ? 'text-indigo-300 font-bold' : 'text-emerald-400'
                  }`}
                >
                  {val !== 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>

        {/* Number Pad (1–9 + Erase) */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-black text-sm sm:text-base hover:bg-indigo-600 hover:border-indigo-400 active:scale-95 transition-all shadow"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleErase}
            className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl bg-slate-900 border border-slate-700 text-rose-400 flex items-center justify-center hover:bg-rose-950 active:scale-95 transition-all shadow"
            title="Erase"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-indigo-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">
              {hasWon ? 'Sudoku Solved! 🎉' : 'Too Many Mistakes!'}
            </h2>
            <div className="text-xs text-slate-300">
              Time elapsed: <strong className="text-indigo-400 font-mono">{formatTime(seconds)}</strong>
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
