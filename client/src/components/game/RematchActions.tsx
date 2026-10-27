// client/src/components/game/RematchActions.tsx
import React, { useState, useEffect } from 'react';
import { RotateCw, LogOut, Swords, UserX } from 'lucide-react';
import { GameMode, MultiplayerMatchData } from '../../types';
import { getSocket } from '../../services/socket';
import { sound } from '../../services/sound';

export interface RematchActionsProps {
  gameOver: boolean;
  mode: GameMode;
  multiplayerData?: MultiplayerMatchData | null;
  onReset: () => void;
  onExit: () => void;
  themeColor?: 'purple' | 'cyan' | 'amber' | 'rose' | 'emerald';
  maxWidthClass?: string;
  opponentLeft?: boolean;
}

export const RematchActions: React.FC<RematchActionsProps> = ({
  gameOver,
  mode,
  multiplayerData,
  onReset,
  onExit,
  themeColor = 'purple',
  maxWidthClass = 'max-w-[340px]',
  opponentLeft: propOpponentLeft = false
}) => {
  const [isWaitingForOtherPlayer, setIsWaitingForOtherPlayer] = useState<boolean>(false);
  const [opponentLeftState, setOpponentLeftState] = useState<boolean>(propOpponentLeft);
  const [rematchOfferedBy, setRematchOfferedBy] = useState<string | null>(null);

  // Sync prop if parent passes opponentLeft
  useEffect(() => {
    if (propOpponentLeft) {
      setOpponentLeftState(true);
      setIsWaitingForOtherPlayer(false);
      setRematchOfferedBy(null);
    }
  }, [propOpponentLeft]);

  // Reset waiting state when game restarts or is no longer gameOver
  useEffect(() => {
    if (!gameOver) {
      setIsWaitingForOtherPlayer(false);
      setRematchOfferedBy(null);
    }
  }, [gameOver]);

  // Socket listeners for rematch negotiation and opponent leave
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;

    const socket = getSocket();

    const handleOpponentLeft = (data: { leavingName?: string; message?: string }) => {
      setOpponentLeftState(true);
      setIsWaitingForOtherPlayer(false);
      setRematchOfferedBy(null);
    };

    const handleRematchOffered = (data: { from: string; fromName?: string }) => {
      const opponentName = data.fromName || multiplayerData?.opponent?.name || 'Opponent';
      setRematchOfferedBy(opponentName);
      sound.play('match');
    };

    const handleRematchStarted = () => {
      setIsWaitingForOtherPlayer(false);
      setRematchOfferedBy(null);
      setOpponentLeftState(false);
      onReset();
      sound.play('match');
    };

    socket.on('opponent_left', handleOpponentLeft);
    socket.on('rematch_offered', handleRematchOffered);
    socket.on('rematch_started', handleRematchStarted);

    return () => {
      socket.off('opponent_left', handleOpponentLeft);
      socket.off('rematch_offered', handleRematchOffered);
      socket.off('rematch_started', handleRematchStarted);
    };
  }, [mode, multiplayerData, onReset]);

  const handlePlayAgain = () => {
    sound.play('click');
    if (mode === 'bot') {
      onReset();
      return;
    }

    if (!multiplayerData || opponentLeftState) return;

    // Local player requests rematch
    const socket = getSocket();
    socket.emit('request_rematch', { roomId: multiplayerData.roomId });
    setIsWaitingForOtherPlayer(true);
    setRematchOfferedBy(null);
  };

  const getThemeClasses = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-neon-cyan';
      case 'amber':
        return 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg';
      case 'rose':
        return 'bg-gradient-to-r from-rose-600 to-red-600 shadow-lg';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-neon-emerald';
      case 'purple':
      default:
        return 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-neon-purple';
    }
  };

  const hasOpponentLeft = opponentLeftState || propOpponentLeft;

  return (
    <div className={`relative flex items-center space-x-3 mt-5 w-full ${maxWidthClass}`}>
      {gameOver && (
        <>
          {/* Case 1: Opponent has left after the game or disconnected */}
          {hasOpponentLeft && mode !== 'bot' ? (
            <button
              disabled
              className="flex-1 py-3 px-4 bg-gray-900/90 border border-rose-500/40 text-rose-400/90 font-extrabold rounded-xl cursor-not-allowed opacity-80 flex items-center justify-center space-x-2 text-xs sm:text-sm tracking-wider select-none"
              title="The other player has left the match."
            >
              <UserX className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Player Left</span>
            </button>
          ) : isWaitingForOtherPlayer && mode !== 'bot' ? (
            /* Case 2: Local player clicked Play Again and is waiting */
            <button
              disabled
              className="flex-1 py-3 px-4 bg-purple-950/80 border border-purple-500/60 text-purple-200 font-extrabold rounded-xl cursor-wait flex items-center justify-center space-x-2 text-xs sm:text-sm tracking-wider animate-pulse shadow-neon-purple select-none"
            >
              <RotateCw className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
              <span>Waiting for other player...</span>
            </button>
          ) : rematchOfferedBy && mode !== 'bot' ? (
            /* Case 3: Other player wants to play again -> show tooltip and Accept button */
            <div className="relative flex-1">
              {/* Tooltip pointing to Accept Rematch */}
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none animate-bounce">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white text-[11px] font-black rounded-full shadow-2xl border border-pink-300/50 whitespace-nowrap">
                  <span className="text-xs">🎮</span>
                  <span>{rematchOfferedBy} wants to play again!</span>
                </div>
                <div className="w-2.5 h-2.5 bg-rose-600 rotate-45 -mt-1 shadow-sm"></div>
              </div>

              <button
                onClick={handlePlayAgain}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl ring-2 ring-pink-400 ring-offset-2 ring-offset-gray-950 shadow-neon-pink active:scale-95 transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 animate-pulse cursor-pointer"
              >
                <Swords className="w-4 h-4 shrink-0" />
                <span>Accept Rematch</span>
              </button>
            </div>
          ) : (
            /* Case 4: Default Play Again button */
            <button
              onClick={handlePlayAgain}
              className={`flex-1 py-3 px-4 ${getThemeClasses(themeColor)} hover:brightness-110 text-white font-extrabold rounded-xl active:scale-95 transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer`}
            >
              <RotateCw className="w-4 h-4 shrink-0" />
              <span>Play Again</span>
            </button>
          )}
        </>
      )}

      {/* Exit Game Button (Always accessible) */}
      <button
        onClick={() => {
          sound.play('click');
          onExit();
        }}
        className="flex-1 py-3 px-4 bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-bold rounded-xl border border-gray-700 active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center space-x-1.5 cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span>Exit Game</span>
      </button>
    </div>
  );
};
