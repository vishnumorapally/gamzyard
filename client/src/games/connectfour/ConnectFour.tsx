// client/src/games/connectfour/ConnectFour.tsx
import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  COLS,
  ConnectBoard,
  createEmptyBoard,
  getLowestEmptyRow,
  checkConnectFourWinner,
  isConnectBoardFull,
  getConnectFourBotMove,
  CellValue
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface ConnectFourProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const ConnectFour: React.FC<ConnectFourProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [board, setBoard] = useState<ConnectBoard>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<CellValue>('red');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [winner, setWinner] = useState<CellValue>(null);
  const [winningCoords, setWinningCoords] = useState<[number, number][] | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);

  const myPiece: CellValue = mode === 'bot'
    ? 'red'
    : multiplayerData?.yourRole === 'player1' ? 'red' : 'yellow';

  const isMyTurn = mode === 'bot'
    ? currentPiece === 'red'
    : currentPiece === myPiece;

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  // 30s Move Timer Hook
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver,
    isMyTurn,
    turnKey: `${moveCount}-${currentPiece}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (gameOver) return;
      setGameOver(true);

      if (timedOutUser === 'me') {
        const oppPiece = myPiece === 'red' ? 'yellow' : 'red';
        setWinner(oppPiece);
        setEndMessage('⏰ 30s Time Expired! You took too long to drop your disc.');
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
        setWinner(myPiece);
        setEndMessage('🏆 Victory! Opponent ran out of time (30s limit).');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      }
    }
  });

  const dropDisc = useCallback((col: number) => {
    if (gameOver || !isMyTurn || isBotThinking) return;

    const row = getLowestEmptyRow(board, col);
    if (row === -1) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPiece;
    setBoard(newBoard);
    setMoveCount(prev => prev + 1);
    sound.play('move');

    const result = checkConnectFourWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningCoords(result.winningCoords);
      setGameOver(true);
      if (result.winner === myPiece) {
        setEndMessage('🏆 Victory! Connect 4 achieved!');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else {
        setEndMessage('💀 Opponent connected 4 discs!');
        sound.play('loss');
        recordGameResult('loss');
      }
    } else if (isConnectBoardFull(newBoard)) {
      setGameOver(true);
      setEndMessage("🤝 Grid full: It's a Draw!");
      sound.play('loss');
      recordGameResult('draw');
    } else {
      const nextPiece = currentPiece === 'red' ? 'yellow' : 'red';
      setCurrentPiece(nextPiece);
    }

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { col, row, piece: currentPiece },
        nextTurnState: { currentPiece: currentPiece === 'red' ? 'yellow' : 'red' }
      });
    }
  }, [board, gameOver, isMyTurn, isBotThinking, currentPiece, myPiece, mode, multiplayerData]);

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && currentPiece === 'yellow' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const botCol = getConnectFourBotMove(board, botDifficulty, 'yellow', 'red');
        const row = getLowestEmptyRow(board, botCol);

        if (row !== -1) {
          const newBoard = board.map(r => [...r]);
          newBoard[row][botCol] = 'yellow';
          setBoard(newBoard);
          setMoveCount(prev => prev + 1);
          sound.play('move');

          const result = checkConnectFourWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinningCoords(result.winningCoords);
            setGameOver(true);
            setEndMessage('💀 Bot connected 4 discs!');
            sound.play('loss');
            recordGameResult('loss');
          } else if (isConnectBoardFull(newBoard)) {
            setGameOver(true);
            setEndMessage("🤝 Grid full: Draw!");
            recordGameResult('draw');
          } else {
            setCurrentPiece('red');
          }
        }
        setIsBotThinking(false);
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [mode, currentPiece, gameOver, board, botDifficulty]);

  // Multiplayer listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;

    const socket = getSocket();

    const handleOpponentMove = (data: { move: { col: number; row: number; piece: CellValue } }) => {
      const { col, row, piece } = data.move;
      setBoard(prev => {
        const next = prev.map(r => [...r]);
        next[row][col] = piece;

        const result = checkConnectFourWinner(next);
        if (result.winner) {
          setWinner(result.winner);
          setWinningCoords(result.winningCoords);
          setGameOver(true);
          if (result.winner === myPiece) {
            setEndMessage('🏆 Victory! You connected 4!');
            sound.play('win');
            triggerConfetti();
          } else {
            setEndMessage('💀 Opponent connected 4 discs!');
            sound.play('loss');
          }
        } else if (isConnectBoardFull(next)) {
          setGameOver(true);
          setEndMessage("🤝 Draw!");
        }
        return next;
      });

      setMoveCount(prev => prev + 1);
      setCurrentPiece(piece === 'red' ? 'yellow' : 'red');
      sound.play('move');
    };

    // Auto-win if opponent leaves room or disconnects!
    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(myPiece);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOver(true);
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? myPiece : (myPiece === 'red' ? 'yellow' : 'red'));
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
  }, [mode, multiplayerData, myPiece]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece('red');
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setWinningCoords(null);
    setMoveCount(0);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  const isCoordinateWinning = (r: number, c: number) => {
    return winningCoords?.some(([wr, wc]) => wr === r && wc === c);
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
        statusText={`Disc: ${myPiece === 'red' ? 'Cyan' : 'Amber'}`}
      />

      {/* End / Forfeit Banner Alert */}
      {endMessage && (
        <div className={`w-full p-3 mb-3 rounded-2xl text-center text-xs sm:text-sm font-extrabold border shadow-lg animate-fade-in ${
          winner === myPiece
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Connect Four Board */}
      <div className="relative w-full max-w-[420px] bg-blue-950/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/50 flex flex-col items-center">
        {/* Column Drop Arrows */}
        <div className="grid grid-cols-7 w-full gap-1.5 sm:gap-2 mb-2">
          {Array.from({ length: COLS }).map((_, c) => {
            const isColAvailable = board[0][c] === null && !gameOver && isMyTurn && !isBotThinking;
            return (
              <button
                key={c}
                onClick={() => dropDisc(c)}
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                disabled={!isColAvailable}
                aria-label={`Drop piece in column ${c + 1}`}
                className={`h-7 rounded-lg flex items-center justify-center transition-all ${
                  isColAvailable
                    ? 'hover:bg-cyan-500/20 active:scale-90 text-cyan-400 cursor-pointer'
                    : 'opacity-0 cursor-default'
                }`}
              >
                ▼
              </button>
            );
          })}
        </div>

        {/* 6x7 Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isWinning = isCoordinateWinning(r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => dropDisc(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                  className={`aspect-square rounded-full flex items-center justify-center transition-all duration-300 relative cursor-pointer
                    ${cell === null ? 'bg-gray-900/90 shadow-inner' : ''}
                    ${isWinning ? 'ring-4 ring-emerald-400 animate-pulse' : ''}
                  `}
                >
                  {cell === null && hoverCol === c && isMyTurn && !gameOver && (
                    <div className={`w-3/4 h-3/4 rounded-full opacity-25 ${myPiece === 'red' ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                  )}

                  {cell === 'red' && (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-600 via-cyan-400 to-teal-200 shadow-[0_0_12px_rgba(0,242,254,0.7)] flex items-center justify-center transform scale-95 transition-transform" />
                  )}

                  {cell === 'yellow' && (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_12px_rgba(255,190,11,0.7)] flex items-center justify-center transform scale-95 transition-transform" />
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
        themeColor="cyan"
        maxWidthClass="max-w-[420px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
