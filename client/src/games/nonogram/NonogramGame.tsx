// client/src/games/nonogram/NonogramGame.tsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Sparkles, CheckCircle2, Grid } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface NonogramGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

// 5x5 Sword Picture Puzzle
// [0, 0, 1, 0, 0]
// [0, 0, 1, 0, 0]
// [0, 1, 1, 1, 0]
// [0, 0, 1, 0, 0]
// [0, 1, 0, 1, 0]
const PUZZLE_SOLUTION = [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0]
];

const ROW_CLUES = [[1], [1], [3], [1], [1, 1]];
const COL_CLUES = [[0], [1, 1], [4], [1, 1], [0]];

export const NonogramGame: React.FC<NonogramGameProps> = ({
  mode,
  onExit
}) => {
  const [grid, setGrid] = useState<number[][]>([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ]); // 0 = empty, 1 = filled, 2 = crossed (X)
  const [crossMode, setCrossMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleCellClick = (r: number, c: number, isRightClick = false) => {
    if (gameOver) return;
    sound.play('click');

    const next = grid.map(row => [...row]);
    const current = next[r][c];

    if (isRightClick || crossMode) {
      next[r][c] = current === 2 ? 0 : 2;
    } else {
      next[r][c] = current === 1 ? 0 : 1;
    }

    setGrid(next);

    // Verify solution
    let solved = true;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const expected = PUZZLE_SOLUTION[i][j] === 1;
        const actual = next[i][j] === 1;
        if (expected !== actual) {
          solved = false;
          break;
        }
      }
    }

    if (solved) {
      sound.play('win');
      confetti({ particleCount: 70, spread: 80 });
      setGameOver(true);
      recordGameResult('win');
    }
  };

  const handleRematch = () => {
    setGrid([
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]);
    setGameOver(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-teal-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(20,184,166,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-black tracking-wider text-teal-400 uppercase">
              Nonogram (Picross 5x5)
            </span>
          </div>
          <button
            onClick={() => setCrossMode(!crossMode)}
            className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${
              crossMode
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-1 ring-rose-400'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            Mode: {crossMode ? '✖ Cross' : '■ Fill'}
          </button>
        </div>

        {/* Nonogram Grid Container */}
        <div className="flex flex-col items-center p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
          {/* Top Column Clues */}
          <div className="flex ml-16 sm:ml-20 mb-2 gap-1.5">
            {COL_CLUES.map((clues, c) => (
              <div
                key={c}
                className="w-10 sm:w-12 h-14 flex flex-col items-center justify-end font-mono text-[11px] font-black text-teal-300 pb-1"
              >
                {clues.map((num, i) => (
                  <span key={i}>{num > 0 ? num : '-'}</span>
                ))}
              </div>
            ))}
          </div>

          {/* Rows */}
          {grid.map((row, r) => (
            <div key={r} className="flex items-center gap-1.5 mb-1.5">
              {/* Left Row Clue */}
              <div className="w-16 sm:w-20 h-10 sm:h-12 flex items-center justify-end gap-1.5 font-mono text-[11px] font-black text-teal-300 pr-2">
                {ROW_CLUES[r].map((num, i) => (
                  <span key={i}>{num}</span>
                ))}
              </div>

              {/* 5 Row Cells */}
              {row.map((val, c) => (
                <button
                  key={c}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={e => {
                    e.preventDefault();
                    handleCellClick(r, c, true);
                  }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border font-mono font-black text-base flex items-center justify-center transition-all ${
                    val === 1
                      ? 'bg-teal-500 border-teal-400 text-slate-950 shadow-[0_0_12px_rgba(20,184,166,0.5)]'
                      : val === 2
                      ? 'bg-slate-950 border-slate-800 text-rose-500'
                      : 'bg-slate-950 border-slate-800 text-transparent hover:border-slate-600 active:scale-95'
                  }`}
                >
                  {val === 2 ? '✖' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-teal-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-teal-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Picture Revealed! 🗡️</h2>
            <div className="text-xs text-slate-300">
              You uncovered the legendary <strong className="text-teal-400 font-bold">Hero's Sword</strong>!
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
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
