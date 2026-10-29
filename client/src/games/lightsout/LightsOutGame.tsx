// client/src/games/lightsout/LightsOutGame.tsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, RotateCcw, Award, Zap, Sparkles } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface LightsOutGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const LightsOutGame: React.FC<LightsOutGameProps> = ({
  mode,
  multiplayerData,
  onExit
}) => {
  const [gridSize, setGridSize] = useState<number>(5);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [won, setWon] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const socket = getSocket();
  const roomId = multiplayerData?.roomId;

  const toggleCellInGrid = (g: boolean[][], r: number, c: number, size: number) => {
    const dirs = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        g[nr][nc] = !g[nr][nc];
      }
    }
  };

  const isAllOff = (g: boolean[][], size: number) => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (g[r][c]) return false;
      }
    }
    return true;
  };

  // Initialize a solvable puzzle
  const initGame = (size = gridSize, diff = difficulty) => {
    const newGrid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
    const clickCount = diff === 'easy' ? 4 : diff === 'medium' ? 8 : 14;

    for (let k = 0; k < clickCount; k++) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      toggleCellInGrid(newGrid, r, c, size);
    }

    if (isAllOff(newGrid, size)) {
      toggleCellInGrid(newGrid, Math.floor(size / 2), Math.floor(size / 2), size);
    }

    setGrid(newGrid);
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    initGame();
  }, [gridSize, difficulty]);

  // Multiplayer socket listener
  useEffect(() => {
    if (!socket || !roomId) return;
    const handleAction = (data: any) => {
      if (data.type === 'LIGHTS_OUT_SYNC') {
        setGrid(data.grid);
        setGridSize(data.gridSize);
        setMoves(0);
        setWon(false);
      } else if (data.type === 'LIGHTS_OUT_TOGGLE') {
        toggleCell(data.r, data.c, false);
      }
    };
    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [socket, roomId, grid]);

  const toggleCell = (r: number, c: number, isLocal = true) => {
    if (won) return;
    sound.play('click');
    const newGrid = grid.map(row => [...row]);
    toggleCellInGrid(newGrid, r, c, gridSize);
    setGrid(newGrid);
    setMoves(prev => prev + 1);

    if (isLocal && socket && roomId) {
      socket.emit('game_action', {
        roomId,
        type: 'LIGHTS_OUT_TOGGLE',
        r,
        c
      });
    }

    if (isAllOff(newGrid, gridSize)) {
      setWon(true);
      sound.play('win');
      confetti({ particleCount: 70, spread: 60 });
      recordGameResult('win');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[560px] p-4 text-white max-w-xl mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900/80 p-3 rounded-2xl border border-cyan-500/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              Lights Out
            </h2>
            <p className="text-xs text-slate-400">Turn off all glowing circuits</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Moves</span>
            <span className="font-black text-xl text-yellow-400">{moves}</span>
          </div>

          <button
            onClick={() => initGame()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Restart Puzzle"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-4">
        {(['easy', 'medium', 'hard'] as const).map(d => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              setGridSize(d === 'easy' ? 4 : 5);
            }}
            className={`px-3 py-1 text-xs rounded-lg font-bold capitalize transition-all ${
              difficulty === d
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Game Board */}
      <div className="relative p-6 bg-slate-950/90 rounded-3xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-900/30 backdrop-blur-xl">
        {won && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center animate-fade-in p-6 text-center backdrop-blur-md">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-yellow-500/40 animate-bounce">
              <Award className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 mb-1">
              BLACKOUT COMPLETE!
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              You turned off all the lights in <span className="font-bold text-cyan-400">{moves} moves</span>!
            </p>
            <button
              onClick={() => initGame()}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold rounded-xl shadow-lg shadow-cyan-500/30 active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Next Puzzle
            </button>
          </div>
        )}

        <div
          className="grid gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {grid.map((row, r) =>
            row.map((isOn, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => toggleCell(r, c)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-300 flex items-center justify-center border-2 focus:outline-none transform active:scale-90 ${
                  isOn
                    ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 border-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.8)] text-slate-950'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-700 hover:bg-slate-850'
                }`}
              >
                <Lightbulb
                  className={`w-7 h-7 transition-all ${
                    isOn ? 'text-amber-950 filter drop-shadow animate-pulse' : 'text-slate-700'
                  }`}
                />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Rules & Help */}
      <div className="mt-5 text-center max-w-sm text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <p className="font-semibold text-slate-300 mb-1">💡 How to Play</p>
        Clicking any light toggles it and its 4 adjacent neighbors (up, down, left, right).
        Plan your moves to turn every circuit completely off!
      </div>
    </div>
  );
};
export default LightsOutGame;
