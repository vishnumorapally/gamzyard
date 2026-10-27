// client/src/games/gomoku/GomokuGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  GOMOKU_SIZE,
  GomokuBoard,
  GomokuStone,
  createEmptyGomokuBoard,
  checkGomokuWinner,
  isGomokuFull,
  getGomokuBotMove
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface GomokuGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const GomokuGame: React.FC<GomokuGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [board, setBoard] = useState<GomokuBoard>(createEmptyGomokuBoard);
  const [currentTurn, setCurrentTurn] = useState<GomokuStone>('black');
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [winningLine, setWinningLine] = useState<[number, number][] | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<GomokuStone | 'draw' | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  // Black moves first; in multiplayer Player 1 is Black, Player 2 is White
  const myStone: GomokuStone = useMemo(() => {
    if (mode === 'bot') return 'black';
    return multiplayerData?.yourRole === 'player1' ? 'black' : 'white';
  }, [mode, multiplayerData]);

  const isMyTurn = mode === 'bot'
    ? currentTurn === 'black'
    : currentTurn === myStone;

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  const handleCellClick = useCallback((r: number, c: number) => {
    if (board[r][c] !== null || gameOver || !isMyTurn || isBotThinking) return;

    const nextBoard = board.map(row => [...row]);
    nextBoard[r][c] = currentTurn;
    setBoard(nextBoard);
    setLastMove([r, c]);
    setMoveCount(prev => prev + 1);
    sound.play('move');

    const winLine = checkGomokuWinner(nextBoard, r, c, currentTurn);
    if (winLine) {
      setWinningLine(winLine);
      setGameOver(true);
      setWinner(currentTurn);
      const isMe = currentTurn === myStone;
      setEndMessage(isMe ? '🏆 Victory! 5 in a row!' : '💀 Defeat! Opponent lined up 5 stones!');
      if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
      else { sound.play('loss'); recordGameResult('loss'); }
    } else if (isGomokuFull(nextBoard)) {
      setGameOver(true);
      setWinner('draw');
      setEndMessage("🤝 It's a Draw! Board is full.");
      recordGameResult('draw');
    } else {
      const nextTurn: GomokuStone = currentTurn === 'black' ? 'white' : 'black';
      setCurrentTurn(nextTurn);
    }

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { row: r, col: c, stone: currentTurn },
        nextTurnState: { currentTurn: currentTurn === 'black' ? 'white' : 'black' }
      });
    }
  }, [board, gameOver, isMyTurn, isBotThinking, currentTurn, myStone, mode, multiplayerData]);

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'white' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const { row, col } = getGomokuBotMove(board, botDifficulty, 'white');
        const nextBoard = board.map(r => [...r]);
        nextBoard[row][col] = 'white';
        setBoard(nextBoard);
        setLastMove([row, col]);
        setMoveCount(prev => prev + 1);
        sound.play('move');

        const winLine = checkGomokuWinner(nextBoard, row, col, 'white');
        if (winLine) {
          setWinningLine(winLine);
          setGameOver(true);
          setWinner('white');
          setEndMessage('💀 Defeat! Bot aligned 5 stones!');
          sound.play('loss'); recordGameResult('loss');
        } else if (isGomokuFull(nextBoard)) {
          setGameOver(true);
          setWinner('draw');
          setEndMessage("🤝 Draw! Board is full.");
          recordGameResult('draw');
        } else {
          setCurrentTurn('black');
        }
        setIsBotThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mode, currentTurn, gameOver, board, botDifficulty]);

  // Turn Timer Hook
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver,
    isMyTurn,
    turnKey: `${moveCount}-${currentTurn}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (gameOver) return;
      setGameOver(true);
      if (timedOutUser === 'me') {
        const opp = myStone === 'black' ? 'white' : 'black';
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

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { row: number; col: number; stone: GomokuStone }; nextTurnState: { currentTurn: GomokuStone } }) => {
      const { row, col, stone } = data.move;
      setBoard(prev => {
        const next = prev.map(r => [...r]);
        next[row][col] = stone;
        const winLine = checkGomokuWinner(next, row, col, stone);
        if (winLine) {
          setWinningLine(winLine);
          setGameOver(true);
          setWinner(stone);
          if (stone === myStone) {
            setEndMessage('🏆 Victory! 5 in a row!');
            sound.play('win'); triggerConfetti();
          } else {
            setEndMessage('💀 Defeat! Opponent lined up 5 stones!');
            sound.play('loss');
          }
        }
        return next;
      });

      setLastMove([row, col]);
      setMoveCount(prev => prev + 1);
      sound.play('move');
      setCurrentTurn(data.nextTurnState.currentTurn);
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(myStone);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOver(true);
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? myStone : (myStone === 'black' ? 'white' : 'black'));
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
  }, [mode, multiplayerData, myStone]);

  const resetGame = () => {
    setBoard(createEmptyGomokuBoard());
    setCurrentTurn('black');
    setLastMove(null);
    setWinningLine(null);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setMoveCount(0);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2 select-none">
      {/* 30s Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`You: ${myStone.toUpperCase()} Stones`}
      />

      {/* Turn Indicator */}
      <div className="flex items-center justify-between w-full max-w-[360px] px-4 py-2 mb-3 rounded-xl bg-gray-950/80 border border-gray-800 shadow-md">
        <div className={`flex items-center space-x-2 ${currentTurn === 'black' && !gameOver ? 'text-indigo-400 font-extrabold' : 'text-gray-400'}`}>
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-800 to-black border border-gray-600 shadow-md" />
          <span className="text-xs">Black: {currentTurn === 'black' ? 'Turn' : 'Waiting'}</span>
        </div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">GOMOKU</div>
        <div className={`flex items-center space-x-2 ${currentTurn === 'white' && !gameOver ? 'text-indigo-400 font-extrabold' : 'text-gray-400'}`}>
          <span className="text-xs">White: {currentTurn === 'white' ? 'Turn' : 'Waiting'}</span>
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white to-gray-200 border border-gray-300 shadow-md" />
        </div>
      </div>

      {/* Banner Alert */}
      {endMessage && (
        <div className={`w-full max-w-[360px] p-2.5 mb-3 rounded-xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === myStone
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Zen Wood/Dark Go Board */}
      <div className="relative w-full aspect-square max-w-[360px] bg-[#1e172e] rounded-2xl p-2 sm:p-3 border-4 border-[#3b2b5c] shadow-2xl shadow-indigo-950/60 grid grid-cols-11 grid-rows-11 gap-0">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isLast = lastMove && lastMove[0] === r && lastMove[1] === c;
            const isWinningCell = winningLine?.some(([wr, wc]) => wr === r && wc === c);

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center cursor-pointer transition-all ${
                  !cell && isMyTurn && !gameOver ? 'hover:bg-purple-500/15' : ''
                }`}
              >
                {/* Traditional Board Grid Crosshairs */}
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-purple-500/25 pointer-events-none" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-purple-500/25 pointer-events-none" />

                {/* Star points (Tengen & corners) */}
                {((r === 2 || r === 5 || r === 8) && (c === 2 || c === 5 || c === 8)) && !cell && (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/50 z-10 pointer-events-none" />
                )}

                {/* Placed Stone */}
                {cell && (
                  <div
                    className={`relative z-20 w-[84%] h-[84%] rounded-full shadow-lg flex items-center justify-center animate-scale-in ${
                      cell === 'black'
                        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 shadow-black'
                        : 'bg-gradient-to-br from-white via-gray-100 to-gray-300 border border-gray-300 shadow-gray-900/60'
                    } ${isWinningCell ? 'ring-4 ring-emerald-400 animate-pulse' : ''}`}
                  >
                    {isLast && !isWinningCell && (
                      <div className={`w-2 h-2 rounded-full ${cell === 'black' ? 'bg-indigo-400' : 'bg-rose-500'} shadow-sm`} />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="purple"
        maxWidthClass="max-w-[360px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
