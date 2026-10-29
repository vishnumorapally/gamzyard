// client/src/games/mastermind/MastermindGame.tsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, HelpCircle, RotateCcw, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface MastermindGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

type PegColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

const AVAILABLE_COLORS: PegColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const COLOR_CLASSES: Record<PegColor, string> = {
  red: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]',
  blue: 'bg-blue-500 shadow-[0_0_10px_#3b82f6]',
  green: 'bg-emerald-500 shadow-[0_0_10px_#10b981]',
  yellow: 'bg-amber-400 shadow-[0_0_10px_#facc15]',
  purple: 'bg-purple-500 shadow-[0_0_10px_#a855f7]',
  orange: 'bg-orange-500 shadow-[0_0_10px_#f97316]'
};

interface GuessRow {
  pegs: (PegColor | null)[];
  blackPegs: number; // exact match
  whitePegs: number; // color match only
}

function generateSecretCode(): PegColor[] {
  const code: PegColor[] = [];
  for (let i = 0; i < 4; i++) {
    code.push(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
  }
  return code;
}

export const MastermindGame: React.FC<MastermindGameProps> = ({
  mode,
  onExit
}) => {
  const [secretCode, setSecretCode] = useState<PegColor[]>(() => generateSecretCode());
  const [rows, setRows] = useState<GuessRow[]>([]);
  const [currentRow, setCurrentRow] = useState<(PegColor | null)[]>([null, null, null, null]);
  const [selectedPegColor, setSelectedPegColor] = useState<PegColor>('red');
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const handleSlotClick = (slotIdx: number) => {
    if (gameOver) return;
    sound.play('click');
    const nextRow = [...currentRow];
    nextRow[slotIdx] = selectedPegColor;
    setCurrentRow(nextRow);
  };

  const handleSubmitGuess = () => {
    if (currentRow.some(p => p === null) || gameOver) return;

    sound.play('move');
    const guess = currentRow as PegColor[];

    // Calculate Black & White key pegs
    let black = 0;
    let white = 0;

    const secretCopy: (PegColor | null)[] = [...secretCode];
    const guessCopy: (PegColor | null)[] = [...guess];

    // First pass: exact matches (Black)
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        black++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    // Second pass: color matches in other positions (White)
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] !== null) {
        const foundIdx = secretCopy.findIndex(c => c === guessCopy[i]);
        if (foundIdx !== -1) {
          white++;
          secretCopy[foundIdx] = null;
        }
      }
    }

    const newRows = [...rows, { pegs: guess, blackPegs: black, whitePegs: white }];
    setRows(newRows);
    setCurrentRow([null, null, null, null]);

    if (black === 4) {
      sound.play('win');
      confetti({ particleCount: 70, spread: 80 });
      setHasWon(true);
      setGameOver(true);
      recordGameResult('win');
    } else if (newRows.length >= 10) {
      sound.play('loss');
      setGameOver(true);
      recordGameResult('loss');
    }
  };

  const handleRematch = () => {
    setSecretCode(generateSecretCode());
    setRows([]);
    setCurrentRow([null, null, null, null]);
    setGameOver(false);
    setHasWon(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
              Mastermind Codebreaker
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-300">
            Attempts: {rows.length} / 10
          </div>
        </div>

        {/* Board Rows Area */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
          {/* Previous attempts */}
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center justify-between p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-slate-500 font-bold w-5">#{rIdx + 1}</span>
              <div className="flex items-center gap-2">
                {row.pegs.map((peg, pIdx) => (
                  <div
                    key={pIdx}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-700 ${peg ? COLOR_CLASSES[peg] : 'bg-slate-800'}`}
                  />
                ))}
              </div>
              {/* Feedback Pegs (Black / White) */}
              <div className="flex items-center gap-1 w-20 justify-end">
                {Array.from({ length: row.blackPegs }).map((_, i) => (
                  <div key={`b-${i}`} className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-400 shadow" title="Exact match" />
                ))}
                {Array.from({ length: row.whitePegs }).map((_, i) => (
                  <div key={`w-${i}`} className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400 shadow" title="Color match" />
                ))}
              </div>
            </div>
          ))}

          {/* Current Guessing Row */}
          {!gameOver && (
            <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border-2 border-dashed border-amber-500/50">
              <span className="text-xs font-mono text-amber-400 font-bold w-5">#{rows.length + 1}</span>
              <div className="flex items-center gap-2">
                {currentRow.map((peg, slotIdx) => (
                  <button
                    key={slotIdx}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                      peg ? COLOR_CLASSES[peg] : 'bg-slate-900 border-slate-600 hover:border-amber-400'
                    }`}
                  >
                    {!peg && <span className="text-xs text-slate-500">+</span>}
                  </button>
                ))}
              </div>
              <button
                disabled={currentRow.some(p => p === null)}
                onClick={handleSubmitGuess}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shadow disabled:opacity-40"
              >
                Test
              </button>
            </div>
          )}
        </div>

        {/* Color Palette Selector */}
        {!gameOver && (
          <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-bold px-1">Pick Color:</span>
            {AVAILABLE_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setSelectedPegColor(c)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-transform ${COLOR_CLASSES[c]} ${
                  selectedPegColor === c ? 'scale-125 border-white ring-2 ring-white' : 'border-transparent active:scale-95'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">
              {hasWon ? 'Code Cracked! 🎉' : 'Code Remained Secret!'}
            </h2>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">The secret code was:</span>
              <div className="flex items-center gap-2 mt-1">
                {secretCode.map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${COLOR_CLASSES[c]}`} />
                ))}
              </div>
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
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
