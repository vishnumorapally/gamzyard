// client/src/games/nim/NimGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, User, Bot, Check, AlertCircle } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { NimHeaps, NimMove, getNimBotMove } from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

const INITIAL_HEAPS: NimHeaps = [3, 5, 7];

interface NimGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const NimGame: React.FC<NimGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [heaps, setHeaps] = useState<NimHeaps>(INITIAL_HEAPS);
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const myRole: 'player1' | 'player2' = useMemo(() => {
    if (mode === 'bot') return 'player1';
    return multiplayerData?.yourRole || 'player1';
  }, [mode, multiplayerData]);

  const isMyTurn = mode === 'bot' ? currentTurn === 'player1' : currentTurn === myRole;

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // Turn Timer Hook (30s)
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver,
    isMyTurn,
    turnKey: `${moveCount}-${currentTurn}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (gameOver) return;
      setGameOver(true);
      if (timedOutUser === 'me') {
        const opp = myRole === 'player1' ? 'player2' : 'player1';
        setWinner(opp);
        setEndMessage('⏰ 30s Time Expired! You took too long to move.');
        sound.play('loss');
        recordGameResult('loss');
        if (mode !== 'bot' && multiplayerData) {
          const socket = getSocket();
          socket.emit('player_timeout', {
            roomId: multiplayerData.roomId,
            timedOutPlayerId: multiplayerData.you.socketId
          });
        }
      }
    }
  });

  const handleStickClick = (rowIdx: number, stickIndex: number) => {
    if (!isMyTurn || isBotThinking || gameOver) return;
    sound.play('click');
    const takeCount = heaps[rowIdx] - stickIndex;
    setSelectedRow(rowIdx);
    setSelectedCount(takeCount);
  };

  const handleConfirmTake = () => {
    if (selectedRow === null || selectedCount <= 0 || !isMyTurn || isBotThinking || gameOver) return;
    executeMove(selectedRow, selectedCount, currentTurn);
  };

  const executeMove = useCallback((row: number, count: number, player: 'player1' | 'player2') => {
    sound.play('capture');
    const nextHeaps: NimHeaps = [...heaps];
    nextHeaps[row] -= count;
    setHeaps(nextHeaps);
    setSelectedRow(null);
    setSelectedCount(0);
    setMoveCount(prev => prev + 1);

    // Check if board is now empty: whoever took the last stick WINS!
    const totalRemaining = nextHeaps[0] + nextHeaps[1] + nextHeaps[2];

    if (totalRemaining === 0) {
      setGameOver(true);
      setWinner(player);
      const isMe = player === myRole;
      setEndMessage(isMe ? '🏆 Victory! You took the last stick and conquered Nim!' : '💀 Defeat! Opponent took the last stick.');
      if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
      else { sound.play('loss'); recordGameResult('loss'); }

      if (mode !== 'bot' && multiplayerData) {
        const socket = getSocket();
        socket.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: { row, count, nextHeaps },
          nextTurnState: {}
        });
      }
      return;
    }

    const nextTurn = player === 'player1' ? 'player2' : 'player1';
    setCurrentTurn(nextTurn);

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { row, count, nextHeaps },
        nextTurnState: { currentTurn: nextTurn }
      });
    }
  }, [heaps, myRole, mode, multiplayerData]);

  // Bot Turn Logic
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'player2' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const botMove = getNimBotMove(heaps, botDifficulty);
        executeMove(botMove.row, botMove.count, 'player2');
        setIsBotThinking(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [mode, currentTurn, gameOver, heaps, botDifficulty, executeMove]);

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { row: number; count: number; nextHeaps: NimHeaps }; nextTurnState: { currentTurn: 'player1' | 'player2' } }) => {
      setHeaps(data.move.nextHeaps);
      setMoveCount(prev => prev + 1);
      sound.play('move');

      const totalRem = data.move.nextHeaps[0] + data.move.nextHeaps[1] + data.move.nextHeaps[2];
      if (totalRem === 0) {
        setGameOver(true);
        const oppRole = myRole === 'player1' ? 'player2' : 'player1';
        setWinner(oppRole);
        setEndMessage('💀 Opponent took the last stick!');
        sound.play('loss');
        recordGameResult('loss');
      } else {
        setCurrentTurn(data.nextTurnState.currentTurn);
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(myRole);
      setEndMessage(data.message || '🏆 Opponent left! You win by default!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOver(true);
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? myRole : (myRole === 'player1' ? 'player2' : 'player1'));
      setEndMessage(iWon ? '🏆 Opponent ran out of 30s turn limit! You Win!' : '⏰ Time expired! 30s limit reached.');
      if (iWon) {
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else {
        sound.play('loss');
        recordGameResult('loss');
      }
    };

    const handleRematchStarted = () => {
      resetGame();
      sound.play('match');
    };

    socket.on('opponent_move', handleOpponentMove);
    socket.on('opponent_left', handleOpponentLeft);
    socket.on('player_timed_out', handlePlayerTimedOut);
    socket.on('rematch_started', handleRematchStarted);

    return () => {
      socket.off('opponent_move', handleOpponentMove);
      socket.off('opponent_left', handleOpponentLeft);
      socket.off('player_timed_out', handlePlayerTimedOut);
      socket.off('rematch_started', handleRematchStarted);
    };
  }, [mode, multiplayerData, myRole]);

  const resetGame = () => {
    setHeaps([3, 5, 7]);
    setCurrentTurn('player1');
    setSelectedRow(null);
    setSelectedCount(0);
    setMoveCount(0);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  const rowColors = [
    { stick: 'bg-cyan-400', shadow: 'shadow-[0_0_12px_rgba(6,182,212,0.8)]', border: 'border-cyan-300', name: 'Row 1 (3)' },
    { stick: 'bg-purple-400', shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.8)]', border: 'border-purple-300', name: 'Row 2 (5)' },
    { stick: 'bg-amber-400', shadow: 'shadow-[0_0_12px_rgba(251,191,36,0.8)]', border: 'border-amber-300', name: 'Row 3 (7)' }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Nim · Take any sticks from one row · Last stick wins!`}
      />

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[420px] p-2.5 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === myRole
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Nim Relic Board with Glowing Cyber Sticks */}
      <div className="w-full max-w-[440px] bg-gradient-to-b from-[#13112b] via-[#0d0c1c] to-[#070610] border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden mb-4">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_75%)] pointer-events-none" />

        {/* 3 Rows of Sticks */}
        {[0, 1, 2].map(rIdx => {
          const count = heaps[rIdx];
          const color = rowColors[rIdx];
          const isThisRowSelected = selectedRow === rIdx;

          return (
            <div key={rIdx} className="flex flex-col gap-1.5 z-10">
              <div className="flex items-center justify-between text-[11px] font-black uppercase text-gray-400 px-1">
                <span>{color.name}</span>
                <span className="text-white font-mono">{count} Left</span>
              </div>

              <div className="h-20 sm:h-24 rounded-2xl bg-black/40 border border-gray-800/80 flex items-center justify-center gap-2 sm:gap-3 p-2 relative">
                {count === 0 ? (
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    Row Empty
                  </span>
                ) : (
                  Array.from({ length: count }).map((_, sIdx) => {
                    const isSelected = isThisRowSelected && sIdx >= (count - selectedCount);

                    return (
                      <button
                        key={sIdx}
                        onClick={() => handleStickClick(rIdx, sIdx)}
                        disabled={!isMyTurn || isBotThinking || gameOver}
                        className={`w-4 sm:w-5 h-14 sm:h-16 rounded-full border transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-rose-500 border-rose-300 scale-110 shadow-[0_0_18px_rgba(244,63,94,0.9)] animate-pulse'
                            : `${color.stick} ${color.border} ${color.shadow} hover:scale-105 cursor-pointer`
                        }`}
                        title="Click to take from here"
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Action Button: Take Selected Sticks */}
        <div className="flex items-center justify-between gap-3 z-10 pt-2 border-t border-gray-800">
          <div className="text-xs font-bold text-gray-300">
            {selectedRow !== null && selectedCount > 0 ? (
              <span>Taking <strong className="text-rose-400 font-black text-sm">{selectedCount}</strong> stick{selectedCount > 1 ? 's' : ''} from Row {selectedRow + 1}</span>
            ) : (
              <span className="text-gray-500">Tap sticks to select amount</span>
            )}
          </div>

          <button
            onClick={handleConfirmTake}
            disabled={selectedRow === null || selectedCount === 0 || !isMyTurn || isBotThinking || gameOver}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:pointer-events-none text-black font-black text-xs uppercase tracking-wider shadow-neon-cyan transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" /> Take Sticks
          </button>
        </div>
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="cyan"
        maxWidthClass="max-w-[440px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
