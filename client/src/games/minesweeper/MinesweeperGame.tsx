// client/src/games/minesweeper/MinesweeperGame.tsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Timer, Flag, Bomb, RotateCcw, Sparkles } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface MinesweeperGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;

function createEmptyGrid(): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      });
    }
    grid.push(row);
  }
  return grid;
}

function plantMines(grid: Cell[][], safeR: number, safeC: number) {
  let planted = 0;
  while (planted < TOTAL_MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!grid[r][c].isMine && !(r === safeR && c === safeC)) {
      grid[r][c].isMine = true;
      planted++;
    }
  }

  // Calculate neighbor counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].isMine) {
            count++;
          }
        }
      }
      grid[r][c].neighborMines = count;
    }
  }
}

export const MinesweeperGame: React.FC<MinesweeperGameProps> = ({
  mode,
  onExit
}) => {
  const [grid, setGrid] = useState<Cell[][]>(() => createEmptyGrid());
  const [firstClickDone, setFirstClickDone] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [flagsCount, setFlagsCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Timer
  useEffect(() => {
    if (!firstClickDone || gameOver) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [firstClickDone, gameOver]);

  // Flood reveal empty spaces
  const revealCell = (r: number, c: number, newGrid: Cell[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    const cell = newGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    if (cell.neighborMines === 0 && !cell.isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(r + dr, c + dc, newGrid);
        }
      }
    }
  };

  const handleCellAction = (r: number, c: number, isRightClick = false) => {
    if (gameOver) return;
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const cell = newGrid[r][c];
    if (cell.isRevealed) return;

    if (isRightClick || flagMode) {
      sound.play('click');
      cell.isFlagged = !cell.isFlagged;
      setFlagsCount(prev => (cell.isFlagged ? prev + 1 : prev - 1));
      setGrid(newGrid);
      return;
    }

    if (cell.isFlagged) return;

    if (!firstClickDone) {
      plantMines(newGrid, r, c);
      setFirstClickDone(true);
    }

    if (cell.isMine) {
      // Game Over: reveal all mines
      sound.play('loss');
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (newGrid[row][col].isMine) newGrid[row][col].isRevealed = true;
        }
      }
      setGrid(newGrid);
      setGameOver(true);
      recordGameResult('loss');
      return;
    }

    sound.play('move');
    revealCell(r, c, newGrid);
    setGrid(newGrid);

    // Check Win
    let unrevealedSafeCells = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newGrid[row][col].isMine && !newGrid[row][col].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      sound.play('win');
      confetti({ particleCount: 70, spread: 80 });
      setHasWon(true);
      setGameOver(true);
      recordGameResult('win');
    }
  };

  const handleRematch = () => {
    setGrid(createEmptyGrid());
    setFirstClickDone(false);
    setFlagsCount(0);
    setSeconds(0);
    setGameOver(false);
    setHasWon(false);
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return 'text-blue-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-rose-400';
      case 4: return 'text-indigo-400';
      case 5: return 'text-amber-400';
      default: return 'text-purple-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Bomb className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-black tracking-wider text-slate-300 uppercase">
              Classic Minesweeper
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-rose-400">
              <Bomb className="w-3.5 h-3.5" />
              Mines: {Math.max(0, TOTAL_MINES - flagsCount)}
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300">
              <Timer className="w-3.5 h-3.5 text-slate-400" />
              {seconds}s
            </div>
          </div>
        </div>

        {/* Center Control Toolbar */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleRematch}
            className="text-2xl p-2 rounded-2xl bg-slate-900 border border-slate-700 hover:scale-110 active:scale-95 transition-transform"
          >
            {hasWon ? '😎' : gameOver ? '😵' : '🙂'}
          </button>
          <button
            onClick={() => setFlagMode(!flagMode)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              flagMode
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-400'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> Flag Mode: {flagMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* 9x9 Grid */}
        <div className="grid grid-cols-9 gap-1 bg-slate-900 p-2 rounded-2xl border-2 border-slate-700 shadow-inner">
          {grid.map(row =>
            row.map(cell => (
              <button
                key={`${cell.r}-${cell.c}`}
                onClick={() => handleCellAction(cell.r, cell.c)}
                onContextMenu={e => {
                  e.preventDefault();
                  handleCellAction(cell.r, cell.c, true);
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-mono font-black text-xs sm:text-sm flex items-center justify-center transition-all ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-rose-600 text-white animate-bounce'
                      : 'bg-slate-950 text-slate-300 shadow-inner'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 active:scale-95'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  '🚩'
                ) : (
                  ''
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-rose-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">
              {hasWon ? 'Minefield Cleared! 🎉' : 'Detonation! 💥'}
            </h2>
            <div className="text-xs text-slate-300">
              Clear time: <strong className="text-slate-100 font-mono">{seconds} seconds</strong>
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="rose"
            />
          </div>
        </div>
      )}
    </div>
  );
};
