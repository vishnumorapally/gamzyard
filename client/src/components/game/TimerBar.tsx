// client/src/components/game/TimerBar.tsx
import React from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TimerBarProps {
  timeLeft: number;
  percent: number;
  isMyTurn: boolean;
  isBotThinking?: boolean;
  gameOver: boolean;
  statusText?: string;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  timeLeft,
  percent,
  isMyTurn,
  isBotThinking,
  gameOver,
  statusText
}) => {
  const isDanger = timeLeft <= 7 && !gameOver;

  const getBarColor = () => {
    if (isDanger) return 'from-rose-600 to-red-500 shadow-[0_0_12px_#f43f5e]';
    if (timeLeft <= 15) return 'from-amber-500 to-yellow-400 shadow-[0_0_12px_#ffbe0b]';
    return isMyTurn
      ? 'from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_#00f2fe]'
      : 'from-purple-500 to-indigo-500 shadow-[0_0_12px_#9d4edd]';
  };

  return (
    <div className="w-full bg-[#0d0f1f]/90 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-gray-800 shadow-xl mb-3">
      {/* Top Labels */}
      <div className="flex items-center justify-between mb-2">
        {/* Left Turn Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isMyTurn && !gameOver ? 'bg-cyan-400 animate-ping' : 'bg-gray-500'}`} />
          <span className="text-xs font-black uppercase tracking-wider text-gray-200">
            {gameOver
              ? 'Game Concluded'
              : isBotThinking
              ? 'Bot Thinking...'
              : isMyTurn
              ? 'Your Turn'
              : "Opponent's Turn"}
          </span>
          {statusText && (
            <span className="text-xs text-amber-400 font-bold ml-1">
              • {statusText}
            </span>
          )}
        </div>

        {/* Right Seconds Chrono */}
        {!gameOver ? (
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-black border transition-all ${
              isDanger
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-gray-900 border-gray-700 text-white'
            }`}
          >
            {isDanger ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-xs text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Finished</span>
          </div>
        )}
      </div>

      {/* Depleting Progress Bar */}
      {!gameOver && (
        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800/80 p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-300 ease-linear`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};
