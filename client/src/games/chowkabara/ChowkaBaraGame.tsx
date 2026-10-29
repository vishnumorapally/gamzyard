// client/src/games/chowkabara/ChowkaBaraGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Bot, User, Dices, Flame } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  ChowkaBaraState,
  P1_TRACK,
  P2_TRACK,
  isSafeCell,
  createInitialChowkaBara,
  rollCowries,
  getMovablePawns,
  movePawn,
  getChowkaBaraBotMove
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface ChowkaBaraGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const ChowkaBaraGame: React.FC<ChowkaBaraGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
  multiplayerData,
  onExit
}) => {
  const [gameState, setGameState] = useState<ChowkaBaraState>(createInitialChowkaBara);
  const [isRolling, setIsRolling] = useState(false);
  const [statusText, setStatusText] = useState('Roll the 4 cowrie shells to begin');
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

  // Movable pawns for current roll
  const movablePawnIds = useMemo(() => {
    if (gameState.lastRoll === null || gameState.canRoll) return [];
    return getMovablePawns(gameState, gameState.currentTurn, gameState.lastRoll);
  }, [gameState]);

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
    isActive: !gameState.isOver && !isRolling,
    isMyTurn,
    turnKey: `${moveCount}-${gameState.currentTurn}-${gameState.lastRoll}`,
    initialTime: 30,
    onTimeout: handleTimeoutLoss
  });

  const handleGameOver = useCallback((state: ChowkaBaraState) => {
    const isMeWinner = state.winner === myPlayerRole || (!isMultiplayer && state.winner === 'p1');
    if (isMeWinner) {
      sound.play('win');
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      recordGameResult('win');
    } else {
      sound.play('loss');
      recordGameResult('loss');
    }
  }, [myPlayerRole, isMultiplayer]);

  // Roll Cowries
  const handleRoll = useCallback(() => {
    if (gameState.isOver || isRolling || !gameState.canRoll) return;
    if (isMultiplayer && gameState.currentTurn !== myPlayerRole) return;
    if (!isMultiplayer && gameState.currentTurn !== 'p1') return;

    sound.play('click');
    setIsRolling(true);

    setTimeout(() => {
      const rollRes = rollCowries();
      setIsRolling(false);

      const movable = getMovablePawns(gameState, gameState.currentTurn, rollRes.roll);
      let nextTurn = gameState.currentTurn;
      let canRollNext = false;

      if (movable.length === 0) {
        if (!rollRes.extraTurn) {
          nextTurn = gameState.currentTurn === 'p1' ? 'p2' : 'p1';
          canRollNext = true;
          setStatusText(`Rolled ${rollRes.roll} — No moves possible! Turn passes.`);
        } else {
          canRollNext = true;
          setStatusText(`Rolled ${rollRes.roll} — Extra Turn granted! Roll again.`);
        }
      } else {
        setStatusText(
          rollRes.extraTurn
            ? `Rolled ${rollRes.roll} (${rollRes.roll === 4 ? 'Chowka!' : 'Ashta!'}) — Extra turn! Select a pawn to move.`
            : `Rolled ${rollRes.roll}! Select a pawn to move.`
        );
      }

      setGameState(prev => ({
        ...prev,
        lastRoll: rollRes.roll,
        cowrieShells: rollRes.shells,
        canRoll: canRollNext,
        extraTurn: rollRes.extraTurn,
        currentTurn: nextTurn
      }));

      if (isMultiplayer && multiplayerData?.roomId) {
        const socket = getSocket();
        socket?.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: { type: 'roll', roll: rollRes.roll, shells: rollRes.shells, extraTurn: rollRes.extraTurn }
        });
      }
    }, 600);
  }, [gameState, isRolling, isMultiplayer, myPlayerRole, multiplayerData]);

  // Pawn selection move
  const handleSelectPawn = useCallback((pawnId: number) => {
    if (gameState.isOver || isRolling || gameState.canRoll) return;
    if (isMultiplayer && gameState.currentTurn !== myPlayerRole) return;
    if (!isMultiplayer && gameState.currentTurn !== 'p1') return;
    if (!movablePawnIds.includes(pawnId)) return;

    sound.play('move');
    const { nextState, killedOpponent } = movePawn(gameState, pawnId);
    setMoveCount(c => c + 1);

    if (killedOpponent) {
      sound.play('capture');
      setStatusText('KILLED an opponent pawn! Bonus roll granted!');
    } else {
      setStatusText(nextState.canRoll ? 'Roll the cowrie shells' : "Waiting for opponent...");
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
  }, [gameState, isRolling, isMultiplayer, myPlayerRole, movablePawnIds, multiplayerData, handleGameOver]);

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && gameState.currentTurn === 'p2' && !gameState.isOver && !isRolling) {
      if (gameState.canRoll) {
        const timer = setTimeout(() => {
          sound.play('click');
          setIsRolling(true);
          setTimeout(() => {
            const rollRes = rollCowries();
            setIsRolling(false);
            const movable = getMovablePawns(gameState, 'p2', rollRes.roll);

            if (movable.length === 0) {
              const nextTurn = rollRes.extraTurn ? 'p2' : 'p1';
              setGameState(prev => ({
                ...prev,
                lastRoll: rollRes.roll,
                cowrieShells: rollRes.shells,
                canRoll: true,
                extraTurn: rollRes.extraTurn,
                currentTurn: nextTurn
              }));
              setStatusText(`Bot rolled ${rollRes.roll} — no moves possible!`);
            } else {
              setGameState(prev => ({
                ...prev,
                lastRoll: rollRes.roll,
                cowrieShells: rollRes.shells,
                canRoll: false,
                extraTurn: rollRes.extraTurn
              }));
              setStatusText(`Bot rolled ${rollRes.roll}! Thinking...`);
            }
          }, 600);
        }, 600);
        return () => clearTimeout(timer);
      } else if (gameState.lastRoll !== null) {
        const timer = setTimeout(() => {
          const movable = getMovablePawns(gameState, 'p2', gameState.lastRoll!);
          const chosenPawnId = getChowkaBaraBotMove(gameState, movable, botDifficulty);
          if (chosenPawnId !== -1) {
            sound.play('move');
            const { nextState, killedOpponent } = movePawn(gameState, chosenPawnId);
            setMoveCount(c => c + 1);
            setGameState(nextState);
            if (killedOpponent) {
              sound.play('capture');
              setStatusText('Bot killed your pawn!');
            }
            if (nextState.isOver) {
              handleGameOver(nextState);
            }
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, mode, isRolling, botDifficulty, handleGameOver]);

  // Multiplayer socket listener
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
          const movable = getMovablePawns(gameState, gameState.currentTurn, move.roll);
          setGameState(prev => ({
            ...prev,
            lastRoll: move.roll,
            cowrieShells: move.shells,
            canRoll: movable.length === 0,
            extraTurn: move.extraTurn,
            currentTurn: movable.length === 0 && !move.extraTurn ? (prev.currentTurn === 'p1' ? 'p2' : 'p1') : prev.currentTurn
          }));
        }, 500);
      } else if (move?.type === 'movePawn') {
        sound.play('move');
        const { nextState } = movePawn(gameState, move.pawnId);
        setMoveCount(c => c + 1);
        setGameState(nextState);
        if (nextState.isOver) {
          handleGameOver(nextState);
        }
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
    setGameState(createInitialChowkaBara());
    setIsRolling(false);
    setMoveCount(0);
    setStatusText('Roll the 4 cowrie shells to begin');
  };

  const getPawnsAt = (r: number, c: number) => {
    const list: { player: 'p1' | 'p2'; pawn: any }[] = [];
    gameState.p1Pawns.forEach(p => {
      if (p.step >= 0 && !p.isHome) {
        const coord = P1_TRACK[p.step];
        if (coord.r === r && coord.c === c) list.push({ player: 'p1', pawn: p });
      }
    });
    gameState.p2Pawns.forEach(p => {
      if (p.step >= 0 && !p.isHome) {
        const coord = P2_TRACK[p.step];
        if (coord.r === r && coord.c === c) list.push({ player: 'p2', pawn: p });
      }
    });
    return list;
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 select-none">
      {/* Header stats */}
      <div className="w-full flex items-center justify-between bg-stone-900/90 border border-amber-900/40 rounded-2xl p-4 mb-3 backdrop-blur-md shadow-xl">
        {/* P2 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            {mode === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {mode === 'bot' ? `Cyber Bot (${botDifficulty})` : multiplayerData?.opponent?.name || 'Opponent'}
            </div>
            <div className="text-xs font-semibold text-purple-300">
              {gameState.p2Pawns.filter(p => p.isHome).length}/3 Home • {gameState.p2Kills} Kills
            </div>
          </div>
        </div>

        {/* Turn indicator */}
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
            {statusText}
          </div>
        </div>

        {/* P1 */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {multiplayerData?.you?.name || 'You'}
            </div>
            <div className="text-xs font-semibold text-emerald-300">
              {gameState.p1Pawns.filter(p => p.isHome).length}/3 Home • {gameState.p1Kills} Kills
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
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
          statusText={statusText}
        />
      </div>

      {/* Main Game Stage: Board & Cowrie Shell Roller */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        {/* 5x5 Grid Board */}
        <div className="relative p-3 rounded-3xl bg-gradient-to-br from-[#381c0f] via-[#211108] to-[#140b05] border-4 border-[#b45309] shadow-2xl shadow-black/80">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {[0, 1, 2, 3, 4].map(r =>
              [0, 1, 2, 3, 4].map(c => {
                const isSafe = isSafeCell(r, c);
                const isCenter = r === 2 && c === 2;
                const pawnsHere = getPawnsAt(r, c);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all ${
                      isCenter
                        ? 'bg-gradient-to-tr from-yellow-900/60 via-amber-800/40 to-yellow-600/30 border-2 border-yellow-500/80 shadow-inner'
                        : isSafe
                        ? 'bg-amber-950/40 border-2 border-amber-600/60 shadow-sm'
                        : 'bg-stone-900/90 border border-stone-800'
                    }`}
                  >
                    {isSafe && !isCenter && (
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-amber-500/30 pointer-events-none">
                        ✕
                      </span>
                    )}

                    {isCenter && (
                      <span className="absolute text-[10px] sm:text-xs font-black text-yellow-400/70 uppercase">
                        HOME
                      </span>
                    )}

                    <div className="relative z-10 flex flex-wrap items-center justify-center gap-1">
                      {pawnsHere.map(({ player, pawn }) => {
                        const isSelectable =
                          !gameState.canRoll &&
                          gameState.currentTurn === player &&
                          ((player === 'p1' && isMyTurn) || (player === 'p2' && isMultiplayer && isMyTurn)) &&
                          movablePawnIds.includes(pawn.id);

                        return (
                          <button
                            key={`${player}-${pawn.id}`}
                            disabled={!isSelectable}
                            onClick={() => handleSelectPawn(pawn.id)}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-[10px] transition-all shadow-md ${
                              player === 'p1'
                                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black border border-emerald-300'
                                : 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white border border-purple-300'
                            } ${
                              isSelectable
                                ? 'scale-110 ring-4 ring-yellow-400 animate-bounce cursor-pointer'
                                : 'cursor-default'
                            }`}
                          >
                            {pawn.id + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Side Panel: Yard Pawns & 4 Cowrie Dice Roller */}
        <div className="flex flex-col items-center gap-4 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl w-full md:w-64">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Dices className="w-4 h-4 text-amber-400" /> 4 Cowrie Shells
            </span>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-amber-900/30">
              {gameState.cowrieShells.map((up, i) => (
                <div
                  key={i}
                  className={`w-9 h-12 rounded-full border-2 transition-transform duration-300 flex items-center justify-center shadow-md ${
                    isRolling ? 'animate-spin' : ''
                  } ${
                    up
                      ? 'bg-gradient-to-b from-amber-100 via-amber-200 to-yellow-300 border-amber-500 shadow-yellow-500/20'
                      : 'bg-gradient-to-b from-amber-900 to-stone-900 border-amber-800 opacity-90'
                  }`}
                >
                  <div
                    className={`w-2 h-7 rounded-full ${
                      up ? 'bg-amber-800/80 shadow-inner' : 'bg-stone-950'
                    }`}
                  />
                </div>
              ))}
            </div>

            {gameState.lastRoll !== null && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">
                  {gameState.lastRoll === 4 ? '4 (Chowka!)' : gameState.lastRoll === 8 ? '8 (Ashta!)' : gameState.lastRoll}
                </span>
                {gameState.extraTurn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Extra Turn
                  </span>
                )}
              </div>
            )}
          </div>

          {gameState.canRoll && isMyTurn && !gameState.isOver && (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 animate-pulse"
            >
              <Dices className="w-4 h-4" /> {isRolling ? 'Rolling...' : 'Throw Cowries'}
            </button>
          )}

          {/* Player Yard Pawns */}
          <div className="w-full border-t border-stone-800 pt-3">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-2">
              Your Pawns at Base:
            </span>
            <div className="flex items-center gap-2">
              {gameState.p1Pawns
                .filter(p => p.step === -1)
                .map(p => {
                  const isSelectable =
                    !gameState.canRoll &&
                    isMyTurn &&
                    movablePawnIds.includes(p.id);

                  return (
                    <button
                      key={p.id}
                      disabled={!isSelectable}
                      onClick={() => handleSelectPawn(p.id)}
                      className={`w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-black text-xs flex items-center justify-center border-2 border-emerald-300 transition-all ${
                        isSelectable
                          ? 'ring-4 ring-yellow-400 animate-bounce cursor-pointer'
                          : 'opacity-60 cursor-default'
                      }`}
                    >
                      P{p.id + 1}
                    </button>
                  );
                })}
              {gameState.p1Pawns.filter(p => p.step === -1).length === 0 && (
                <span className="text-xs text-stone-500 italic">All pawns deployed!</span>
              )}
            </div>
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
          themeColor="amber"
          maxWidthClass="max-w-md"
          opponentLeft={opponentLeft}
        />
      </div>
    </div>
  );
};
export default ChowkaBaraGame;
