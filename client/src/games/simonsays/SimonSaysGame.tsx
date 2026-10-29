// client/src/games/simonsays/SimonSaysGame.tsx
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Play, RotateCcw, Volume2, Sparkles, Zap } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface SimonSaysGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

type Color = 'green' | 'red' | 'yellow' | 'blue';

const COLORS: Color[] = ['green', 'red', 'yellow', 'blue'];

const COLOR_CONFIG = {
  green: { label: 'Green', freq: 330, base: 'bg-emerald-600', active: 'bg-emerald-400 shadow-[0_0_30px_#10b981]' },
  red: { label: 'Red', freq: 440, base: 'bg-rose-600', active: 'bg-rose-400 shadow-[0_0_30px_#f43f5e]' },
  yellow: { label: 'Yellow', freq: 554, base: 'bg-amber-500', active: 'bg-amber-300 shadow-[0_0_30px_#facc15]' },
  blue: { label: 'Blue', freq: 659, base: 'bg-blue-600', active: 'bg-blue-400 shadow-[0_0_30px_#3b82f6]' }
};

export const SimonSaysGame: React.FC<SimonSaysGameProps> = ({
  mode,
  onExit
}) => {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerInput, setPlayerInput] = useState<Color[]>([]);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Play audio tone
  const playTone = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio fallback
    }
  };

  const playSequence = (seq: Color[]) => {
    setIsPlayingSeq(true);
    let i = 0;
    const interval = setInterval(() => {
      const color = seq[i];
      setActiveColor(color);
      playTone(COLOR_CONFIG[color].freq);

      setTimeout(() => {
        setActiveColor(null);
      }, 350);

      i++;
      if (i >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPlayingSeq(false);
        }, 400);
      }
    }, 600);
  };

  const startNextRound = (currentSeq: Color[]) => {
    const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerInput([]);

    setTimeout(() => {
      playSequence(newSeq);
    }, 800);
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    startNextRound([]);
  };

  const handlePadClick = (color: Color) => {
    if (isPlayingSeq || gameOver || sequence.length === 0) return;

    setActiveColor(color);
    playTone(COLOR_CONFIG[color].freq);
    setTimeout(() => setActiveColor(null), 250);

    const nextInput = [...playerInput, color];
    setPlayerInput(nextInput);

    const currentIndex = nextInput.length - 1;
    if (color !== sequence[currentIndex]) {
      // Mistake!
      sound.play('loss');
      setGameOver(true);
      recordGameResult('loss');
      return;
    }

    // Full sequence matched!
    if (nextInput.length === sequence.length) {
      sound.play('win');
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) setHighScore(newScore);

      if (newScore % 5 === 0) {
        confetti({ particleCount: 40, spread: 60 });
      }

      startNextRound(sequence);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-purple-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black tracking-wider text-purple-400 uppercase">
              Simon Says · Sequence Memory
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold text-xs">
            <span className="text-purple-300">Level: {score + 1}</span>
            <span className="text-slate-400">High: {highScore}</span>
          </div>
        </div>

        {/* 4 Quadrants Circular Simon Pad */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-slate-900 bg-slate-950 p-2 shadow-2xl flex items-center justify-center my-2">
          <div className="grid grid-cols-2 gap-2 w-full h-full rounded-full overflow-hidden">
            {/* Green (Top-Left) */}
            <button
              disabled={isPlayingSeq}
              onClick={() => handlePadClick('green')}
              className={`rounded-tl-full transition-all duration-150 active:scale-95 ${
                activeColor === 'green' ? COLOR_CONFIG.green.active : COLOR_CONFIG.green.base
              }`}
            />
            {/* Red (Top-Right) */}
            <button
              disabled={isPlayingSeq}
              onClick={() => handlePadClick('red')}
              className={`rounded-tr-full transition-all duration-150 active:scale-95 ${
                activeColor === 'red' ? COLOR_CONFIG.red.active : COLOR_CONFIG.red.base
              }`}
            />
            {/* Yellow (Bottom-Left) */}
            <button
              disabled={isPlayingSeq}
              onClick={() => handlePadClick('yellow')}
              className={`rounded-bl-full transition-all duration-150 active:scale-95 ${
                activeColor === 'yellow' ? COLOR_CONFIG.yellow.active : COLOR_CONFIG.yellow.base
              }`}
            />
            {/* Blue (Bottom-Right) */}
            <button
              disabled={isPlayingSeq}
              onClick={() => handlePadClick('blue')}
              className={`rounded-br-full transition-all duration-150 active:scale-95 ${
                activeColor === 'blue' ? COLOR_CONFIG.blue.active : COLOR_CONFIG.blue.base
              }`}
            />
          </div>

          {/* Center Hub Display */}
          <div className="absolute w-24 h-24 rounded-full bg-slate-950 border-4 border-slate-900 flex flex-col items-center justify-center text-center shadow-xl">
            {sequence.length === 0 ? (
              <button
                onClick={startGame}
                className="text-xs font-black text-purple-400 hover:text-purple-300 uppercase tracking-wider flex flex-col items-center gap-1 active:scale-95"
              >
                <Play className="w-5 h-5 fill-purple-400" />
                START
              </button>
            ) : (
              <>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {isPlayingSeq ? 'WATCH' : 'REPEAT'}
                </span>
                <span className="text-xl font-mono font-black text-white">{score}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-purple-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Sequence Broken!</h2>
            <div className="text-xs text-slate-300">
              You reached level <strong className="text-purple-400 font-mono text-base">{score + 1}</strong>
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              onReset={startGame}
              onExit={onExit}
              themeColor="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
};
