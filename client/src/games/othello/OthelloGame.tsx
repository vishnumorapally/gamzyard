// client/src/games/othello/OthelloGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  OthelloBoard,
  OthelloColor,
  createInitialOthelloBoard,
  getValidMoves,
  applyOthelloMove,
  countOthelloDiscs,
  getOthelloBotMove,
  ValidMove
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface OthelloGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const OthelloGame: React.FC<OthelloGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [board, setBoard] = useState<OthelloBoard>(createInitialOthelloBoard);
  const [currentTurn, setCurrentTurn] = useState<OthelloColor>('black');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<OthelloColor | 'draw' | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  // Black moves first; in multiplayer, Player 1 is Black, Player 2 is White
  const myColor: OthelloColor = useMemo(() => {
    if (mode === 'bot') return 'black';
    return multiplayerData?.yourRole === 'player1' ? 'black' : 'white';
  }, [mode, multiplayerData]);

  const isMyTurn = mode === 'bot'
    ? currentTurn === 'black'
    : currentTurn === myColor;

  const validMoves = useMemo(() => {
    if (gameOver) return [];
    return getValidMoves(board, currentTurn);
  }, [board, currentTurn, gameOver]);

  const discCounts = useMemo(() => countOthelloDiscs(board), [board]);

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  const checkGameEnd = useCallback((b: OthelloBoard, nextTurn: OthelloColor) => {
    const nextMoves = getValidMoves(b, nextTurn);
    if (nextMoves.length === 0) {
      // Check if other player can move
      const altTurn: OthelloColor = nextTurn === 'black' ? 'white' : 'black';
      const altMoves = getValidMoves(b, altTurn);

      if (altMoves.length === 0) {
        // Game Over! Both players have no valid moves or board is full
        setGameOver(true);
        const { black, white } = countOthelloDiscs(b);
        if (black > white) {
          setWinner('black');
          const isMe = myColor === 'black';
          setEndMessage(isMe ? `🏆 Victory! Black wins (${black} - ${white})` : `💀 Defeat! Black wins (${black} - ${white})`);
          if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
          else { sound.play('loss'); recordGameResult('loss'); }
        } else if (white > black) {
          setWinner('white');
          const isMe = myColor === 'white';
          setEndMessage(isMe ? `🏆 Victory! White wins (${white} - ${black})` : `💀 Defeat! White wins (${white} - ${black})`);
          if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
          else { sound.play('loss'); recordGameResult('loss'); }
        } else {
          setWinner('draw');
          setEndMessage(`🤝 Tie Game! Tied at ${black} - ${white}`);
          recordGameResult('draw');
        }
        return true;
      } else {
        // Pass turn to the other player who has moves
        setCurrentTurn(altTurn);
        sound.play('click');
        return false;
      }
    }
    return false;
  }, [myColor]);

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
        const oppColor = myColor === 'black' ? 'white' : 'black';
        setWinner(oppColor);
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

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || !isMyTurn || isBotThinking) return;

    const move = validMoves.find(m => m.row === r && m.col === c);
    if (!move) return;

    const nextBoard = applyOthelloMove(board, r, c, currentTurn, move.flips);
    setBoard(nextBoard);
    setMoveCount(prev => prev + 1);
    sound.play('move');

    const nextTurn: OthelloColor = currentTurn === 'black' ? 'white' : 'black';
    setCurrentTurn(nextTurn);

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { row: r, col: c, flips: move.flips, color: currentTurn },
        nextTurnState: { currentTurn: nextTurn }
      });
    }

    checkGameEnd(nextBoard, nextTurn);
  };

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'white' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const botMove = getOthelloBotMove(board, botDifficulty, 'white');
        if (botMove) {
          const nextBoard = applyOthelloMove(board, botMove.row, botMove.col, 'white', botMove.flips);
          setBoard(nextBoard);
          setMoveCount(prev => prev + 1);
          sound.play('move');
          setCurrentTurn('black');
          checkGameEnd(nextBoard, 'black');
        } else {
          // Bot passes
          setCurrentTurn('black');
          checkGameEnd(board, 'black');
        }
        setIsBotThinking(false);
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [mode, currentTurn, gameOver, board, botDifficulty, checkGameEnd]);

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: ValidMove & { color: OthelloColor }; nextTurnState: { currentTurn: OthelloColor } }) => {
      const nextBoard = applyOthelloMove(board, data.move.row, data.move.col, data.move.color, data.move.flips);
      setBoard(nextBoard);
      setMoveCount(prev => prev + 1);
      sound.play('move');
      setCurrentTurn(data.nextTurnState.currentTurn);
      checkGameEnd(nextBoard, data.nextTurnState.currentTurn);
    };

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
      setWinner(iWon ? myColor : (myColor === 'black' ? 'white' : 'black'));
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
  }, [mode, multiplayerData, board, checkGameEnd, myColor]);

  const resetGame = () => {
    setBoard(createInitialOthelloBoard());
    setCurrentTurn('black');
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setMoveCount(0);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2 select-none">
      {/* 30-Second Turn Timer */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`You: ${myColor.toUpperCase()}`}
      />

      {/* Discs Score HUD */}
      <div className="flex items-center justify-between w-full max-w-[360px] px-4 py-2 mb-3 rounded-xl bg-gray-950/80 border border-gray-800 shadow-md">
        <div className={`flex items-center space-x-2 ${currentTurn === 'black' && !gameOver ? 'text-teal-400 font-extrabold' : 'text-gray-400'}`}>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
          <span className="text-xs">Black: {discCounts.black}</span>
        </div>
        <div className="text-xs font-black text-gray-500">VS</div>
        <div className={`flex items-center space-x-2 ${currentTurn === 'white' && !gameOver ? 'text-purple-400 font-extrabold' : 'text-gray-400'}`}>
          <span className="text-xs">White: {discCounts.white}</span>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]" />
        </div>
      </div>

      {/* Banner */}
      {endMessage && (
        <div className={`w-full max-w-[360px] p-2.5 mb-3 rounded-xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === myColor
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* 8x8 Board Grid */}
      <div className="relative w-full aspect-square max-w-[360px] bg-[#0c241d] rounded-2xl p-2 sm:p-2.5 border-4 border-[#174e3f] shadow-2xl shadow-emerald-950/50 grid grid-cols-8 grid-rows-8 gap-1">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isValid = isMyTurn && !gameOver && validMoves.some(m => m.row === r && m.col === c);
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`relative flex items-center justify-center rounded-md bg-[#13382c] border border-[#1b4e3e]/70 transition-all ${
                  isValid ? 'hover:bg-[#1f5947] cursor-pointer' : ''
                }`}
              >
                {/* Disc */}
                {cell && (
                  <div
                    className={`w-[85%] h-[85%] rounded-full shadow-lg transition-transform duration-300 animate-scale-in flex items-center justify-center ${
                      cell === 'black'
                        ? 'bg-gradient-to-br from-gray-800 via-gray-950 to-black border border-teal-500/50 shadow-black'
                        : 'bg-gradient-to-br from-white via-gray-100 to-gray-300 border border-purple-400/60 shadow-gray-900/60'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${cell === 'black' ? 'bg-teal-400/30' : 'bg-purple-500/20'}`} />
                  </div>
                )}

                {/* Valid Move Indicator Dot */}
                {isValid && !cell && (
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400/60 shadow-[0_0_8px_#2dd4bf] animate-pulse" />
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
        themeColor="emerald"
        maxWidthClass="max-w-[360px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
