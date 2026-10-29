// client/src/games/pachisi/PachisiGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Bot, User, Dices, Crown, Flame } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  PachisiState,
  createInitialPachisi,
  rollPachisiCowries,
  getMovablePachisiPawns,
  movePachisiPawn,
  getPachisiBotMove,
  getPachisiPawnCoord,
  PACHISI_TRACK,
  isTrackStepSafe
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface PachisiGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const PachisiGame: React.FC<PachisiGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
  multiplayerData,
  onExit
}) => {
  const [gameState, setGameState] = useState<PachisiState>(createInitialPachisi);
  const [isRolling, setIsRolling] = useState(false);
  const [animatingPawnId, setAnimatingPawnId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('Throw the 6 royal cowrie shells to begin');
  const [moveCount, setMoveCount] = useState<number>(0);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerRole: 'p1' | 'p2' = useMemo(() => {
    if (mode === 'bot') return 'p1';
    if (!multiplayerData) return 'p1';
    if (multiplayerData.allPlayers && multiplayerData.you) {
      const idx = multiplayerData.allPlayers.findIndex(
        p => (p.socketId && p.socketId === multiplayerData.you?.socketId) ||
             (p.id && p.id === multiplayerData.you?.id) ||
             (p.name && p.name === multiplayerData.you?.name && !p.isBot)
      );
      if (idx !== -1) return idx === 0 ? 'p1' : 'p2';
    }
    return multiplayerData?.yourRole === 'player2' ? 'p2' : 'p1';
  }, [mode, multiplayerData]);

  const isMyTurn = isMultiplayer
    ? gameState.currentTurn === myPlayerRole
    : gameState.currentTurn === 'p1';

  // Movable pawns
  const movableIds = useMemo(() => {
    if (gameState.lastRoll === null || gameState.canRoll || animatingPawnId !== null) return [];
    return getMovablePachisiPawns(gameState, gameState.currentTurn, gameState.lastRoll);
  }, [gameState, animatingPawnId]);

  // Turn timer
  const handleTimeoutLoss = useCallback(() => {
    if (gameState.isOver) return;
    const win = isMyTurn ? (myPlayerRole === 'p1' ? 'p2' : 'p1') : myPlayerRole;
    setGameState(prev => ({
      ...prev,
      isOver: true,
      winner: win
    }));
    sound.play('loss');
    recordGameResult('loss');
  }, [gameState.isOver, isMyTurn, myPlayerRole]);

  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameState.isOver && !isRolling && animatingPawnId === null,
    isMyTurn,
    turnKey: `${moveCount}-${gameState.currentTurn}-${gameState.lastRoll}`,
    initialTime: 30,
    onTimeout: handleTimeoutLoss
  });

  const handleGameOver = useCallback((state: PachisiState) => {
    const isMeWinner = state.winner === myPlayerRole || (!isMultiplayer && state.winner === 'p1');
    if (isMeWinner) {
      sound.play('win');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      recordGameResult('win');
    } else {
      sound.play('loss');
      recordGameResult('loss');
    }
  }, [myPlayerRole, isMultiplayer]);

  // Roll 6 Cowries
  const handleRoll = useCallback(() => {
    if (gameState.isOver || isRolling || !gameState.canRoll || animatingPawnId !== null) return;
    if (isMultiplayer && gameState.currentTurn !== myPlayerRole) return;
    if (!isMultiplayer && gameState.currentTurn !== 'p1') return;

    sound.play('click');
    setIsRolling(true);

    setTimeout(() => {
      const rollRes = rollPachisiCowries();
      setIsRolling(false);

      const movable = getMovablePachisiPawns(gameState, gameState.currentTurn, rollRes.roll);
      let nextTurn = gameState.currentTurn;
      let canRollNext = false;

      if (movable.length === 0) {
        if (!rollRes.extraTurn) {
          nextTurn = gameState.currentTurn === 'p1' ? 'p2' : 'p1';
          canRollNext = true;
          setStatusMessage(`Rolled ${rollRes.roll} — No moves possible. Turn passes.`);
        } else {
          canRollNext = true;
          setStatusMessage(`Rolled ${rollRes.roll} — Bonus roll granted!`);
        }
      } else {
        setStatusMessage(
          rollRes.extraTurn
            ? `👑 Rolled ${rollRes.roll} (${rollRes.roll === 25 ? 'PACHISI!' : 'Bonus!'}) — Select a gotti to advance!`
            : `Rolled ${rollRes.roll}! Tap a highlighted gotti to move.`
        );
      }

      setGameState(prev => ({
        ...prev,
        lastRoll: rollRes.roll,
        cowries: rollRes.cowries,
        canRoll: canRollNext,
        extraTurn: rollRes.extraTurn,
        currentTurn: nextTurn
      }));

      if (isMultiplayer && multiplayerData?.roomId) {
        const socket = getSocket();
        socket?.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: { type: 'roll', roll: rollRes.roll, cowries: rollRes.cowries, extraTurn: rollRes.extraTurn }
        });
      }
    }, 600);
  }, [gameState, isRolling, animatingPawnId, isMultiplayer, myPlayerRole, multiplayerData]);

  // Select Pawn with step-by-step visual hop
  const handleSelectPawn = useCallback((pawnId: number) => {
    if (gameState.isOver || isRolling || gameState.canRoll || animatingPawnId !== null) return;
    if (isMultiplayer && gameState.currentTurn !== myPlayerRole) return;
    if (!isMultiplayer && gameState.currentTurn !== 'p1') return;
    if (!movableIds.includes(pawnId)) return;

    setAnimatingPawnId(pawnId);
    const { nextState, captured, stepsPath } = movePachisiPawn(gameState, pawnId);

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < stepsPath.length) {
        sound.play('tick');
        stepIdx++;
      } else {
        clearInterval(interval);
        setAnimatingPawnId(null);
        sound.play('move');
        setMoveCount(c => c + 1);

        if (captured) {
          sound.play('capture');
          setStatusMessage('⚔️ Captured an opponent gotti back to Char-Koni! Bonus turn!');
        } else {
          setStatusMessage(nextState.canRoll ? 'Throw cowries' : "Opponent's turn...");
        }

        setGameState(nextState);

        if (nextState.isOver) {
          handleGameOver(nextState);
        }

        if (isMultiplayer && multiplayerData?.roomId) {
          const socket = getSocket();
          socket?.emit('make_move', {
            roomId: multiplayerData.roomId,
            move: { type: 'movePawn', pawnId }
          });
        }
      }
    }, 130);
  }, [gameState, isRolling, animatingPawnId, isMultiplayer, myPlayerRole, movableIds, multiplayerData, handleGameOver]);

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && gameState.currentTurn === 'p2' && !gameState.isOver && !isRolling && animatingPawnId === null) {
      if (gameState.canRoll) {
        const timer = setTimeout(() => {
          sound.play('click');
          setIsRolling(true);
          setTimeout(() => {
            const rollRes = rollPachisiCowries();
            setIsRolling(false);
            const movable = getMovablePachisiPawns(gameState, 'p2', rollRes.roll);

            if (movable.length === 0) {
              const nextTurn = rollRes.extraTurn ? 'p2' : 'p1';
              setGameState(prev => ({
                ...prev,
                lastRoll: rollRes.roll,
                cowries: rollRes.cowries,
                canRoll: true,
                extraTurn: rollRes.extraTurn,
                currentTurn: nextTurn
              }));
              setStatusMessage(`Bot rolled ${rollRes.roll} — No moves!`);
            } else {
              setGameState(prev => ({
                ...prev,
                lastRoll: rollRes.roll,
                cowries: rollRes.cowries,
                canRoll: false,
                extraTurn: rollRes.extraTurn
              }));
              setStatusMessage(`Bot rolled ${rollRes.roll}! Advancing...`);
            }
          }, 600);
        }, 600);
        return () => clearTimeout(timer);
      } else if (gameState.lastRoll !== null) {
        const timer = setTimeout(() => {
          const movable = getMovablePachisiPawns(gameState, 'p2', gameState.lastRoll!);
          const chosenId = getPachisiBotMove(gameState, movable, botDifficulty);
          if (chosenId !== -1) {
            setAnimatingPawnId(chosenId);
            const { nextState, captured, stepsPath } = movePachisiPawn(gameState, chosenId);

            let stepIdx = 0;
            const interval = setInterval(() => {
              if (stepIdx < stepsPath.length) {
                sound.play('tick');
                stepIdx++;
              } else {
                clearInterval(interval);
                setAnimatingPawnId(null);
                sound.play('move');
                setMoveCount(c => c + 1);
                if (captured) {
                  sound.play('capture');
                  setStatusMessage('Bot captured your gotti!');
                }
                setGameState(nextState);
                if (nextState.isOver) {
                  handleGameOver(nextState);
                }
              }
            }, 130);
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, mode, isRolling, animatingPawnId, botDifficulty, handleGameOver]);

  // Multiplayer opponent sync
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();
    const handleRemoteMove = (payload: any) => {
      const move = payload?.move;
      if (move?.type === 'roll') {
        sound.play('click');
        setIsRolling(true);
        setTimeout(() => {
          setIsRolling(false);
          const movable = getMovablePachisiPawns(gameState, gameState.currentTurn, move.roll);
          setGameState(prev => ({
            ...prev,
            lastRoll: move.roll,
            cowries: move.cowries,
            canRoll: movable.length === 0,
            extraTurn: move.extraTurn,
            currentTurn: movable.length === 0 && !move.extraTurn ? (prev.currentTurn === 'p1' ? 'p2' : 'p1') : prev.currentTurn
          }));
        }, 500);
      } else if (move?.type === 'movePawn') {
        setAnimatingPawnId(move.pawnId);
        const { nextState, captured, stepsPath } = movePachisiPawn(gameState, move.pawnId);
        let stepIdx = 0;
        const interval = setInterval(() => {
          if (stepIdx < stepsPath.length) {
            sound.play('tick');
            stepIdx++;
          } else {
            clearInterval(interval);
            setAnimatingPawnId(null);
            sound.play('move');
            setMoveCount(c => c + 1);
            if (captured) sound.play('capture');
            setGameState(nextState);
            if (nextState.isOver) {
              handleGameOver(nextState);
            }
          }
        }, 130);
      }
    };

    const handleOpponentLeft = (data: any) => {
      setOpponentLeft(true);
      setGameState(prev => ({ ...prev, isOver: true, winner: myPlayerRole }));
      sound.play('win');
    };

    socket?.on('opponent_move', handleRemoteMove);
    socket?.on('opponent_left', handleOpponentLeft);
    return () => {
      socket?.off('opponent_move', handleRemoteMove);
      socket?.off('opponent_left', handleOpponentLeft);
    };
  }, [isMultiplayer, gameState, myPlayerRole, handleGameOver]);

  const handleRestart = () => {
    setGameState(createInitialPachisi());
    setIsRolling(false);
    setAnimatingPawnId(null);
    setMoveCount(0);
    setStatusMessage('Throw the 6 royal cowrie shells to begin');
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 select-none">
      {/* Top Header stats */}
      <div className="w-full flex items-center justify-between bg-stone-900/90 border border-amber-900/40 rounded-2xl p-4 mb-3 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
            {mode === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {mode === 'bot' ? `Mughal Bot (${botDifficulty})` : multiplayerData?.opponent?.name || 'Opponent'}
            </div>
            <div className="text-xs font-semibold text-amber-300">
              {gameState.p2Pawns.filter(p => p.isHome).length}/3 Home • {gameState.p2Captures} Captures
            </div>
          </div>
        </div>

        <div className="text-center">
          <div
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              gameState.isOver
                ? 'bg-stone-800 text-stone-400 border-stone-700'
                : gameState.currentTurn === myPlayerRole
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {gameState.isOver
              ? 'Game Over'
              : gameState.currentTurn === myPlayerRole
              ? 'Your Turn'
              : mode === 'bot' ? "Bot's Turn..." : "Opponent's Turn..."}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 max-w-[200px] truncate">
            {statusMessage}
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {multiplayerData?.you?.name || 'You'}
            </div>
            <div className="text-xs font-semibold text-rose-300">
              {gameState.p1Pawns.filter(p => p.isHome).length}/3 Home • {gameState.p1Captures} Captures
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="w-full mb-3">
        <TimerBar
          timeLeft={timeLeft}
          percent={percent}
          isMyTurn={isMyTurn}
          gameOver={gameState.isOver}
          statusText={statusMessage}
        />
      </div>

      {/* Main Authentic Cross Board & Cowrie Shells */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        {/* Authentic 17x17 Pachisi Cross Board */}
        <div className="relative p-3 rounded-3xl bg-gradient-to-br from-[#450a0a] via-[#1c0808] to-[#0a0303] border-4 border-[#ca8a04] shadow-2xl shadow-black/90">
          <div
            className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-xl overflow-hidden bg-[#240609] border border-amber-800"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(17, 1fr)',
              gridTemplateRows: 'repeat(17, 1fr)'
            }}
          >
            {/* Render 17x17 Cross Grid cells */}
            {Array.from({ length: 17 }).map((_, r) =>
              Array.from({ length: 17 }).map((_, c) => {
                const isNorthArm = r <= 6 && c >= 7 && c <= 9;
                const isSouthArm = r >= 10 && c >= 7 && c <= 9;
                const isWestArm = c <= 6 && r >= 7 && r <= 9;
                const isEastArm = c >= 10 && r >= 7 && r <= 9;
                const isCenter = r >= 7 && r <= 9 && c >= 7 && c <= 9;
                const isCrossCell = isNorthArm || isSouthArm || isWestArm || isEastArm || isCenter;

                if (!isCrossCell) {
                  return <div key={`${r}-${c}`} className="bg-transparent" />;
                }

                if (isCenter) {
                  if (r === 8 && c === 8) {
                    return (
                      <div
                        key={`${r}-${c}`}
                        className="col-span-1 row-span-1 bg-[#7f1d1d] border border-yellow-500/80 flex items-center justify-center"
                      >
                        <Crown className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="bg-gradient-to-br from-yellow-950/60 to-red-950/60 border border-yellow-500/30"
                    />
                  );
                }

                const isMidLane = (isNorthArm && c === 8) || (isSouthArm && c === 8) || (isWestArm && r === 8) || (isEastArm && r === 8);
                const isSafeCastle =
                  (r === 16 && c === 9) || (r === 13 && c === 9) || (r === 9 && c === 13) || (r === 9 && c === 16) ||
                  (r === 0 && c === 9) || (r === 3 && c === 9) || (r === 7 && c === 3) || (r === 7 && c === 0);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative flex items-center justify-center border border-amber-900/50 ${
                      isMidLane
                        ? 'bg-[#991b1b]/80'
                        : isSafeCastle
                        ? 'bg-[#b45309]/50'
                        : 'bg-[#450a0a]/90'
                    }`}
                  >
                    {isSafeCastle && (
                      <span className="text-[9px] font-black text-yellow-400/90 pointer-events-none">
                        ✕
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* P1 Royal Gotti Tokens (Crimson & Gold) */}
            {gameState.p1Pawns.map(pawn => {
              const coord = getPachisiPawnCoord(pawn, 'p1');
              const isSelectable =
                !gameState.canRoll &&
                isMyTurn &&
                movableIds.includes(pawn.id);
              const isAnimating = animatingPawnId === pawn.id;

              const leftPercent = (coord.c / 17) * 100;
              const topPercent = (coord.r / 17) * 100;

              return (
                <button
                  key={`p1-${pawn.id}`}
                  disabled={!isSelectable}
                  onClick={() => handleSelectPawn(pawn.id)}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: '5.88%',
                    height: '5.88%'
                  }}
                  className={`absolute z-20 flex items-center justify-center transition-all duration-150 ${
                    isSelectable
                      ? 'scale-125 ring-4 ring-yellow-400 cursor-pointer animate-bounce'
                      : isAnimating
                      ? 'scale-125 ring-4 ring-white animate-pulse'
                      : 'cursor-default'
                  }`}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-rose-500 via-red-600 to-rose-400 text-white font-black text-[9px] flex items-center justify-center shadow-lg border border-amber-300">
                    {pawn.isHome ? '👑' : pawn.id + 1}
                  </div>
                </button>
              );
            })}

            {/* P2 Royal Gotti Tokens (Purple & Gold) */}
            {gameState.p2Pawns.map(pawn => {
              const coord = getPachisiPawnCoord(pawn, 'p2');
              const isSelectable =
                !gameState.canRoll &&
                isMultiplayer &&
                isMyTurn &&
                movableIds.includes(pawn.id);
              const isAnimating = animatingPawnId === pawn.id;

              const leftPercent = (coord.c / 17) * 100;
              const topPercent = (coord.r / 17) * 100;

              return (
                <button
                  key={`p2-${pawn.id}`}
                  disabled={!isSelectable}
                  onClick={() => handleSelectPawn(pawn.id)}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: '5.88%',
                    height: '5.88%'
                  }}
                  className={`absolute z-20 flex items-center justify-center transition-all duration-150 ${
                    isSelectable
                      ? 'scale-125 ring-4 ring-yellow-400 cursor-pointer animate-bounce'
                      : isAnimating
                      ? 'scale-125 ring-4 ring-white animate-pulse'
                      : 'cursor-default'
                  }`}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 text-black font-black text-[9px] flex items-center justify-center shadow-lg border border-white">
                    {pawn.isHome ? '👑' : pawn.id + 1}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Cowrie Dice Roller & Actions */}
        <div className="flex flex-col items-center gap-3 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl w-full md:w-64">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Dices className="w-4 h-4 text-yellow-400" /> 6 Royal Cowries
          </span>

          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-black/40 border border-amber-900/30">
            {gameState.cowries.map((up, i) => (
              <div
                key={i}
                className={`w-9 h-11 rounded-full border-2 transition-transform duration-300 flex items-center justify-center shadow-md ${
                  isRolling ? 'animate-spin' : ''
                } ${
                  up
                    ? 'bg-gradient-to-b from-amber-100 via-amber-200 to-yellow-300 border-amber-500 shadow-yellow-500/20'
                    : 'bg-gradient-to-b from-amber-950 to-stone-900 border-amber-800 opacity-90'
                }`}
              >
                <div
                  className={`w-2 h-6 rounded-full ${
                    up ? 'bg-amber-900/80 shadow-inner' : 'bg-black'
                  }`}
                />
              </div>
            ))}
          </div>

          {gameState.lastRoll !== null && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">
                {gameState.lastRoll === 25 ? '25 (PACHISI!)' : gameState.lastRoll === 10 ? '10 (Grace)' : gameState.lastRoll}
              </span>
              {gameState.extraTurn && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Bonus
                </span>
              )}
            </div>
          )}

          {gameState.canRoll && isMyTurn && !gameState.isOver && animatingPawnId === null && (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 animate-pulse cursor-pointer"
            >
              <Dices className="w-4 h-4" /> {isRolling ? 'Throwing...' : 'Throw 6 Cowries'}
            </button>
          )}

          <div className="text-[11px] text-amber-300/70 text-center leading-relaxed border-t border-stone-800 pt-3">
            Roll <strong>10, 25, 6, or 12</strong> to bring gotti into play. Safe castle squares <strong>✕</strong> protect gotti. Cut opponents to send them to Char-Koni!
          </div>
        </div>
      </div>

      <div className="mt-4 w-full flex justify-center">
        <RematchActions
          gameOver={gameState.isOver}
          mode={mode}
          multiplayerData={multiplayerData}
          onReset={handleRestart}
          onExit={onExit}
          themeColor="rose"
          maxWidthClass="max-w-md"
          opponentLeft={opponentLeft}
        />
      </div>
    </div>
  );
};
export default PachisiGame;
