// client/src/games/checkers/CheckersGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  CheckersBoard,
  CheckersMove,
  CheckersPieceColor,
  initCheckersBoard,
  getLegalMovesForPiece,
  getAllLegalMoves,
  applyCheckersMove,
  getCheckersBotMove
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface CheckersGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const CheckersGame: React.FC<CheckersGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [board, setBoard] = useState<CheckersBoard>(initCheckersBoard);
  const [currentTurn, setCurrentTurn] = useState<CheckersPieceColor>('red');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [availableMoves, setAvailableMoves] = useState<CheckersMove[]>([]);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [winner, setWinner] = useState<CheckersPieceColor | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);

  const myColor: CheckersPieceColor = useMemo(() => {
    if (mode === 'bot') return 'red';
    return multiplayerData?.yourRole === 'player1' ? 'red' : 'black';
  }, [mode, multiplayerData]);

  const isMyTurn = currentTurn === myColor;

  const { redCount, blackCount } = useMemo(() => {
    let r = 0, b = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col]?.color === 'red') r++;
        if (board[row][col]?.color === 'black') b++;
      }
    }
    return { redCount: r, blackCount: b };
  }, [board]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  // 30s Move Timer
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver,
    isMyTurn,
    turnKey: `${moveCount}-${currentTurn}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (gameOver) return;
      setGameOver(true);

      if (timedOutUser === 'me') {
        const oppColor = myColor === 'red' ? 'black' : 'red';
        setWinner(oppColor);
        setEndMessage('⏰ 30s Time Expired! You ran out of time.');
        sound.play('loss');
        recordGameResult('loss');

        if (mode !== 'bot' && multiplayerData) {
          const socket = getSocket();
          socket.emit('player_timeout', {
            roomId: multiplayerData.roomId,
            timedOutPlayerId: multiplayerData.you.socketId
          });
        }
      } else {
        setWinner(myColor);
        setEndMessage('🏆 Victory! Opponent ran out of time (30s limit).');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      }
    }
  });

  const checkEndCondition = useCallback((nextBoard: CheckersBoard, nextTurn: CheckersPieceColor) => {
    let r = 0, b = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (nextBoard[row][col]?.color === 'red') r++;
        if (nextBoard[row][col]?.color === 'black') b++;
      }
    }

    if (r === 0) {
      setWinner('black');
      setGameOver(true);
      if (myColor === 'black') {
        setEndMessage('🏆 Victory! All enemy pieces captured!');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else {
        setEndMessage('💀 Defeat! All your pieces captured!');
        sound.play('loss');
        recordGameResult('loss');
      }
      return true;
    }
    if (b === 0) {
      setWinner('red');
      setGameOver(true);
      if (myColor === 'red') {
        setEndMessage('🏆 Victory! All enemy pieces captured!');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else {
        setEndMessage('💀 Defeat! All your pieces captured!');
        sound.play('loss');
        recordGameResult('loss');
      }
      return true;
    }

    const legal = getAllLegalMoves(nextBoard, nextTurn);
    if (legal.length === 0) {
      const opposingWinner = nextTurn === 'red' ? 'black' : 'red';
      setWinner(opposingWinner);
      setGameOver(true);
      if (myColor === opposingWinner) {
        setEndMessage('🏆 Victory! Opponent has no legal moves left!');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else {
        setEndMessage('💀 No moves remaining!');
        sound.play('loss');
        recordGameResult('loss');
      }
      return true;
    }

    return false;
  }, [myColor]);

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || !isMyTurn || isBotThinking) return;

    if (selectedCoord) {
      const chosenMove = availableMoves.find(m => m.to[0] === r && m.to[1] === c);
      if (chosenMove) {
        const nextBoard = applyCheckersMove(board, chosenMove);
        const nextTurn: CheckersPieceColor = currentTurn === 'red' ? 'black' : 'red';

        setBoard(nextBoard);
        setSelectedCoord(null);
        setAvailableMoves([]);
        setMoveCount(prev => prev + 1);

        if (chosenMove.jumps && chosenMove.jumps.length > 0) {
          sound.play('capture');
        } else {
          sound.play('move');
        }

        const isFinished = checkEndCondition(nextBoard, nextTurn);
        if (!isFinished) {
          setCurrentTurn(nextTurn);
        }

        if (mode !== 'bot' && multiplayerData) {
          const socket = getSocket();
          socket.emit('make_move', {
            roomId: multiplayerData.roomId,
            move: chosenMove,
            nextTurnState: { currentTurn: nextTurn }
          });
        }
        return;
      }
    }

    const piece = board[r][c];
    if (piece && piece.color === myColor) {
      setSelectedCoord([r, c]);
      const moves = getLegalMovesForPiece(board, r, c);
      setAvailableMoves(moves);
      sound.play('click');
    } else {
      setSelectedCoord(null);
      setAvailableMoves([]);
    }
  };

  // Bot Turn Handler
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'black' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const botMove = getCheckersBotMove(board, botDifficulty, 'black');
        if (botMove) {
          const nextBoard = applyCheckersMove(board, botMove);
          setBoard(nextBoard);
          setMoveCount(prev => prev + 1);

          if (botMove.jumps && botMove.jumps.length > 0) {
            sound.play('capture');
          } else {
            sound.play('move');
          }

          const isFinished = checkEndCondition(nextBoard, 'red');
          if (!isFinished) {
            setCurrentTurn('red');
          }
        } else {
          setWinner('red');
          setGameOver(true);
          setEndMessage('🏆 Bot has no legal moves! You Win!');
          sound.play('win');
          triggerConfetti();
          recordGameResult('win');
        }
        setIsBotThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [mode, currentTurn, gameOver, board, botDifficulty, checkEndCondition]);

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;

    const socket = getSocket();

    const handleOpponentMove = (data: { move: CheckersMove; nextTurnState: { currentTurn: CheckersPieceColor } }) => {
      const nextBoard = applyCheckersMove(board, data.move);
      setBoard(nextBoard);
      setMoveCount(prev => prev + 1);
      setCurrentTurn(data.nextTurnState.currentTurn);

      if (data.move.jumps && data.move.jumps.length > 0) {
        sound.play('capture');
      } else {
        sound.play('move');
      }

      checkEndCondition(nextBoard, data.nextTurnState.currentTurn);
    };

    // Auto-win if opponent exits or disconnects!
    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(myColor);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOver(true);
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? myColor : (myColor === 'red' ? 'black' : 'red'));
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
  }, [mode, multiplayerData, board, checkEndCondition, myColor]);

  const resetGame = () => {
    setBoard(initCheckersBoard());
    setCurrentTurn('red');
    setSelectedCoord(null);
    setAvailableMoves([]);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setMoveCount(0);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2">
      {/* 30-Second Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Checkers: ${myColor === 'red' ? 'Crimson' : 'Midnight'}`}
      />

      {/* End / Forfeit Banner Alert */}
      {endMessage && (
        <div className={`w-full p-3 mb-3 rounded-2xl text-center text-xs sm:text-sm font-extrabold border shadow-lg animate-fade-in ${
          winner === myColor
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Piece Counts Bar */}
      <div className="w-full flex justify-between items-center text-xs px-3 py-1.5 mb-2 bg-gray-950/70 rounded-lg border border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          <span className="text-gray-300 font-bold">Crimson: {redCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-gray-400 shadow-[0_0_6px_#94a3b8]" />
          <span className="text-gray-300 font-bold">Midnight: {blackCount}</span>
        </div>
      </div>

      {/* 8x8 Checkers Board */}
      <div className="relative w-full aspect-square max-w-[420px] bg-gray-950 p-2 sm:p-3 rounded-2xl border-2 border-rose-600/40 shadow-2xl shadow-rose-950/40 flex flex-col justify-center select-none">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden border border-gray-800">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedCoord?.[0] === r && selectedCoord?.[1] === c;
              const isTarget = availableMoves.some(m => m.to[0] === r && m.to[1] === c);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex items-center justify-center transition-all cursor-pointer select-none
                    ${isDark ? 'bg-[#151726]' : 'bg-[#292c42]'}
                    ${isSelected ? '!bg-rose-900/50 ring-2 ring-rose-400' : ''}
                    hover:brightness-110
                  `}
                >
                  {isTarget && (
                    <div className="absolute w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_#00f59b] animate-pulse z-10" />
                  )}

                  {piece && (
                    <div
                      className={`w-[78%] h-[78%] rounded-full flex items-center justify-center relative transition-transform active:scale-95 shadow-md ${
                        piece.color === 'red'
                          ? 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-900 shadow-rose-950/80 border-2 border-rose-300/40'
                          : 'bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 shadow-black border-2 border-gray-400/40'
                      }`}
                    >
                      <div className="w-2/3 h-2/3 rounded-full border border-white/20 flex items-center justify-center">
                        {piece.isKing && (
                          <span className="text-yellow-300 text-sm sm:text-base font-bold drop-shadow">
                            👑
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modern Rematch / Opponent Left Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="rose"
        maxWidthClass="max-w-[420px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
