// client/src/games/bullsandcows/BullsAndCowsGame.tsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, HelpCircle, RotateCcw, Send, Sparkles, Hash } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface BullsAndCowsGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface Attempt {
  guess: string;
  bulls: number;
  cows: number;
}

function generateSecretNumber(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  // First digit non-zero
  const nonZero = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const first = nonZero[Math.floor(Math.random() * nonZero.length)];
  digits.splice(digits.indexOf(first), 1);

  const remaining = digits.sort(() => Math.random() - 0.5).slice(0, 3);
  return first + remaining.join('');
}

export const BullsAndCowsGame: React.FC<BullsAndCowsGameProps> = ({
  mode,
  onExit
}) => {
  const [secretNum, setSecretNum] = useState<string>(() => generateSecretNumber());
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameOver) return;

    const guess = inputVal.trim();
    if (guess.length !== 4 || !/^\d{4}$/.test(guess)) {
      setErrorMsg('Must enter exactly 4 numeric digits!');
      sound.play('loss');
      return;
    }

    // Check unique digits
    const unique = new Set(guess.split(''));
    if (unique.size !== 4) {
      setErrorMsg('Digits must be all unique with no repeats!');
      sound.play('loss');
      return;
    }

    setErrorMsg(null);
    setInputVal('');

    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {
      if (guess[i] === secretNum[i]) {
        bulls++;
      } else if (secretNum.includes(guess[i])) {
        cows++;
      }
    }

    const nextAttempts = [...attempts, { guess, bulls, cows }];
    setAttempts(nextAttempts);

    if (bulls === 4) {
      sound.play('win');
      confetti({ particleCount: 70, spread: 80 });
      setHasWon(true);
      setGameOver(true);
      recordGameResult('win');
    } else if (nextAttempts.length >= 8) {
      sound.play('loss');
      setGameOver(true);
      recordGameResult('loss');
    } else {
      sound.play('move');
    }
  };

  const handleRematch = () => {
    setSecretNum(generateSecretNumber());
    setAttempts([]);
    setInputVal('');
    setErrorMsg(null);
    setGameOver(false);
    setHasWon(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
              Bulls and Cows (4 Unique Digits)
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            Attempts: {attempts.length} / 8
          </span>
        </div>

        {/* Input Form */}
        {!gameOver && (
          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center gap-2">
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={inputVal}
                onChange={e => setInputVal(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 4 unique digits (e.g. 5821)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-center text-lg font-black tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5" /> Guess
              </button>
            </div>
            {errorMsg && <div className="text-xs text-rose-400 font-bold">{errorMsg}</div>}
          </form>
        )}

        {/* Attempts Log */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Attempt History:
          </div>
          {attempts.length === 0 ? (
            <div className="text-xs text-slate-500 italic text-center py-4">
              Enter your first guess above!
            </div>
          ) : (
            attempts.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs sm:text-sm font-mono"
              >
                <span className="text-slate-500 font-bold">#{idx + 1}</span>
                <span className="font-black text-white tracking-widest">{att.guess}</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">🐂 {att.bulls} Bull{att.bulls !== 1 && 's'}</span>
                  <span className="text-amber-400 font-bold">🐄 {att.cows} Cow{att.cows !== 1 && 's'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">
              {hasWon ? '4 Bulls! Code Breached! 🎉' : 'Out of Attempts!'}
            </h2>
            <div className="text-xs text-slate-300">
              The secret number was: <strong className="text-emerald-400 font-mono text-base">{secretNum}</strong>
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
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
