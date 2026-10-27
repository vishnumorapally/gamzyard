// client/src/games/tictactoe/TicTacToe.tsx
import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { checkWinner, getTicTacToeBotMove, isBoardFull } from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface TicTacToeProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const TicTacToe: React.FC<TicTacToeProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [endMessage, setEndMessage] = useState<string | null>(null);

  // Turn count key to trigger timer resets on each move
  const [moveCount, setMoveCount] = useState<number>(0);

  const mySymbol = mode === 'bot'
    ? 'X'
    : multiplayerData?.yourRole === 'player1' ? 'X' : 'O';

  const isMyTurn = mode === 'bot'
    ? isXTurn
    : (isXTurn && mySymbol === 'X') || (!isXTurn && mySymbol === 'O');

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // 30-Second Turn Timer Hook
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver,
    isMyTurn,
    turnKey: `${moveCount}-${isXTurn}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (gameOver) return;
      setGameOver(true);

      if (timedOutUser === 'me') {
        const oppSymbol = mySymbol === 'X' ? 'O' : 'X';
        setWinner(oppSymbol);
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
      } else {
        setWinner(mySymbol);
        setEndMessage('🏆 Victory! Opponent ran out of time (30s limit).');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      }
    }
  });

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || gameOver || !isMyTurn || isBotThinking) return;

    const currentSymbol = isXTurn ? 'X' : 'O';
    const newBoard = [...board];
    newBoard[index] = currentSymbol;
    setBoard(newBoard);
    setMoveCount(prev => prev + 1);
    sound.play('move');

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinLine(result.line);
      setGameOver(true);
      if (result.winner === mySymbol) {
        setEndMessage('🏆 Victory! 3 in a line!');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else {
        setEndMessage('💀 Defeat! Opponent lined up 3!');
        sound.play('loss');
        recordGameResult('loss');
      }
    } else if (isBoardFull(newBoard)) {
      setGameOver(true);
      setEndMessage("🤝 It's a Draw!");
      sound.play('loss');
      recordGameResult('draw');
    } else {
      setIsXTurn(!isXTurn);
    }

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { index, symbol: currentSymbol },
        nextTurnState: { isXTurn: !isXTurn }
      });
    }
  }, [board, gameOver, isMyTurn, isBotThinking, isXTurn, mySymbol, mode, multiplayerData]);

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && !isXTurn && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const botMove = getTicTacToeBotMove(board, botDifficulty, 'O', 'X');
        if (botMove !== -1) {
          const newBoard = [...board];
          newBoard[botMove] = 'O';
          setBoard(newBoard);
          setMoveCount(prev => prev + 1);
          sound.play('move');

          const result = checkWinner(newBoard);
          if (result.winner) {
            setWinner(result.winner);
            setWinLine(result.line);
            setGameOver(true);
            setEndMessage('💀 Bot outmaneuvered you!');
            sound.play('loss');
            recordGameResult('loss');
          } else if (isBoardFull(newBoard)) {
            setGameOver(true);
            setEndMessage("🤝 It's a Draw!");
            recordGameResult('draw');
          } else {
            setIsXTurn(true);
          }
        }
        setIsBotThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mode, isXTurn, gameOver, board, botDifficulty]);

  // Multiplayer Listeners (Move, Rematch, Opponent Leave/Forfeit, Timeout)
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;

    const socket = getSocket();

    const handleOpponentMove = (data: { move: { index: number; symbol: string } }) => {
      const { index, symbol } = data.move;
      setBoard(prev => {
        const next = [...prev];
        next[index] = symbol;

        const result = checkWinner(next);
        if (result.winner) {
          setWinner(result.winner);
          setWinLine(result.line);
          setGameOver(true);
          if (result.winner === mySymbol) {
            setEndMessage('🏆 Victory! You won!');
            sound.play('win');
            triggerConfetti();
          } else {
            setEndMessage('💀 Opponent scored 3 in a row!');
            sound.play('loss');
          }
        } else if (isBoardFull(next)) {
          setGameOver(true);
          setEndMessage("🤝 It's a Draw!");
        }
        return next;
      });

      setMoveCount(prev => prev + 1);
      setIsXTurn(symbol === 'O');
      sound.play('move');
    };

    // If opponent leaves or disconnects, YOU WIN AUTOMATICALLY!
    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(mySymbol);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string; message?: string }) => {
      setGameOver(true);
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? mySymbol : (mySymbol === 'X' ? 'O' : 'X'));
      setEndMessage(iWon ? '🏆 Opponent ran out of time (30s limit)! You Win!' : '⏰ Time expired! 30s limit reached.');
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
      socket.off('player_timed_out', handlePlayerPlayerTimedOutSafe(socket));
      socket.off('rematch_started', handleRematchStarted);
    };
  }, [mode, multiplayerData, mySymbol]);

  function handlePlayerPlayerTimedOutSafe(sock: ReturnType<typeof getSocket>) {
    return (d: any) => {
      sock.off('player_timed_out');
    };
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setWinLine(null);
    setMoveCount(0);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-2">
      {/* 30-Second Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Symbol: ${mySymbol}`}
      />

      {/* End / Forfeit Banner Alert */}
      {endMessage && (
        <div className={`w-full p-3 mb-3 rounded-2xl text-center text-xs sm:text-sm font-extrabold border shadow-lg animate-fade-in ${
          winner === mySymbol
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* 3x3 Game Grid */}
      <div className="relative w-full aspect-square max-w-[340px] bg-gray-900/90 rounded-2xl p-3 border-2 border-purple-500/30 shadow-2xl shadow-purple-950/40 grid grid-cols-3 grid-rows-3 gap-2.5">
        {board.map((cell, idx) => {
          const isWinningCell = winLine?.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={!!cell || gameOver || !isMyTurn || isBotThinking}
              aria-label={`Cell ${idx + 1}, ${cell || 'Empty'}`}
              className={`relative flex items-center justify-center rounded-xl font-black text-4xl sm:text-5xl transition-all duration-200 select-none
                ${!cell && isMyTurn && !gameOver ? 'hover:bg-purple-900/30 active:scale-95 cursor-pointer bg-gray-800/50 border border-gray-700/50' : 'bg-gray-800/70 border border-gray-700/30'}
                ${isWinningCell ? 'ring-4 ring-emerald-400 bg-emerald-950/60 shadow-neon-emerald scale-95' : ''}
              `}
            >
              {cell === 'X' && (
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 drop-shadow-[0_0_12px_rgba(216,70,239,0.7)] animate-float">
                  X
                </span>
              )}
              {cell === 'O' && (
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-teal-300 to-emerald-400 drop-shadow-[0_0_12px_rgba(0,242,254,0.7)] animate-float">
                  O
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Modern Rematch / Opponent Left Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="purple"
        maxWidthClass="max-w-[340px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
