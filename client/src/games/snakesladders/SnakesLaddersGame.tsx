// client/src/games/snakesladders/SnakesLaddersGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Bot, User, Dices, Users, RotateCcw, Flame } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  SnakesLaddersState,
  SNAKES,
  LADDERS,
  PlayerId,
  createInitialSnakesLadders,
  executeDiceMove,
  getSquareCoord
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface SnakesLaddersGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const DICE_PIPS: Record<number, { top: string; left: string }[]> = {
  1: [{ top: '50%', left: '50%' }],
  2: [{ top: '25%', left: '25%' }, { top: '75%', left: '75%' }],
  3: [{ top: '25%', left: '25%' }, { top: '50%', left: '50%' }, { top: '75%', left: '75%' }],
  4: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
  5: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '50%', left: '50%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
  6: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '50%', left: '25%' }, { top: '50%', left: '75%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }]
};

export const SnakesLaddersGame: React.FC<SnakesLaddersGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
  multiplayerData,
  onExit
}) => {
  // Helper to extract player configs from multiplayer room data
  const getPlayerConfigs = useCallback((playersList?: any[]) => {
    if (!playersList || playersList.length === 0) return undefined;
    return playersList.map((p, idx) => ({
      name: p.name || (p.isBot ? `Bot P${idx + 1}` : `Player ${idx + 1}`),
      isBot: Boolean(p.isBot)
    }));
  }, []);

  const initialCount = multiplayerData?.playerCount || multiplayerData?.allPlayers?.length || playerCount || 2;
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(initialCount);
  const [gameState, setGameState] = useState<SnakesLaddersState>(() => {
    const configs = multiplayerData?.allPlayers ? getPlayerConfigs(multiplayerData.allPlayers) : undefined;
    return createInitialSnakesLadders(initialCount, configs);
  });
  const [isRolling, setIsRolling] = useState(false);
  const [isMovingPawn, setIsMovingPawn] = useState(false);
  const [displayPositions, setDisplayPositions] = useState<Record<PlayerId, number>>({
    p1: 1,
    p2: 1,
    p3: 1,
    p4: 1
  });
  const [moveCount, setMoveCount] = useState<number>(0);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const botBusyRef = React.useRef<boolean>(false);

  const isMultiplayer = mode !== 'bot';

  // Accurate player ID resolution for 2, 3, or 4 players
  const myPlayerRole: PlayerId = useMemo(() => {
    if (mode === 'bot') return 'p1';
    if (!multiplayerData) return 'p1';

    if (multiplayerData.allPlayers && multiplayerData.you) {
      const idx = multiplayerData.allPlayers.findIndex(
        p => (p.socketId && p.socketId === multiplayerData.you?.socketId) ||
             (p.id && p.id === multiplayerData.you?.id) ||
             (p.name && p.name === multiplayerData.you?.name && !p.isBot)
      );
      if (idx !== -1) return `p${idx + 1}` as PlayerId;
    }

    if (multiplayerData.yourRole) {
      const roleNum = multiplayerData.yourRole.replace('player', '');
      if (roleNum && !isNaN(Number(roleNum))) return `p${roleNum}` as PlayerId;
    }

    return 'p1';
  }, [mode, multiplayerData]);

  const isHost = useMemo(() => {
    if (!isMultiplayer) return true;
    if (multiplayerData?.you?.isHost) return true;
    return myPlayerRole === 'p1';
  }, [isMultiplayer, multiplayerData, myPlayerRole]);

  // Sync state if prop changes
  useEffect(() => {
    const count = multiplayerData?.playerCount || multiplayerData?.allPlayers?.length || playerCount;
    const configs = multiplayerData?.allPlayers ? getPlayerConfigs(multiplayerData.allPlayers) : undefined;
    setSelectedPlayerCount(count);
    setGameState(createInitialSnakesLadders(count, configs));
    setDisplayPositions({ p1: 1, p2: 1, p3: 1, p4: 1 });
  }, [playerCount, multiplayerData?.playerCount, multiplayerData?.allPlayers, getPlayerConfigs]);

  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn = isMultiplayer
    ? activePlayer?.id === myPlayerRole && !activePlayer?.isBot
    : activePlayer?.id === 'p1';

  // Handle player count change
  const handlePlayerCountChange = (count: number) => {
    if (isMultiplayer || isRolling || isMovingPawn) return;
    setSelectedPlayerCount(count);
    const initial = createInitialSnakesLadders(count);
    setGameState(initial);
    setDisplayPositions({ p1: 1, p2: 1, p3: 1, p4: 1 });
    sound.play('click');
  };

  // Turn timer
  const handleTimeoutLoss = useCallback(() => {
    if (gameState.isOver) return;
    sound.play('loss');
    recordGameResult('loss');
  }, [gameState.isOver]);

  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameState.isOver && isMyTurn && !isRolling && !isMovingPawn,
    isMyTurn,
    turnKey: `${moveCount}-${gameState.currentTurnIndex}`,
    initialTime: 30,
    onTimeout: handleTimeoutLoss
  });

  const handleGameOver = useCallback((state: SnakesLaddersState) => {
    const isMeWinner = state.winner?.id === myPlayerRole || (!isMultiplayer && state.winner?.id === 'p1');
    if (isMeWinner) {
      sound.play('win');
      confetti({ particleCount: 120, spread: 85, origin: { y: 0.6 } });
      recordGameResult('win');
    } else {
      sound.play('loss');
      recordGameResult('loss');
    }
  }, [myPlayerRole, isMultiplayer]);

  // Animate pawn movement tile-by-tile
  const animatePawnMovement = useCallback((
    playerId: PlayerId,
    fromTile: number,
    walkedTile: number,
    finalState: SnakesLaddersState,
    landedLadder: boolean,
    landedSnake: boolean
  ) => {
    setIsMovingPawn(true);
    let curr = fromTile;

    if (walkedTile === fromTile) {
      // Overshoot, stayed in place
      setIsMovingPawn(false);
      setGameState(finalState);
      setMoveCount(c => c + 1);
      return;
    }

    const stepInterval = setInterval(() => {
      if (curr < walkedTile) {
        curr++;
        sound.play('tick');
        setDisplayPositions(prev => ({ ...prev, [playerId]: curr }));
      } else {
        clearInterval(stepInterval);

        if (landedLadder || landedSnake) {
          setTimeout(() => {
            if (landedLadder) {
              sound.play('capture');
            } else {
              sound.play('loss');
            }
            const finalPos = finalState.players.find(p => p.id === playerId)?.pos || walkedTile;
            setDisplayPositions(prev => ({ ...prev, [playerId]: finalPos }));

            setIsMovingPawn(false);
            setGameState(finalState);
            setMoveCount(c => c + 1);
            if (finalState.isOver) handleGameOver(finalState);
          }, 350);
        } else {
          setIsMovingPawn(false);
          sound.play('move');
          setGameState(finalState);
          setMoveCount(c => c + 1);
          if (finalState.isOver) handleGameOver(finalState);
        }
      }
    }, 120);
  }, [handleGameOver]);

  const handleRollDice = useCallback(() => {
    if (gameState.isOver || isRolling || isMovingPawn) return;
    if (isMultiplayer && activePlayer?.id !== myPlayerRole) return;
    if (!isMultiplayer && activePlayer?.id !== 'p1') return;

    sound.play('click');
    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);

      const fromTile = activePlayer.pos;
      const res = executeDiceMove(gameState, roll);

      animatePawnMovement(
        activePlayer.id,
        fromTile,
        res.walkedPos,
        res.nextState,
        res.landedLadder,
        res.landedSnake
      );

      if (isMultiplayer && multiplayerData?.roomId) {
        const socket = getSocket();
        socket?.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: {
            roll,
            playerId: activePlayer.id,
            fromTile,
            walkedPos: res.walkedPos,
            finalPos: res.finalPos,
            nextTurnIndex: res.nextState.currentTurnIndex,
            extraRoll: res.nextState.extraRoll,
            landedLadder: res.landedLadder,
            landedSnake: res.landedSnake,
            isOver: res.nextState.isOver,
            winnerId: res.nextState.winner?.id
          }
        });
      }
    }, 600);
  }, [gameState, isRolling, isMovingPawn, isMultiplayer, activePlayer, myPlayerRole, multiplayerData, animatePawnMovement]);

  // Bot Turn Trigger
  useEffect(() => {
    if (gameState.isOver || isRolling || isMovingPawn) return;
    if (!activePlayer?.isBot) return;

    // In multiplayer/rooms, only the host coordinates bot moves
    if (isMultiplayer && !isHost) return;

    if (botBusyRef.current) return;
    botBusyRef.current = true;

    const timer = setTimeout(() => {
      setIsRolling(true);
      sound.play('click');

      setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setIsRolling(false);
        sound.play('tick');

        const fromTile = activePlayer.pos;
        const res = executeDiceMove(gameState, roll);

        animatePawnMovement(
          activePlayer.id,
          fromTile,
          res.walkedPos,
          res.nextState,
          res.landedLadder,
          res.landedSnake
        );

        if (isMultiplayer && multiplayerData?.roomId) {
          const socket = getSocket();
          socket?.emit('make_move', {
            roomId: multiplayerData.roomId,
            move: {
              roll,
              playerId: activePlayer.id,
              fromTile,
              walkedPos: res.walkedPos,
              finalPos: res.finalPos,
              nextTurnIndex: res.nextState.currentTurnIndex,
              extraRoll: res.nextState.extraRoll,
              landedLadder: res.landedLadder,
              landedSnake: res.landedSnake,
              isOver: res.nextState.isOver,
              winnerId: res.nextState.winner?.id
            }
          });
        }

        botBusyRef.current = false;
      }, 450);
    }, 600);

    return () => {
      clearTimeout(timer);
      botBusyRef.current = false;
    };
  }, [
    mode,
    activePlayer,
    gameState,
    isRolling,
    isMovingPawn,
    animatePawnMovement,
    isMultiplayer,
    isHost,
    multiplayerData
  ]);

  // Multiplayer socket synchronization
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleOpponentMove = (payload: any) => {
      const move = payload?.move;
      if (move && typeof move.roll === 'number') {
        const player = gameState.players.find(p => p.id === move.playerId) || gameState.players[gameState.currentTurnIndex];
        const fromTile = move.fromTile ?? player.pos;

        setGameState(prev => {
          const updatedPlayers = prev.players.map(p => {
            if (p.id === player.id) {
              return { ...p, pos: move.finalPos ?? p.pos };
            }
            return p;
          });

          return {
            ...prev,
            players: updatedPlayers,
            currentTurnIndex: move.nextTurnIndex !== undefined ? move.nextTurnIndex : prev.currentTurnIndex,
            lastRoll: move.roll,
            extraRoll: Boolean(move.extraRoll),
            isOver: Boolean(move.isOver),
            winner: move.winnerId ? updatedPlayers.find(p => p.id === move.winnerId) || null : null
          };
        });

        animatePawnMovement(
          player.id,
          fromTile,
          move.walkedPos ?? move.finalPos,
          gameState,
          Boolean(move.landedLadder),
          Boolean(move.landedSnake)
        );
      }
    };

    const handlePlayerReplacedByBot = (payload: any) => {
      const leavingName = payload?.leavingName || 'A player';
      const replacedRole = payload?.replacedRole;
      sound.play('tick');

      setGameState(prev => ({
        ...prev,
        players: prev.players.map((p, idx) => {
          if (p.id === payload.replacedPlayer?.id || `player${idx + 1}` === replacedRole) {
            return {
              ...p,
              isBot: true,
              name: `${p.name.replace(' (Bot)', '')} (Bot)`
            };
          }
          return p;
        })
      }));
    };

    const handleOpponentLeft = (data: any) => {
      // In 3+ player games or if bots exist, replace leaver with bot and KEEP MATCH GOING
      const hasBots = gameState.players.some(p => p.isBot);
      if (gameState.players.length > 2 || hasBots) {
        sound.play('tick');
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => {
            if (p.id !== myPlayerRole) {
              return { ...p, isBot: true, name: `${p.name.replace(' (Bot)', '')} (Bot)` };
            }
            return p;
          })
        }));
      } else {
        // Pure 1v1 with no bots: award win
        setOpponentLeft(true);
        setGameState(prev => ({
          ...prev,
          isOver: true,
          winner: prev.players.find(p => p.id === myPlayerRole) || null
        }));
        sound.play('win');
      }
    };

    socket?.on('opponent_move', handleOpponentMove);
    socket?.on('player_replaced_by_bot', handlePlayerReplacedByBot);
    socket?.on('opponent_left', handleOpponentLeft);

    return () => {
      socket?.off('opponent_move', handleOpponentMove);
      socket?.off('player_replaced_by_bot', handlePlayerReplacedByBot);
      socket?.off('opponent_left', handleOpponentLeft);
    };
  }, [isMultiplayer, gameState, myPlayerRole, animatePawnMovement]);

  const handleRestart = () => {
    const initial = createInitialSnakesLadders(selectedPlayerCount);
    setGameState(initial);
    setDisplayPositions({ p1: 1, p2: 1, p3: 1, p4: 1 });
    setIsRolling(false);
    setIsMovingPawn(false);
    setMoveCount(0);
  };

  // 100 tiles mapped to (r, c)
  const tiles = useMemo(() => {
    const list: { num: number; r: number; c: number }[] = [];
    for (let i = 1; i <= 100; i++) {
      const { r, c } = getSquareCoord(i);
      list.push({ num: i, r, c });
    }
    list.sort((a, b) => (a.r === b.r ? a.c - b.c : a.r - b.r));
    return list;
  }, []);

  const getTileCenter = (sqNum: number) => {
    const { r, c } = getSquareCoord(sqNum);
    return {
      x: (c + 0.5) * 10,
      y: (r + 0.5) * 10
    };
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 select-none">
      {/* Top Header & Players Bar */}
      <div className="w-full flex flex-wrap items-center justify-between bg-stone-900/95 border border-emerald-900/50 rounded-2xl p-4 mb-3 backdrop-blur-md shadow-2xl gap-3">
        {/* Left: Player Turn Status */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 font-black text-sm"
            style={{ backgroundColor: activePlayer?.color || '#10b981' }}
          >
            {activePlayer?.isBot ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span>{activePlayer?.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-800 text-stone-300 border border-stone-700">
                Turn {gameState.currentTurnIndex + 1}/{gameState.playerCount}
              </span>
            </div>
            <div className="text-sm font-black text-emerald-300">
              Tile {displayPositions[activePlayer?.id || 'p1']} / 100
            </div>
          </div>
        </div>

        {/* Center: Match Status */}
        <div className="text-center px-2">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
              gameState.isOver
                ? 'bg-stone-800 text-stone-400 border-stone-700'
                : isMyTurn
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/20 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {gameState.isOver
              ? 'Ascent Complete'
              : isMyTurn
              ? 'Your Turn - Roll Die'
              : `${activePlayer?.name}'s Turn...`}
          </div>
          <div className="text-[11px] text-stone-300 font-semibold mt-1 max-w-[280px] truncate">
            {gameState.eventMessage}
          </div>
        </div>

        {/* Right: Player Count Selector (in Solo/Bot mode) */}
        {!isMultiplayer && (
          <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
            <span className="text-[10px] font-bold text-stone-400 px-2 uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> Players:
            </span>
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => handlePlayerCountChange(count)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  selectedPlayerCount === count
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {count}P
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full mb-3">
        <TimerBar
          timeLeft={timeLeft}
          percent={percent}
          isMyTurn={isMyTurn}
          gameOver={gameState.isOver}
          statusText={gameState.eventMessage}
        />
      </div>

      {/* Main Board Arena & Side Roller */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        {/* 10x10 Board with Real Rendered Snakes and Ladders Overlays */}
        <div className="relative p-3 rounded-3xl bg-gradient-to-br from-[#0c2415] via-[#06140b] to-[#020804] border-4 border-emerald-500/60 shadow-2xl shadow-black/90">
          <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-2xl overflow-hidden bg-stone-900 border border-stone-800">
            {/* 100 Grid Cells */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
              {tiles.map(({ num, r, c }) => {
                const isEvenCell = (r + c) % 2 === 0;
                const isSnakeHead = SNAKES[num] !== undefined;
                const isLadderBase = LADDERS[num] !== undefined;

                return (
                  <div
                    key={num}
                    className={`relative flex items-center justify-center border border-emerald-950/40 ${
                      num === 100
                        ? 'bg-gradient-to-tr from-amber-500/35 via-yellow-400/25 to-amber-600/35 text-yellow-300 font-black'
                        : isSnakeHead
                        ? 'bg-red-950/40 text-rose-300'
                        : isLadderBase
                        ? 'bg-emerald-950/40 text-emerald-300'
                        : isEvenCell
                        ? 'bg-[#0f1f15] text-stone-400'
                        : 'bg-[#0a160f] text-stone-400'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[11px] font-mono font-bold opacity-75 absolute top-1 left-1">
                      {num}
                    </span>

                    {/* Clear Tile Badge */}
                    {isSnakeHead && (
                      <span className="text-[8px] sm:text-[10px] font-black text-rose-400 absolute bottom-0.5 right-0.5 flex items-center">
                        🐍↓{SNAKES[num]}
                      </span>
                    )}
                    {isLadderBase && (
                      <span className="text-[8px] sm:text-[10px] font-black text-amber-400 absolute bottom-0.5 right-0.5 flex items-center">
                        🪜↑{LADDERS[num]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SVG Overlay: Real Winding Snakes & Golden Ladders */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="40%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="ladderGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
              </defs>

              {/* Render Ladders with Rails and Rungs */}
              {Object.entries(LADDERS).map(([startStr, end]) => {
                const start = Number(startStr);
                const p1 = getTileCenter(start);
                const p2 = getTileCenter(end);

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const len = Math.hypot(dx, dy) || 1;
                const nx = (-dy / len) * 1.5;
                const ny = (dx / len) * 1.5;

                return (
                  <g key={`ladder-${start}`}>
                    {/* Rail 1 */}
                    <line
                      x1={p1.x - nx}
                      y1={p1.y - ny}
                      x2={p2.x - nx}
                      y2={p2.y - ny}
                      stroke="url(#ladderGold)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    {/* Rail 2 */}
                    <line
                      x1={p1.x + nx}
                      y1={p1.y + ny}
                      x2={p2.x + nx}
                      y2={p2.y + ny}
                      stroke="url(#ladderGold)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    {/* Ladder Rungs */}
                    {[0.2, 0.4, 0.6, 0.8].map((t, idx) => (
                      <line
                        key={idx}
                        x1={p1.x - nx + dx * t}
                        y1={p1.y - ny + dy * t}
                        x2={p1.x + nx + dx * t}
                        y2={p1.y + ny + dy * t}
                        stroke="#fef08a"
                        strokeWidth="0.9"
                      />
                    ))}
                  </g>
                );
              })}

              {/* Render Winding Snakes */}
              {Object.entries(SNAKES).map(([headStr, tail]) => {
                const head = Number(headStr);
                const pHead = getTileCenter(head);
                const pTail = getTileCenter(tail);

                const midX = (pHead.x + pTail.x) / 2 + (head % 2 === 0 ? 7 : -7);
                const midY = (pHead.y + pTail.y) / 2;

                return (
                  <g key={`snake-${head}`}>
                    <path
                      d={`M ${pHead.x} ${pHead.y} Q ${midX} ${midY} ${pTail.x} ${pTail.y}`}
                      fill="none"
                      stroke="url(#snakeGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.95"
                    />
                    {/* Snake Head with Menacing Eye & Fangs */}
                    <circle cx={pHead.x} cy={pHead.y} r="2.2" fill="#ef4444" stroke="#fef08a" strokeWidth="0.6" />
                    <circle cx={pHead.x - 0.5} cy={pHead.y - 0.5} r="0.6" fill="#ffffff" />
                  </g>
                );
              })}
            </svg>

            {/* Animated Player Tokens with Stacking Offsets */}
            {gameState.players.map((p, pIdx) => {
              const pos = displayPositions[p.id] || 1;
              const { x, y } = getTileCenter(pos);
              // Slight offset if multiple pawns share the same tile
              const offsetX = (pIdx % 2 === 0 ? -1.5 : 1.5) * (gameState.playerCount > 2 ? 1 : 0);
              const offsetY = (pIdx < 2 ? -1.5 : 1.5) * (gameState.playerCount > 2 ? 1 : 0);

              return (
                <div
                  key={p.id}
                  style={{
                    left: `${x + offsetX}%`,
                    top: `${y + offsetY}%`,
                    backgroundColor: p.color
                  }}
                  className={`absolute z-20 w-5 h-5 sm:w-6 sm:h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 shadow-lg border-2 border-white ring-2 flex items-center justify-center text-[10px] font-black ${
                    gameState.players[gameState.currentTurnIndex]?.id === p.id
                      ? 'scale-125 ring-white animate-pulse z-30'
                      : 'ring-black/40'
                  }`}
                >
                  <span className="text-white drop-shadow">P{pIdx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3D Dice Panel & Controls */}
        <div className="flex flex-col items-center gap-4 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl w-full md:w-64">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Dices className="w-4 h-4 text-emerald-400" />
            <span>Sacred D6 Cube</span>
          </span>

          {/* 3D Die Cube with Real Pips */}
          <div
            className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-stone-200 border-2 border-stone-300 shadow-2xl flex items-center justify-center transition-transform duration-300 ${
              isRolling ? 'rotate-180 scale-90' : 'hover:scale-105'
            }`}
          >
            {gameState.lastRoll ? (
              DICE_PIPS[gameState.lastRoll]?.map((pip, idx) => (
                <div
                  key={idx}
                  style={{ top: pip.top, left: pip.left }}
                  className="absolute w-3.5 h-3.5 rounded-full bg-stone-900 transform -translate-x-1/2 -translate-y-1/2 shadow-inner"
                />
              ))
            ) : (
              <span className="text-stone-400 text-2xl font-black">?</span>
            )}
          </div>

          {gameState.extraRoll && !gameState.isOver && (
            <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-900/50 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>Rolled 6! Roll Again!</span>
            </div>
          )}

          <button
            onClick={handleRollDice}
            disabled={!isMyTurn || isRolling || isMovingPawn || gameState.isOver}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
              isMyTurn && !isRolling && !isMovingPawn && !gameState.isOver
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>{isRolling ? 'Rolling...' : isMyTurn ? 'Roll Die' : 'Waiting...'}</span>
          </button>

          {/* Player Legend */}
          <div className="w-full flex flex-col gap-1.5 pt-2 border-t border-stone-800 text-xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Players</span>
            {gameState.players.map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-1.5 rounded-xl border ${
                  gameState.currentTurnIndex === idx
                    ? 'bg-stone-800 border-emerald-500/40 text-white'
                    : 'bg-stone-950/50 border-stone-800/80 text-stone-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-semibold text-xs">{p.name}</span>
                </div>
                <span className="font-mono text-xs text-emerald-400">Tile {displayPositions[p.id]}</span>
              </div>
            ))}
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
          themeColor="emerald"
          maxWidthClass="max-w-md"
          opponentLeft={opponentLeft}
        />
      </div>
    </div>
  );
};

export default SnakesLaddersGame;
