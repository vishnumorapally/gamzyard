// client/src/games/chess/ChessGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { getChessBotMove } from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface ChessGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const CHESS_SYMBOLS: Record<Color, Record<PieceSymbol, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
};

export const ChessGame: React.FC<ChessGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [gameOverForced, setGameOverForced] = useState<boolean>(false);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [forcedWinner, setForcedWinner] = useState<Color | null>(null);

  const myColor: Color = useMemo(() => {
    if (mode === 'bot') return 'w';
    return multiplayerData?.yourRole === 'player1' ? 'w' : 'b';
  }, [mode, multiplayerData]);

  const isMyTurn = chess.turn() === myColor && !gameOverForced;
  const isGameOver = chess.isGameOver() || gameOverForced;
  const inCheck = chess.inCheck() && !isGameOver;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // 30-Second Turn Timer
  const { timeLeft, percent } = useTurnTimer({
    isActive: !isGameOver,
    isMyTurn,
    turnKey: `${moveCount}-${chess.turn()}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (isGameOver) return;
      setGameOverForced(true);

      if (timedOutUser === 'me') {
        const oppColor = myColor === 'w' ? 'b' : 'w';
        setForcedWinner(oppColor);
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
        setForcedWinner(myColor);
        setEndMessage('🏆 Victory! Opponent ran out of time (30s limit).');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      }
    }
  });

  const updateCapturedPieces = useCallback(() => {
    const history = chess.history({ verbose: true });
    const whiteCaps: string[] = [];
    const blackCaps: string[] = [];

    history.forEach(m => {
      if (m.captured) {
        if (m.color === 'w') {
          whiteCaps.push(CHESS_SYMBOLS.b[m.captured]);
        } else {
          blackCaps.push(CHESS_SYMBOLS.w[m.captured]);
        }
      }
    });

    setCapturedWhite(whiteCaps);
    setCapturedBlack(blackCaps);
  }, [chess]);

  const handleSquareClick = (square: Square) => {
    if (isGameOver || !isMyTurn || isBotThinking) return;

    const piece = chess.get(square);

    if (selectedSquare && validMoves.includes(square)) {
      const isCapture = !!chess.get(square);
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q'
      });

      if (move) {
        setFen(chess.fen());
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setValidMoves([]);
        setMoveCount(prev => prev + 1);
        updateCapturedPieces();

        if (isCapture) sound.play('capture');
        else sound.play('move');

        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            if (chess.turn() !== myColor) {
              setEndMessage('🏆 Victory by Checkmate!');
              sound.play('win');
              triggerConfetti();
              recordGameResult('win');
            } else {
              setEndMessage('💀 Defeat by Checkmate!');
              sound.play('loss');
              recordGameResult('loss');
            }
          } else {
            setEndMessage('🤝 Stalemate / Draw!');
            recordGameResult('draw');
          }
        }

        if (mode !== 'bot' && multiplayerData) {
          const socket = getSocket();
          socket.emit('make_move', {
            roomId: multiplayerData.roomId,
            move: { from: selectedSquare, to: square, promotion: 'q' },
            nextTurnState: { fen: chess.fen() }
          });
        }
        return;
      }
    }

    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setValidMoves(moves.map(m => m.to as Square));
      sound.play('click');
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Bot Turn Handler
  useEffect(() => {
    if (mode === 'bot' && chess.turn() === 'b' && !isGameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const botMove = getChessBotMove(chess, botDifficulty);
        if (botMove) {
          const isCapture = !!chess.get(botMove.to);
          chess.move(botMove);
          setFen(chess.fen());
          setLastMove({ from: botMove.from, to: botMove.to });
          setMoveCount(prev => prev + 1);
          updateCapturedPieces();

          if (isCapture) sound.play('capture');
          else sound.play('move');

          if (chess.isGameOver()) {
            if (chess.isCheckmate()) {
              if (chess.turn() !== myColor) {
                setEndMessage('🏆 Victory by Checkmate!');
                sound.play('win');
                triggerConfetti();
                recordGameResult('win');
              } else {
                setEndMessage('💀 Defeat by Checkmate!');
                sound.play('loss');
                recordGameResult('loss');
              }
            } else {
              setEndMessage('🤝 Stalemate / Draw!');
              recordGameResult('draw');
            }
          }
        }
        setIsBotThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [mode, fen, chess, botDifficulty, myColor, updateCapturedPieces, isGameOver]);

  // Multiplayer Socket Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;

    const socket = getSocket();

    const handleOpponentMove = (data: { move: { from: Square; to: Square; promotion?: string } }) => {
      const isCapture = !!chess.get(data.move.to);
      chess.move(data.move);
      setFen(chess.fen());
      setLastMove({ from: data.move.from, to: data.move.to });
      setMoveCount(prev => prev + 1);
      updateCapturedPieces();

      if (isCapture) sound.play('capture');
      else sound.play('move');

      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          if (chess.turn() !== myColor) {
            setEndMessage('🏆 Victory by Checkmate!');
            sound.play('win');
            triggerConfetti();
          } else {
            setEndMessage('💀 Defeat by Checkmate!');
            sound.play('loss');
          }
        }
      }
    };

    // Auto-win if opponent exits or disconnects!
    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOverForced(true);
      setOpponentLeft(true);
      setForcedWinner(myColor);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOverForced(true);
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setForcedWinner(iWon ? myColor : (myColor === 'w' ? 'b' : 'w'));
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
  }, [mode, multiplayerData, chess, myColor, updateCapturedPieces]);

  const resetGame = () => {
    chess.reset();
    setFen(chess.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setMoveCount(0);
    setEndMessage(null);
    setGameOverForced(false);
    setOpponentLeft(false);
    setForcedWinner(null);
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = myColor === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const displayFiles = myColor === 'w' ? files : [...files].reverse();

  const isUserWinner = forcedWinner === myColor || (chess.isCheckmate() && chess.turn() !== myColor);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2">
      {/* 30-Second Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={isGameOver}
        statusText={`Army: ${myColor === 'w' ? 'White' : 'Black'}${inCheck ? ' • CHECK!' : ''}`}
      />

      {/* End / Forfeit Banner Alert */}
      {endMessage && (
        <div className={`w-full p-3 mb-3 rounded-2xl text-center text-xs sm:text-sm font-extrabold border shadow-lg animate-fade-in ${
          isUserWinner
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Captured Pieces Bar */}
      <div className="w-full flex justify-between text-base px-2 py-1 mb-1 text-gray-400 bg-gray-950/60 rounded-lg">
        <div className="flex space-x-1 items-center">
          <span className="text-xs text-gray-500 mr-1">Captured:</span>
          <span className="tracking-tight text-lg">{myColor === 'w' ? capturedWhite.join('') : capturedBlack.join('')}</span>
        </div>
        <div className="flex space-x-1 items-center">
          <span className="tracking-tight text-lg">{myColor === 'w' ? capturedBlack.join('') : capturedWhite.join('')}</span>
        </div>
      </div>

      {/* 8x8 Chessboard */}
      <div className="relative w-full aspect-square max-w-[420px] bg-amber-950/40 p-2 sm:p-2.5 rounded-2xl border-2 border-amber-600/40 shadow-2xl shadow-amber-950/50 flex flex-col justify-center select-none">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden border border-amber-800/60">
          {ranks.map(r =>
            displayFiles.map((f, colIdx) => {
              const square = `${f}${r}` as Square;
              const piece = chess.get(square);
              const isLight = (colIdx + r) % 2 !== 0;
              const isSelected = selectedSquare === square;
              const isValidTarget = validMoves.includes(square);
              const isLastMove = lastMove?.from === square || lastMove?.to === square;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center transition-all cursor-pointer text-3xl sm:text-4xl md:text-5xl font-normal
                    ${isLight ? 'bg-[#32364c]' : 'bg-[#181a29]'}
                    ${isSelected ? '!bg-amber-500/40 ring-2 ring-amber-400 z-10' : ''}
                    ${isLastMove && !isSelected ? '!bg-indigo-600/30' : ''}
                    hover:brightness-125
                  `}
                >
                  {colIdx === 0 && (
                    <span className="absolute top-0.5 left-1 text-[9px] font-bold text-gray-500/60 select-none pointer-events-none">
                      {r}
                    </span>
                  )}
                  {r === (myColor === 'w' ? 1 : 8) && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-gray-500/60 select-none pointer-events-none">
                      {f}
                    </span>
                  )}

                  {isValidTarget && (
                    <div className={`absolute rounded-full pointer-events-none z-10 ${piece ? 'w-full h-full ring-4 ring-emerald-400 bg-emerald-500/20' : 'w-3.5 h-3.5 bg-emerald-400 shadow-[0_0_8px_#00f59b]'}`} />
                  )}

                  {piece && (
                    <span
                      className={`transform transition-transform active:scale-95 select-none ${
                        piece.color === 'w'
                          ? 'text-gray-100 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]'
                          : 'text-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                      }`}
                    >
                      {CHESS_SYMBOLS[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modern Rematch / Opponent Left Actions */}
      <RematchActions
        gameOver={isGameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="amber"
        maxWidthClass="max-w-[420px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
