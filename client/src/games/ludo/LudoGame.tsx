// client/src/games/ludo/LudoGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Bot, User, Dices, Star, Flame, Users } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  LudoState,
  LudoPlayer,
  LudoToken,
  LUDO_TRACK,
  createInitialLudo,
  getTokenCoord,
  getMovableTokenIds,
  moveTokenState,
  getLudoBotChoice,
  GridCoord
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface LudoGameProps {
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

const COLOR_CLASSES: Record<string, { bg: string; text: string; ring: string; border: string }> = {
  red: { bg: 'bg-[#dc2626]', text: 'text-rose-400', ring: 'ring-red-400', border: 'border-red-500' },
  green: { bg: 'bg-[#16a34a]', text: 'text-emerald-400', ring: 'ring-green-400', border: 'border-green-500' },
  yellow: { bg: 'bg-[#eab308]', text: 'text-amber-400', ring: 'ring-yellow-400', border: 'border-yellow-500' },
  blue: { bg: 'bg-[#2563eb]', text: 'text-blue-400', ring: 'ring-blue-400', border: 'border-blue-500' }
};

export const LudoGame: React.FC<LudoGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  // Helper to extract player configs from multiplayer room data
  const getPlayerConfigs = useCallback((playersList?: any[]) => {
    if (!playersList || playersList.length === 0) return undefined;
    return playersList.map((p, idx) => ({
      name: p.name || (p.isBot ? `AI Bot ${idx + 1}` : `Player ${idx + 1}`),
      isBot: Boolean(p.isBot)
    }));
  }, []);

  const initialCount = multiplayerData?.playerCount || multiplayerData?.allPlayers?.length || playerCount || 4;
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(initialCount);
  const [gameState, setGameState] = useState<LudoState>(() => {
    const configs = multiplayerData?.allPlayers ? getPlayerConfigs(multiplayerData.allPlayers) : undefined;
    return createInitialLudo(initialCount, configs);
  });
  const [isRolling, setIsRolling] = useState(false);
  const [animatingTokenId, setAnimatingTokenId] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Roll the die to begin!');
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const botBusyRef = React.useRef<boolean>(false);

  const isMultiplayer = mode !== 'bot';

  // Accurate player ID resolution for 2, 3, or 4 players in friend rooms or matchmaking
  const myPlayerId = useMemo(() => {
    if (mode === 'bot') return 'p1';
    if (!multiplayerData) return 'p1';

    // 1. Match socket ID, user ID, or exact username in allPlayers
    if (multiplayerData.allPlayers && multiplayerData.you) {
      const idx = multiplayerData.allPlayers.findIndex(
        p => (p.socketId && p.socketId === multiplayerData.you?.socketId) ||
             (p.id && p.id === multiplayerData.you?.id) ||
             (p.name && p.name === multiplayerData.you?.name && !p.isBot)
      );
      if (idx !== -1) return `p${idx + 1}`;
    }

    // 2. Fall back to yourRole string ('player1' -> 'p1', 'player2' -> 'p2', 'player3' -> 'p3', 'player4' -> 'p4')
    if (multiplayerData.yourRole) {
      const roleNum = multiplayerData.yourRole.replace('player', '');
      if (roleNum && !isNaN(Number(roleNum))) return `p${roleNum}`;
    }

    return 'p1';
  }, [mode, multiplayerData]);

  // Determine if this client is the designated Room Host (Player 1)
  const isHost = useMemo(() => {
    if (!isMultiplayer) return true;
    if (multiplayerData?.you?.isHost) return true;
    return myPlayerId === 'p1';
  }, [isMultiplayer, multiplayerData, myPlayerId]);

  // Keep state in sync if multiplayer room or player count changes
  useEffect(() => {
    const count = multiplayerData?.playerCount || multiplayerData?.allPlayers?.length || playerCount;
    const configs = multiplayerData?.allPlayers ? getPlayerConfigs(multiplayerData.allPlayers) : undefined;
    setSelectedPlayerCount(count);
    setGameState(createInitialLudo(count, configs));
    setStatusMessage(count === 2 ? '1v1 Ludo Match' : `${count}-Player Ludo Match`);
  }, [playerCount, multiplayerData?.playerCount, multiplayerData?.allPlayers, getPlayerConfigs]);

  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn = isMultiplayer
    ? activePlayer?.id === myPlayerId && !activePlayer?.isBot
    : activePlayer?.id === 'p1';

  // Handle player count change in bot mode
  const handlePlayerCountChange = (count: number) => {
    if (isMultiplayer || isRolling || animatingTokenId !== null) return;
    setSelectedPlayerCount(count);
    setGameState(createInitialLudo(count));
    setStatusMessage(`Switched to ${count}-Player Ludo. Roll the die!`);
    sound.play('click');
  };

  // Turn timer
  const handleTimeoutLoss = useCallback(() => {
    if (gameState.isOver) return;
    sound.play('loss');
    recordGameResult('loss');
  }, [gameState.isOver]);

  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameState.isOver && isMyTurn && !isRolling && animatingTokenId === null,
    isMyTurn,
    turnKey: `${moveCount}-${gameState.currentTurnIndex}-${gameState.canRoll}`,
    initialTime: 30,
    onTimeout: handleTimeoutLoss
  });

  const handleGameOver = useCallback((state: LudoState) => {
    const isMeWinner = state.winner?.id === myPlayerId || (!isMultiplayer && state.winner?.id === 'p1');
    if (isMeWinner) {
      sound.play('win');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      recordGameResult('win');
    } else {
      sound.play('loss');
      recordGameResult('loss');
    }
  }, [myPlayerId, isMultiplayer]);

  const movableTokenIds = useMemo(() => {
    if (gameState.lastRoll === null || gameState.canRoll) return [];
    return getMovableTokenIds(gameState, gameState.lastRoll);
  }, [gameState]);

  // Roll Die Handler
  const handleRollDice = useCallback(() => {
    if (gameState.isOver || isRolling || !gameState.canRoll || animatingTokenId !== null) return;
    if (isMultiplayer && activePlayer?.id !== myPlayerId) return;
    if (!isMultiplayer && activePlayer?.id !== 'p1') return;

    sound.play('click');
    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      sound.play('tick');

      const movables = getMovableTokenIds({ ...gameState, canRoll: false }, roll);
      let nextTurnIndex = gameState.currentTurnIndex;
      let canRollNext = false;

      if (movables.length === 0) {
        if (roll !== 6) {
          nextTurnIndex = (gameState.currentTurnIndex + 1) % gameState.playerCount;
          canRollNext = true;
          setStatusMessage(`${activePlayer.name} rolled ${roll} — No valid moves. Turn passes.`);
        } else {
          canRollNext = true;
          setStatusMessage(`${activePlayer.name} rolled 6! Extra roll granted!`);
        }
      } else {
        setStatusMessage(
          roll === 6
            ? `🔥 ${activePlayer.name} rolled 6! Select a token to move.`
            : `${activePlayer.name} rolled ${roll}! Tap a highlighted token to move.`
        );
      }

      setGameState(prev => ({
        ...prev,
        lastRoll: roll,
        canRoll: canRollNext,
        currentTurnIndex: nextTurnIndex
      }));

      if (isMultiplayer && multiplayerData?.roomId) {
        const socket = getSocket();
        socket?.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: {
            type: 'roll',
            roll,
            canRollNext,
            nextTurnIndex,
            activePlayerName: activePlayer.name
          }
        });
      }
    }, 600);
  }, [gameState, isRolling, animatingTokenId, isMultiplayer, activePlayer, myPlayerId, multiplayerData]);

  // Move token with visual animation
  const handleSelectToken = useCallback((tokenId: number) => {
    if (gameState.isOver || isRolling || gameState.canRoll || animatingTokenId !== null) return;
    if (isMultiplayer && activePlayer?.id !== myPlayerId) return;
    if (!isMultiplayer && activePlayer?.id !== 'p1') return;
    if (!movableTokenIds.includes(tokenId)) return;

    setAnimatingTokenId(tokenId);
    const { nextState, captured, stepsPath } = moveTokenState(gameState, tokenId);

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < stepsPath.length) {
        sound.play('tick');
        stepIdx++;
      } else {
        clearInterval(interval);
        setAnimatingTokenId(null);
        sound.play('move');
        setMoveCount(c => c + 1);

        if (captured) {
          sound.play('capture');
          setStatusMessage(`💥 CUT opponent token back to yard! Bonus turn!`);
        } else if (nextState.currentTurnIndex === gameState.currentTurnIndex && !nextState.isOver) {
          setStatusMessage(`Bonus roll granted! Roll again.`);
        } else {
          setStatusMessage(nextState.canRoll ? 'Roll the dice' : "Next player's turn...");
        }

        setGameState(nextState);

        if (nextState.isOver) {
          handleGameOver(nextState);
        }

        if (isMultiplayer && multiplayerData?.roomId) {
          const socket = getSocket();
          socket?.emit('make_move', {
            roomId: multiplayerData.roomId,
            move: {
              type: 'moveToken',
              tokenId,
              captured,
              nextTurnIndex: nextState.currentTurnIndex,
              canRoll: nextState.canRoll,
              lastRoll: nextState.lastRoll,
              isOver: nextState.isOver,
              winnerId: nextState.winner?.id,
              playersTokens: nextState.players.map(p => p.tokens)
            }
          });
        }
      }
    }, 120);
  }, [gameState, isRolling, animatingTokenId, isMultiplayer, activePlayer, myPlayerId, movableTokenIds, multiplayerData, handleGameOver]);

  // Bot Turn Automation
  useEffect(() => {
    if (gameState.isOver || isRolling || animatingTokenId !== null) return;
    if (!activePlayer?.isBot) return;

    // In multiplayer/rooms, only the host coordinates bot moves
    if (isMultiplayer && !isHost) return;

    if (botBusyRef.current) return;

    if (gameState.canRoll) {
      botBusyRef.current = true;
      const rollTimeout = setTimeout(() => {
        setIsRolling(true);
        sound.play('click');

        setTimeout(() => {
          const roll = Math.floor(Math.random() * 6) + 1;
          setIsRolling(false);
          sound.play('tick');

          const movables = getMovableTokenIds({ ...gameState, canRoll: false }, roll);
          let nextTurnIndex = gameState.currentTurnIndex;
          let canRollNext = false;

          if (movables.length === 0) {
            if (roll !== 6) {
              nextTurnIndex = (gameState.currentTurnIndex + 1) % gameState.playerCount;
              canRollNext = true;
              setStatusMessage(`${activePlayer.name} rolled ${roll} (no moves). Turn passes.`);
            } else {
              canRollNext = true;
              setStatusMessage(`${activePlayer.name} rolled 6! Extra roll.`);
            }
          } else {
            setStatusMessage(`${activePlayer.name} rolled ${roll} and is moving a token...`);
          }

          setGameState(prev => ({
            ...prev,
            lastRoll: roll,
            canRoll: canRollNext,
            currentTurnIndex: nextTurnIndex
          }));

          if (isMultiplayer && multiplayerData?.roomId) {
            const socket = getSocket();
            socket?.emit('make_move', {
              roomId: multiplayerData.roomId,
              move: {
                type: 'roll',
                roll,
                canRollNext,
                nextTurnIndex,
                activePlayerName: activePlayer.name
              }
            });
          }

          botBusyRef.current = false;
        }, 450);
      }, 600);

      return () => {
        clearTimeout(rollTimeout);
        botBusyRef.current = false;
      };
    } else if (gameState.lastRoll !== null) {
      botBusyRef.current = true;
      const moveTimeout = setTimeout(() => {
        const movables = getMovableTokenIds(gameState, gameState.lastRoll!);
        if (movables.length === 0) {
          const nextIdx = (gameState.currentTurnIndex + 1) % gameState.playerCount;
          setGameState(prev => ({
            ...prev,
            currentTurnIndex: nextIdx,
            canRoll: true,
            lastRoll: null
          }));
          botBusyRef.current = false;
          return;
        }

        const choice = getLudoBotChoice(gameState, movables, botDifficulty);
        setAnimatingTokenId(choice);
        const { nextState, captured, stepsPath } = moveTokenState(gameState, choice);

        setTimeout(() => {
          setAnimatingTokenId(null);
          sound.play(captured ? 'capture' : 'move');
          setMoveCount(c => c + 1);
          setGameState(nextState);

          if (nextState.isOver) {
            handleGameOver(nextState);
          }

          if (isMultiplayer && multiplayerData?.roomId) {
            const socket = getSocket();
            socket?.emit('make_move', {
              roomId: multiplayerData.roomId,
              move: {
                type: 'moveToken',
                tokenId: choice,
                captured,
                nextTurnIndex: nextState.currentTurnIndex,
                canRoll: nextState.canRoll,
                lastRoll: nextState.lastRoll,
                isOver: nextState.isOver,
                winnerId: nextState.winner?.id,
                playersTokens: nextState.players.map(p => p.tokens)
              }
            });
          }

          botBusyRef.current = false;
        }, Math.max(250, stepsPath.length * 80));
      }, 500);

      return () => {
        clearTimeout(moveTimeout);
        botBusyRef.current = false;
      };
    }
  }, [
    mode,
    activePlayer,
    gameState,
    animatingTokenId,
    isRolling,
    botDifficulty,
    handleGameOver,
    isMultiplayer,
    isHost,
    multiplayerData
  ]);

  // Multiplayer socket listener
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleOpponentMove = (payload: any) => {
      const move = payload?.move;
      if (!move) return;

      if (move.type === 'roll') {
        const roll = move.roll;
        sound.play('tick');
        setGameState(prev => ({
          ...prev,
          lastRoll: roll,
          canRoll: move.canRollNext !== undefined ? move.canRollNext : false,
          currentTurnIndex: move.nextTurnIndex !== undefined ? move.nextTurnIndex : prev.currentTurnIndex
        }));
        if (move.canRollNext && move.nextTurnIndex !== undefined && move.nextTurnIndex !== gameState.currentTurnIndex) {
          setStatusMessage(`${move.activePlayerName || 'Opponent'} rolled ${roll} (no moves). Turn passes.`);
        } else {
          setStatusMessage(`${move.activePlayerName || 'Opponent'} rolled ${roll}!`);
        }
      } else if (move.type === 'moveToken') {
        sound.play(move.captured ? 'capture' : 'move');
        setAnimatingTokenId(move.tokenId);
        setTimeout(() => setAnimatingTokenId(null), 300);

        setGameState(prev => {
          const updatedPlayers = prev.players.map((p, idx) => {
            if (move.playersTokens && move.playersTokens[idx]) {
              return { ...p, tokens: move.playersTokens[idx] };
            }
            return p;
          });

          const winner = move.winnerId ? updatedPlayers.find(p => p.id === move.winnerId) || null : null;

          return {
            ...prev,
            players: updatedPlayers,
            currentTurnIndex: move.nextTurnIndex !== undefined ? move.nextTurnIndex : prev.currentTurnIndex,
            canRoll: move.canRoll !== undefined ? move.canRoll : true,
            lastRoll: move.lastRoll !== undefined ? move.lastRoll : null,
            isOver: Boolean(move.isOver),
            winner
          };
        });

        setMoveCount(c => c + 1);

        if (move.captured) {
          setStatusMessage('💥 Opponent cut a token back to yard!');
        } else if (move.isOver) {
          setStatusMessage(`🏆 Game Over! Winner: ${move.winnerId || 'Player'}`);
        }
      }
    };

    const handlePlayerReplacedByBot = (payload: any) => {
      const leavingName = payload?.leavingName || 'A player';
      const replacedRole = payload?.replacedRole;
      setStatusMessage(`⚠️ ${leavingName} left. AI Bot has taken over their pawns!`);
      sound.play('tick');

      setGameState(prev => ({
        ...prev,
        players: prev.players.map((p, idx) => {
          if (p.id === payload.replacedPlayer?.id || p.color === payload.replacedPlayer?.color || `player${idx + 1}` === replacedRole) {
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
      if (gameState.playerCount > 2 || hasBots) {
        setStatusMessage(`⚠️ ${data?.leavingName || 'Opponent'} left. AI Bot took over.`);
        sound.play('tick');
        setGameState(prev => ({
          ...prev,
          players: prev.players.map(p => {
            if (p.id !== myPlayerId) {
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
          winner: prev.players.find(p => p.id === myPlayerId) || null
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
  }, [isMultiplayer, gameState, myPlayerId, handleGameOver]);

  const handleRestart = () => {
    setGameState(createInitialLudo(selectedPlayerCount));
    setIsRolling(false);
    setAnimatingTokenId(null);
    setMoveCount(0);
    setStatusMessage('Roll the die to begin!');
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 select-none">
      {/* Top Header stats */}
      <div className="w-full flex flex-wrap items-center justify-between bg-stone-900/95 border border-red-900/40 rounded-2xl p-4 mb-3 backdrop-blur-md shadow-2xl gap-3">
        {/* Left: Active Player Turn */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 font-black text-sm ${
              COLOR_CLASSES[activePlayer?.color || 'red'].bg
            }`}
          >
            {activePlayer?.isBot ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span>{activePlayer?.name}</span>
              <span className="capitalize px-2 py-0.5 rounded-full text-[10px] bg-stone-800 text-stone-300 border border-stone-700">
                {activePlayer?.color}
              </span>
            </div>
            <div className="text-xs font-semibold text-stone-300">
              {activePlayer?.tokens.filter(t => t.isHome).length}/4 Tokens Home
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
                ? 'bg-red-500/25 text-red-300 border-red-500/60 ring-2 ring-red-500/20 animate-pulse'
                : 'bg-stone-800 text-stone-300 border-stone-700'
            }`}
          >
            {gameState.isOver
              ? 'Match Finished'
              : isMyTurn
              ? 'Your Turn - Roll Die'
              : `${activePlayer?.name}'s Turn...`}
          </div>
          <div className="text-[11px] text-amber-300/90 font-medium mt-1 max-w-[260px] truncate">
            {statusMessage}
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
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
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
          statusText={statusMessage}
        />
      </div>

      {/* Main Authentic 15x15 Ludo Board Arena */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
        {/* 15x15 Ludo Board */}
        <div className="relative p-3 rounded-3xl bg-gradient-to-br from-[#1c1917] via-[#0c0a09] to-[#040303] border-4 border-amber-500/50 shadow-2xl shadow-black/90">
          <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] bg-[#f8fafc] rounded-xl overflow-hidden shadow-inner border border-stone-800">
            {/* 1. Four Colored Base Quadrants (6x6 each) */}
            {/* Top-Left: RED BASE (Player 1) */}
            <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-[#dc2626] p-3 flex items-center justify-center border-r-2 border-b-2 border-stone-800">
              <div className="w-[80%] h-[80%] bg-white rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-stone-300">
                {[0, 1, 2, 3].map(slot => (
                  <div key={slot} className="rounded-full bg-[#fee2e2] border-2 border-[#dc2626] flex items-center justify-center" />
                ))}
              </div>
            </div>

            {/* Top-Right: GREEN BASE */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#16a34a] p-3 flex items-center justify-center border-l-2 border-b-2 border-stone-800">
              <div className="w-[80%] h-[80%] bg-white rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-stone-300">
                {[0, 1, 2, 3].map(slot => (
                  <div key={slot} className="rounded-full bg-[#dcfce7] border-2 border-[#16a34a] flex items-center justify-center" />
                ))}
              </div>
            </div>

            {/* Bottom-Right: YELLOW BASE */}
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-[#eab308] p-3 flex items-center justify-center border-l-2 border-t-2 border-stone-800">
              <div className="w-[80%] h-[80%] bg-white rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-stone-300">
                {[0, 1, 2, 3].map(slot => (
                  <div key={slot} className="rounded-full bg-[#fef9c3] border-2 border-[#eab308] flex items-center justify-center" />
                ))}
              </div>
            </div>

            {/* Bottom-Left: BLUE BASE */}
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[#2563eb] p-3 flex items-center justify-center border-r-2 border-t-2 border-stone-800">
              <div className="w-[80%] h-[80%] bg-white rounded-2xl p-2 grid grid-cols-2 gap-2 shadow-inner border border-stone-300">
                {[0, 1, 2, 3].map(slot => (
                  <div key={slot} className="rounded-full bg-[#dbeafe] border-2 border-[#2563eb] flex items-center justify-center" />
                ))}
              </div>
            </div>

            {/* 2. Center Victory Triangles (rows 6..8, cols 6..8) */}
            <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-stone-900 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Left Triangle: RED */}
                <polygon points="0,0 50,50 0,100" fill="#dc2626" />
                {/* Top Triangle: GREEN */}
                <polygon points="0,0 50,50 100,0" fill="#16a34a" />
                {/* Right Triangle: YELLOW */}
                <polygon points="100,0 50,50 100,100" fill="#eab308" />
                {/* Bottom Triangle: BLUE */}
                <polygon points="0,100 50,50 100,100" fill="#2563eb" />
                <circle cx="50" cy="50" r="13" fill="#ffffff" />
                <polygon points="50,42 52,47 57,48 53,52 54,57 50,54 46,57 47,52 43,48 48,47" fill="#fbbf24" />
              </svg>
            </div>

            {/* 3. 15x15 Grid Track Cells Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(15, 1fr)',
                gridTemplateRows: 'repeat(15, 1fr)'
              }}
            >
              {Array.from({ length: 15 }).map((_, r) =>
                Array.from({ length: 15 }).map((_, c) => {
                  const isTrackCell = LUDO_TRACK.some(t => t.r === r && t.c === c);
                  // Home stretches
                  const isRedHomeCell = r === 7 && c >= 1 && c <= 5;
                  const isGreenHomeCell = c === 7 && r >= 1 && r <= 5;
                  const isYellowHomeCell = r === 7 && c >= 9 && c <= 13;
                  const isBlueHomeCell = c === 7 && r >= 9 && r <= 13;

                  // Start cells
                  const isRedStart = r === 6 && c === 1;
                  const isGreenStart = r === 1 && c === 8;
                  const isYellowStart = r === 8 && c === 13;
                  const isBlueStart = r === 13 && c === 6;

                  // Safe star cells
                  const isStarCell =
                    isRedStart || isGreenStart || isYellowStart || isBlueStart ||
                    (r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8) || (r === 8 && c === 2);

                  let cellBg = '';
                  if (isRedHomeCell) cellBg = 'bg-[#ef4444]';
                  else if (isGreenHomeCell) cellBg = 'bg-[#22c55e]';
                  else if (isYellowHomeCell) cellBg = 'bg-[#eab308]';
                  else if (isBlueHomeCell) cellBg = 'bg-[#3b82f6]';
                  else if (isRedStart) cellBg = 'bg-[#f87171] border-2 border-red-600';
                  else if (isGreenStart) cellBg = 'bg-[#4ade80] border-2 border-green-600';
                  else if (isYellowStart) cellBg = 'bg-[#facc15] border-2 border-yellow-600';
                  else if (isBlueStart) cellBg = 'bg-[#60a5fa] border-2 border-blue-600';
                  else if (isTrackCell) cellBg = 'border border-stone-300 bg-white/95';

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`relative flex items-center justify-center ${cellBg}`}
                    >
                      {isStarCell && (
                        <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-stone-800 fill-stone-800 opacity-60 pointer-events-none" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 4. Real-time Tokens Rendered on exact board coordinates for all players */}
            {gameState.players.map((player) =>
              player.tokens.map((token) => {
                const coord = getTokenCoord(token, player);
                const isSelectable =
                  !gameState.canRoll &&
                  isMyTurn &&
                  activePlayer?.id === player.id &&
                  movableTokenIds.includes(token.id);
                const isAnimating = animatingTokenId === token.id && activePlayer?.id === player.id;

                const leftPercent = (coord.c / 15) * 100;
                const topPercent = (coord.r / 15) * 100;

                return (
                  <button
                    key={`${player.id}-${token.id}`}
                    disabled={!isSelectable}
                    onClick={() => handleSelectToken(token.id)}
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      width: '6.66%',
                      height: '6.66%'
                    }}
                    className={`absolute z-20 flex items-center justify-center transition-all duration-150 transform -translate-x-0 -translate-y-0 ${
                      isSelectable
                        ? 'scale-125 cursor-pointer ring-4 ring-yellow-400 animate-bounce'
                        : isAnimating
                        ? 'scale-125 ring-4 ring-white animate-pulse'
                        : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-white font-black text-[9px] flex items-center justify-center shadow-lg border-2 border-white ${
                        COLOR_CLASSES[token.color].bg
                      }`}
                    >
                      {token.isHome ? '👑' : token.id + 1}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 3D Dice Panel & Player Stats */}
        <div className="flex flex-col items-center gap-4 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 shadow-xl w-full md:w-64">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Dices className="w-4 h-4 text-rose-400" />
            <span>Royal Ludo Die</span>
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

          {gameState.lastRoll === 6 && !gameState.isOver && (
            <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-900/50 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>Rolled 6! Roll Again!</span>
            </div>
          )}

          <button
            onClick={handleRollDice}
            disabled={!isMyTurn || isRolling || !gameState.canRoll || gameState.isOver}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
              isMyTurn && !isRolling && gameState.canRoll && !gameState.isOver
                ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/30'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>{isRolling ? 'Rolling...' : isMyTurn && gameState.canRoll ? 'Roll Die' : 'Waiting...'}</span>
          </button>

          {/* All Players List */}
          <div className="w-full flex flex-col gap-1.5 pt-2 border-t border-stone-800 text-xs">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Players</span>
            {gameState.players.map((p, idx) => {
              const homeCount = p.tokens.filter(t => t.isHome).length;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2 rounded-xl border ${
                    gameState.currentTurnIndex === idx
                      ? 'bg-stone-800 border-rose-500/50 text-white shadow'
                      : 'bg-stone-950/50 border-stone-800/80 text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${COLOR_CLASSES[p.color].bg}`} />
                    <span className="font-semibold text-xs">{p.name}</span>
                  </div>
                  <span className="font-mono text-xs text-amber-400">{homeCount}/4 Home</span>
                </div>
              );
            })}
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

export default LudoGame;
