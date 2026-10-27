// client/src/games/dotsandboxes/DotsAndBoxesGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  GRID_DOTS,
  BOX_COUNT,
  LineId,
  getCompletedBoxes,
  getDotsBotMove
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface DotsAndBoxesGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const DotsAndBoxesGame: React.FC<DotsAndBoxesGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [drawnLines, setDrawnLines] = useState<Set<LineId>>(new Set());
  const [boxes, setBoxes] = useState<Record<string, 'player1' | 'player2'>>({});
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw' | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const myRole: 'player1' | 'player2' = useMemo(() => {
    if (mode === 'bot') return 'player1';
    return multiplayerData?.yourRole || 'player1';
  }, [mode, multiplayerData]);

  const isMyTurn = mode === 'bot'
    ? currentTurn === 'player1'
    : currentTurn === myRole;

  const scores = useMemo(() => {
    let p1 = 0;
    let p2 = 0;
    for (const owner of Object.values(boxes)) {
      if (owner === 'player1') p1++;
      else if (owner === 'player2') p2++;
    }
    return { p1, p2 };
  }, [boxes]);

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  const handleLineClick = useCallback((lineId: LineId) => {
    if (drawnLines.has(lineId) || gameOver || !isMyTurn || isBotThinking) return;

    const nextLines = new Set(drawnLines);
    nextLines.add(lineId);
    setDrawnLines(nextLines);
    setMoveCount(prev => prev + 1);

    const { newBoxKeys, newlyCompletedCount } = getCompletedBoxes(nextLines, currentTurn, boxes);

    let nextBoxes = { ...boxes };
    for (const key of newBoxKeys) {
      nextBoxes[key] = currentTurn;
    }
    setBoxes(nextBoxes);

    if (newlyCompletedCount > 0) {
      sound.play('capture');
    } else {
      sound.play('move');
    }

    // Check game end: 9 boxes total
    const totalClaimed = Object.keys(nextBoxes).length;
    if (totalClaimed >= BOX_COUNT * BOX_COUNT) {
      setGameOver(true);
      const p1 = Object.values(nextBoxes).filter(v => v === 'player1').length;
      const p2 = Object.values(nextBoxes).filter(v => v === 'player2').length;
      if (p1 > p2) {
        setWinner('player1');
        const isMe = myRole === 'player1';
        setEndMessage(isMe ? `🏆 Victory! You claimed ${p1} boxes!` : `💀 Defeat! Opponent won ${p1} - ${p2}`);
        if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
        else { sound.play('loss'); recordGameResult('loss'); }
      } else if (p2 > p1) {
        setWinner('player2');
        const isMe = myRole === 'player2';
        setEndMessage(isMe ? `🏆 Victory! You claimed ${p2} boxes!` : `💀 Defeat! Opponent won ${p2} - ${p1}`);
        if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
        else { sound.play('loss'); recordGameResult('loss'); }
      } else {
        setWinner('draw');
        setEndMessage(`🤝 Draw! Tied at ${p1} - ${p2}`);
        recordGameResult('draw');
      }

      if (mode !== 'bot' && multiplayerData) {
        const socket = getSocket();
        socket.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: { lineId, newBoxKeys, player: currentTurn },
          nextTurnState: { currentTurn }
        });
      }
      return;
    }

    // If box was claimed, CURRENT PLAYER GETS BONUS TURN!
    const nextTurn = newlyCompletedCount > 0
      ? currentTurn
      : (currentTurn === 'player1' ? 'player2' : 'player1');

    setCurrentTurn(nextTurn);

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { lineId, newBoxKeys, player: currentTurn },
        nextTurnState: { currentTurn: nextTurn }
      });
    }
  }, [drawnLines, gameOver, isMyTurn, isBotThinking, currentTurn, boxes, myRole, mode, multiplayerData]);

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'player2' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const botMove = getDotsBotMove(drawnLines, boxes, botDifficulty);
        if (botMove) {
          const nextLines = new Set(drawnLines);
          nextLines.add(botMove);
          setDrawnLines(nextLines);
          setMoveCount(prev => prev + 1);

          const { newBoxKeys, newlyCompletedCount } = getCompletedBoxes(nextLines, 'player2', boxes);
          const nextBoxes = { ...boxes };
          for (const key of newBoxKeys) {
            nextBoxes[key] = 'player2';
          }
          setBoxes(nextBoxes);

          if (newlyCompletedCount > 0) {
            sound.play('capture');
          } else {
            sound.play('move');
          }

          const totalClaimed = Object.keys(nextBoxes).length;
          if (totalClaimed >= BOX_COUNT * BOX_COUNT) {
            setGameOver(true);
            const p1 = Object.values(nextBoxes).filter(v => v === 'player1').length;
            const p2 = Object.values(nextBoxes).filter(v => v === 'player2').length;
            if (p1 > p2) {
              setWinner('player1');
              setEndMessage(`🏆 Victory! You claimed ${p1} boxes!`);
              sound.play('win'); triggerConfetti(); recordGameResult('win');
            } else if (p2 > p1) {
              setWinner('player2');
              setEndMessage(`💀 Defeat! Bot claimed ${p2} boxes!`);
              sound.play('loss'); recordGameResult('loss');
            } else {
              setWinner('draw');
              setEndMessage(`🤝 Draw! Tied at ${p1} - ${p2}`);
              recordGameResult('draw');
            }
          } else {
            // If bot completed box, it gets extra turn!
            if (newlyCompletedCount === 0) {
              setCurrentTurn('player1');
            }
          }
        }
        setIsBotThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mode, currentTurn, gameOver, drawnLines, boxes, botDifficulty]);

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

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { lineId: LineId; newBoxKeys: string[]; player: 'player1' | 'player2' }; nextTurnState: { currentTurn: 'player1' | 'player2' } }) => {
      setDrawnLines(prev => {
        const next = new Set(prev);
        next.add(data.move.lineId);
        return next;
      });

      if (data.move.newBoxKeys && data.move.newBoxKeys.length > 0) {
        sound.play('capture');
        setBoxes(prev => {
          const next = { ...prev };
          for (const k of data.move.newBoxKeys) {
            next[k] = data.move.player;
          }
          return next;
        });
      } else {
        sound.play('move');
      }

      setMoveCount(prev => prev + 1);
      setCurrentTurn(data.nextTurnState.currentTurn);
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(myRole);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
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
    setDrawnLines(new Set());
    setBoxes({});
    setCurrentTurn('player1');
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setMoveCount(0);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* 30s Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Role: ${myRole === 'player1' ? 'Cyan' : 'Pink'}`}
      />

      {/* Score HUD */}
      <div className="flex items-center justify-between w-full max-w-[340px] px-4 py-2 mb-3 rounded-xl bg-gray-950/80 border border-gray-800 shadow-md">
        <div className={`flex items-center space-x-2 ${currentTurn === 'player1' && !gameOver ? 'text-cyan-400 font-extrabold' : 'text-gray-400'}`}>
          <div className="w-3.5 h-3.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className="text-xs">{mode === 'bot' ? 'You' : 'Player 1'}: {scores.p1}</span>
        </div>
        <div className="text-xs font-black text-gray-500">VS</div>
        <div className={`flex items-center space-x-2 ${currentTurn === 'player2' && !gameOver ? 'text-pink-400 font-extrabold' : 'text-gray-400'}`}>
          <span className="text-xs">{mode === 'bot' ? 'Bot' : 'Player 2'}: {scores.p2}</span>
          <div className="w-3.5 h-3.5 rounded-sm bg-pink-500 shadow-[0_0_8px_#ec4899]" />
        </div>
      </div>

      {/* End / Alert Banner */}
      {endMessage && (
        <div className={`w-full max-w-[340px] p-2.5 mb-3 rounded-xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === myRole
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Dots and Boxes Board Canvas */}
      <div className="relative w-full aspect-square max-w-[370px] bg-gray-900/90 rounded-2xl p-4 border-2 border-fuchsia-500/30 shadow-2xl shadow-purple-950/40 flex flex-col justify-between">
        {/* Render 5x5 Grid of Boxes (25 total) + Interactive Border Lines */}
        <div className="relative w-full h-full">
          {/* Render Boxes */}
          {Array.from({ length: BOX_COUNT }).map((_, r) =>
            Array.from({ length: BOX_COUNT }).map((_, c) => {
              const boxOwner = boxes[`${r}_${c}`];
              return (
                <div
                  key={`box-${r}-${c}`}
                  style={{
                    position: 'absolute',
                    top: `${(r / BOX_COUNT) * 100}%`,
                    left: `${(c / BOX_COUNT) * 100}%`,
                    width: `${100 / BOX_COUNT}%`,
                    height: `${100 / BOX_COUNT}%`,
                    padding: '4px'
                  }}
                  className="flex items-center justify-center pointer-events-none"
                >
                  {boxOwner && (
                    <div
                      className={`w-full h-full rounded-lg flex items-center justify-center font-black text-sm sm:text-base animate-scale-in shadow-inner ${
                        boxOwner === 'player1'
                          ? 'bg-cyan-500/35 text-cyan-300 border border-cyan-400/60 shadow-cyan-950'
                          : 'bg-pink-500/35 text-pink-300 border border-pink-400/60 shadow-pink-950'
                      }`}
                    >
                      {boxOwner === 'player1' ? '⚄' : '★'}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Render Horizontal Lines */}
          {Array.from({ length: GRID_DOTS }).map((_, r) =>
            Array.from({ length: BOX_COUNT }).map((_, c) => {
              const lineId = `h_${r}_${c}`;
              const isDrawn = drawnLines.has(lineId);
              return (
                <button
                  key={lineId}
                  onClick={() => handleLineClick(lineId)}
                  disabled={isDrawn || gameOver || !isMyTurn || isBotThinking}
                  style={{
                    position: 'absolute',
                    top: `calc(${(r / BOX_COUNT) * 100}% - 7px)`,
                    left: `calc(${(c / BOX_COUNT) * 100}% + 5px)`,
                    width: `calc(${100 / BOX_COUNT}% - 10px)`,
                    height: '14px'
                  }}
                  className={`group rounded-full flex items-center justify-center transition-all ${
                    isDrawn
                      ? 'cursor-default'
                      : isMyTurn && !gameOver
                      ? 'cursor-pointer hover:scale-y-125'
                      : 'cursor-not-allowed'
                  }`}
                  aria-label={`Horizontal line ${r}, ${c}`}
                >
                  <div
                    className={`w-full h-2 rounded-full transition-all ${
                      isDrawn
                        ? 'bg-gradient-to-r from-cyan-400 to-pink-500 shadow-[0_0_10px_#22d3ee]'
                        : 'bg-gray-800 group-hover:bg-purple-500/60'
                    }`}
                  />
                </button>
              );
            })
          )}

          {/* Render Vertical Lines */}
          {Array.from({ length: BOX_COUNT }).map((_, r) =>
            Array.from({ length: GRID_DOTS }).map((_, c) => {
              const lineId = `v_${r}_${c}`;
              const isDrawn = drawnLines.has(lineId);
              return (
                <button
                  key={lineId}
                  onClick={() => handleLineClick(lineId)}
                  disabled={isDrawn || gameOver || !isMyTurn || isBotThinking}
                  style={{
                    position: 'absolute',
                    top: `calc(${(r / BOX_COUNT) * 100}% + 5px)`,
                    left: `calc(${(c / BOX_COUNT) * 100}% - 7px)`,
                    width: '14px',
                    height: `calc(${100 / BOX_COUNT}% - 10px)`
                  }}
                  className={`group rounded-full flex items-center justify-center transition-all ${
                    isDrawn
                      ? 'cursor-default'
                      : isMyTurn && !gameOver
                      ? 'cursor-pointer hover:scale-x-125'
                      : 'cursor-not-allowed'
                  }`}
                  aria-label={`Vertical line ${r}, ${c}`}
                >
                  <div
                    className={`h-full w-2 rounded-full transition-all ${
                      isDrawn
                        ? 'bg-gradient-to-b from-cyan-400 to-pink-500 shadow-[0_0_10px_#ec4899]'
                        : 'bg-gray-800 group-hover:bg-purple-500/60'
                    }`}
                  />
                </button>
              );
            })
          )}

          {/* Render 6x6 Grid Dots */}
          {Array.from({ length: GRID_DOTS }).map((_, r) =>
            Array.from({ length: GRID_DOTS }).map((_, c) => (
              <div
                key={`dot-${r}-${c}`}
                style={{
                  position: 'absolute',
                  top: `calc(${(r / BOX_COUNT) * 100}% - 5px)`,
                  left: `calc(${(c / BOX_COUNT) * 100}% - 5px)`
                }}
                className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] z-20 pointer-events-none"
              />
            ))
          )}
        </div>
      </div>

      {/* Rematch Actions */}
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
