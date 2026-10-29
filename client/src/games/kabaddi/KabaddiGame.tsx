// client/src/games/kabaddi/KabaddiGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Shield,
  Zap,
  Flame,
  Award,
  Users,
  Bot,
  User,
  Timer,
  ChevronRight,
  Activity,
  RotateCcw
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  KabaddiState,
  RaiderMove,
  DefenderTactic,
  ApproachVector,
  RAIDER_MOVES,
  DEFENDER_TACTICS,
  createInitialKabaddi,
  resolveRaid,
  getKabaddiBotMove
} from './rules';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface KabaddiGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const KabaddiGame: React.FC<KabaddiGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [gameState, setGameState] = useState<KabaddiState>(createInitialKabaddi);
  const [selectedApproach, setSelectedApproach] = useState<ApproachVector>('center');
  const [selectedMove, setSelectedMove] = useState<RaiderMove>('hand_touch');
  const [selectedTactic, setSelectedTactic] = useState<DefenderTactic>('chain_tackle');
  const [isRaidingAnimation, setIsRaidingAnimation] = useState(false);
  const [showResultBanner, setShowResultBanner] = useState(false);
  const [chantIndex, setChantIndex] = useState(0);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

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

  // Is this client's turn to act (Raider or Defender)
  const isMyTurn = isMultiplayer
    ? (gameState.currentTurn === myPlayerRole)
    : true; // In bot mode, user always controls their active role

  const amIRaider = isMultiplayer
    ? gameState.currentTurn === myPlayerRole
    : gameState.currentTurn === 'p1';

  // "Kabaddi! Kabaddi!" Audio-Visual Chant Rhythm
  useEffect(() => {
    const interval = setInterval(() => {
      setChantIndex(prev => (prev + 1) % 4);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // Turn Timer
  const handleTimeout = useCallback(() => {
    if (gameState.isOver) return;
    sound.play('loss');
    setGameState(prev => ({
      ...prev,
      isOver: true,
      winner: myPlayerRole === 'p1' ? 'p2' : 'p1'
    }));
    recordGameResult('loss');
  }, [gameState.isOver, myPlayerRole]);

  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameState.isOver && !isRaidingAnimation && isMyTurn,
    isMyTurn,
    turnKey: `${moveCount}-${gameState.currentRaidNumber}-${gameState.currentTurn}`,
    initialTime: 30,
    onTimeout: handleTimeout
  });

  const handleGameOver = useCallback((state: KabaddiState) => {
    const isMeWinner = state.winner === myPlayerRole || (!isMultiplayer && state.winner === 'p1');
    if (isMeWinner) {
      sound.play('win');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      recordGameResult('win');
    } else {
      sound.play('loss');
      recordGameResult('loss');
    }
  }, [myPlayerRole, isMultiplayer]);

  // Execute Raid Clash
  const handleExecuteRaid = useCallback(() => {
    if (gameState.isOver || isRaidingAnimation) return;

    sound.play('click');
    setIsRaidingAnimation(true);
    setShowResultBanner(false);

    // If bot mode: generate bot defense/raid response
    let defTactic = selectedTactic;
    let raidMv = selectedMove;
    let appVec = selectedApproach;

    if (mode === 'bot') {
      if (gameState.currentTurn === 'p1') {
        // User is raiding, Bot is defending
        const botDef = getKabaddiBotMove(false, gameState, botDifficulty);
        defTactic = botDef.defenderTactic || 'chain_tackle';
      } else {
        // Bot is raiding, User is defending
        const botRaid = getKabaddiBotMove(true, gameState, botDifficulty);
        raidMv = botRaid.raiderMove || 'hand_touch';
        appVec = botRaid.approach || 'center';
      }
    }

    setTimeout(() => {
      const res = resolveRaid(gameState, raidMv, defTactic, appVec);
      setIsRaidingAnimation(false);
      setShowResultBanner(true);
      setMoveCount(c => c + 1);

      if (res.success) {
        sound.play('win');
        if (res.superRaid) {
          confetti({ particleCount: 80, spread: 70 });
        }
      } else {
        sound.play('loss');
      }

      setGameState(res.nextState);

      if (res.nextState.isOver) {
        handleGameOver(res.nextState);
      }

      if (isMultiplayer && multiplayerData?.roomId) {
        const socket = getSocket();
        socket?.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: {
            type: 'raid_clash',
            raiderMove: raidMv,
            defenderTactic: defTactic,
            approach: appVec,
            resultState: res.nextState
          }
        });
      }
    }, 1200);
  }, [
    gameState,
    isRaidingAnimation,
    selectedMove,
    selectedTactic,
    selectedApproach,
    mode,
    botDifficulty,
    isMultiplayer,
    multiplayerData,
    handleGameOver
  ]);

  // Bot Turn Automation when Bot is Raider in single player
  useEffect(() => {
    if (mode === 'bot' && gameState.currentTurn === 'p2' && !gameState.isOver && !isRaidingAnimation && !showResultBanner) {
      const timer = setTimeout(() => {
        handleExecuteRaid();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mode, gameState.currentTurn, gameState.isOver, isRaidingAnimation, showResultBanner, handleExecuteRaid]);

  // Multiplayer socket synchronization
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleOpponentMove = (payload: any) => {
      const move = payload?.move;
      if (move?.type === 'raid_clash' && move.resultState) {
        sound.play('tick');
        setGameState(move.resultState);
        setShowResultBanner(true);
        setMoveCount(c => c + 1);
        if (move.resultState.isOver) {
          handleGameOver(move.resultState);
        }
      }
    };

    const handleOpponentLeft = () => {
      setOpponentLeft(true);
      setGameState(prev => ({
        ...prev,
        isOver: true,
        winner: myPlayerRole
      }));
      sound.play('win');
    };

    socket?.on('opponent_move', handleOpponentMove);
    socket?.on('opponent_left', handleOpponentLeft);

    return () => {
      socket?.off('opponent_move', handleOpponentMove);
      socket?.off('opponent_left', handleOpponentLeft);
    };
  }, [isMultiplayer, myPlayerRole, handleGameOver]);

  const handleRestart = () => {
    setGameState(createInitialKabaddi());
    setShowResultBanner(false);
    setIsRaidingAnimation(false);
    setMoveCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 select-none">
      {/* Pro Kabaddi Live Scoreboard Header */}
      <div className="w-full bg-gradient-to-r from-orange-950/90 via-gray-900 to-blue-950/90 border border-orange-500/30 rounded-3xl p-4 sm:p-5 mb-3 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Team 1 (Raiders / P1) */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-neon-orange">
              🐅
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <span>{mode === 'bot' ? 'You (Thunder Tigers)' : 'Player 1'}</span>
                {gameState.currentTurn === 'p1' && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold border border-orange-500/40 animate-pulse">
                    RAIDING
                  </span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {gameState.team1Score}{' '}
                <span className="text-xs text-gray-400 font-normal">
                  ({gameState.team1Defenders}/7 Active)
                </span>
              </div>
            </div>
          </div>

          {/* Central Raid Status & 30s Clock */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
              Raid {gameState.currentRaidNumber} / {gameState.maxRaids}
            </div>

            {/* Continuous Kabaddi Chant Indicator */}
            <div className="px-3 py-1 rounded-full bg-black/60 border border-orange-500/30 flex items-center gap-1.5 text-xs font-black text-orange-400">
              <span className={chantIndex === 0 ? 'text-amber-300 scale-110' : 'opacity-40'}>KA</span>
              <span className={chantIndex === 1 ? 'text-amber-300 scale-110' : 'opacity-40'}>BAD</span>
              <span className={chantIndex === 2 ? 'text-amber-300 scale-110' : 'opacity-40'}>DI!</span>
              <Activity className="w-3.5 h-3.5 text-orange-400 animate-pulse ml-1" />
            </div>

            {gameState.isDoOrDie && (
              <span className="mt-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider animate-bounce shadow">
                ⚠️ DO OR DIE RAID
              </span>
            )}
          </div>

          {/* Team 2 (Defenders / P2) */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center justify-end gap-1.5">
                {gameState.currentTurn === 'p2' && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 animate-pulse">
                    RAIDING
                  </span>
                )}
                <span>{mode === 'bot' ? `Iron Bulls (${botDifficulty})` : 'Player 2'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {gameState.team2Score}{' '}
                <span className="text-xs text-gray-400 font-normal">
                  ({gameState.team2Defenders}/7 Active)
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-neon-cyan">
              🐂
            </div>
          </div>
        </div>

        <div className="mt-3">
          <TimerBar timeLeft={timeLeft} percent={percent} isMyTurn={isMyTurn} gameOver={gameState.isOver} />
        </div>
      </div>

      {/* The Official Pro Kabaddi Mat Field */}
      <div className="relative w-full aspect-[2.1/1] max-h-[360px] bg-[#1a1510] border-4 border-amber-600/60 rounded-3xl p-3 shadow-2xl overflow-hidden flex flex-col justify-between my-2">
        {/* Synthetic Mat Texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#b45309]/30 via-[#78350f]/20 to-[#1e3a8a]/30 pointer-events-none" />

        {/* Side Lobbies (Yellow Strips) */}
        <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-amber-400/20 border-r border-amber-400/40 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 rotate-90 opacity-60">
            LOBBY
          </span>
        </div>
        <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-12 bg-amber-400/20 border-l border-amber-400/40 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 -rotate-90 opacity-60">
            LOBBY
          </span>
        </div>

        {/* Center Midline */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1.5 -translate-x-1/2 bg-white shadow-[0_0_12px_#ffffff] z-10 flex flex-col items-center justify-center">
          <div className="px-2 py-1 rounded bg-black/80 text-[9px] font-black uppercase tracking-wider text-white border border-white/40">
            MIDLINE
          </div>
        </div>

        {/* Baulk Lines (White) */}
        <div className="absolute top-0 bottom-0 left-[26%] w-1 bg-white/70" />
        <div className="absolute top-0 bottom-0 right-[26%] w-1 bg-white/70" />

        {/* Bonus Lines (Orange) */}
        <div className="absolute top-0 bottom-0 left-[18%] w-1 bg-orange-500/90 shadow-[0_0_8px_#f97316]" />
        <div className="absolute top-0 bottom-0 right-[18%] w-1 bg-orange-500/90 shadow-[0_0_8px_#f97316]" />

        {/* Court Half-Labels */}
        <div className="absolute bottom-2 left-16 text-[10px] font-black uppercase text-orange-400/50">
          TEAM 1 COURT (TIGERS)
        </div>
        <div className="absolute bottom-2 right-16 text-[10px] font-black uppercase text-cyan-400/50">
          TEAM 2 COURT (BULLS)
        </div>

        {/* Active Defender Silhouettes on Defender Court */}
        <div className="relative z-20 w-full h-full flex items-center justify-between px-14 sm:px-20 pointer-events-none">
          {/* Left Team (If defending) */}
          <div className="flex flex-col gap-2">
            {gameState.currentTurn === 'p2' && (
              <div className="flex flex-wrap gap-2 max-w-[140px]">
                {Array.from({ length: gameState.team1Defenders }).map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-600 border border-orange-300 flex items-center justify-center text-xs font-black text-white shadow-neon-orange animate-pulse"
                  >
                    D{i + 1}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raider Dynamic Figure */}
          <div
            className={`transition-all duration-700 transform ${
              isRaidingAnimation
                ? gameState.currentTurn === 'p1'
                  ? 'translate-x-28 sm:translate-x-36 scale-125'
                  : '-translate-x-28 sm:-translate-x-36 scale-125'
                : 'translate-x-0'
            }`}
          >
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-2xl border-2 ${
                gameState.currentTurn === 'p1'
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-300 shadow-neon-orange'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 shadow-neon-cyan'
              }`}
            >
              <span className="text-xl">🏃</span>
              <span className="text-[8px] font-extrabold uppercase">
                {gameState.currentTurn === 'p1' ? 'TIGER 07' : 'BULL 01'}
              </span>
            </div>
          </div>

          {/* Right Team (If defending) */}
          <div className="flex flex-col gap-2 items-end">
            {gameState.currentTurn === 'p1' && (
              <div className="flex flex-wrap gap-2 max-w-[140px] justify-end">
                {Array.from({ length: gameState.team2Defenders }).map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-600 border border-cyan-300 flex items-center justify-center text-xs font-black text-white shadow-neon-cyan animate-pulse"
                  >
                    D{i + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clash Result Pop-in Banner */}
      {showResultBanner && gameState.raidResult && (
        <div className="w-full bg-gray-900/95 border border-amber-500/40 rounded-2xl p-4 my-2 text-center animate-fade-in shadow-2xl">
          <div className="text-sm sm:text-base font-black text-amber-300">
            {gameState.raidResult.commentary}
          </div>
          <div className="flex justify-center gap-3 mt-2 text-xs font-bold text-gray-300">
            <span>Points Scored: +{gameState.raidResult.points}</span>
            {gameState.raidResult.superRaid && (
              <span className="text-amber-400 font-black">🔥 SUPER RAID!</span>
            )}
            {gameState.raidResult.superTackle && (
              <span className="text-cyan-400 font-black">🛡️ SUPER TACKLE!</span>
            )}
            {gameState.raidResult.bonus && (
              <span className="text-emerald-400 font-black">✨ BONUS POINT!</span>
            )}
          </div>
        </div>
      )}

      {/* Tactical Raider / Defender Action Controls */}
      {!gameState.isOver && (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-3xl p-4 sm:p-5 mt-2 space-y-4">
          {amIRaider ? (
            /* --- RAIDER CONTROL PANEL --- */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Choose Raider Attack Vector & Technique</span>
                </span>
                <span className="text-[11px] text-gray-400">
                  Targeting {gameState.currentTurn === 'p1' ? gameState.team2Defenders : gameState.team1Defenders} Defenders
                </span>
              </div>

              {/* Approach Direction */}
              <div className="grid grid-cols-3 gap-2">
                {(['left_corner', 'center', 'right_corner'] as ApproachVector[]).map(vec => (
                  <button
                    key={vec}
                    type="button"
                    onClick={() => { setSelectedApproach(vec); sound.play('click'); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      selectedApproach === vec
                        ? 'bg-orange-500/20 border-orange-400 text-orange-300 ring-2 ring-orange-500/40'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {vec.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Move Selection Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RAIDER_MOVES.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setSelectedMove(m.id); sound.play('click'); }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      selectedMove === m.id
                        ? 'bg-orange-950/40 border-orange-400 ring-2 ring-orange-500/50 shadow-neon-orange'
                        : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{m.icon}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 font-extrabold text-orange-300">
                          {m.maxPoints > 1 ? `Up to ${m.maxPoints} pts` : '+1 pt'}
                        </span>
                      </div>
                      <div className="text-xs font-black text-white">{m.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{m.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Launch Raid Button */}
              <button
                type="button"
                onClick={handleExecuteRaid}
                disabled={isRaidingAnimation}
                className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-neon-orange active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>{isRaidingAnimation ? 'Raiding in progress...' : 'Execute Raid Attack!'}</span>
              </button>
            </div>
          ) : (
            /* --- DEFENDER CONTROL PANEL --- */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Set Defensive Formation & Tackle Hold</span>
                </span>
                <span className="text-[11px] text-gray-400">Incoming Raider Alert</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFENDER_TACTICS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setSelectedTactic(t.id); sound.play('click'); }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedTactic === t.id
                        ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/50 shadow-neon-cyan'
                        : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <div className="text-xs font-black text-white">{t.name}</div>
                        <div className="text-[10px] text-cyan-300/80">{t.counter}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExecuteRaid}
                disabled={isRaidingAnimation}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-neon-cyan active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>{isRaidingAnimation ? 'Tackling...' : 'Lock Defensive Formation'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game Over Modal Screen */}
      {gameState.isOver && (
        <div className="w-full bg-gray-900 border border-amber-500/40 rounded-3xl p-6 mt-3 text-center space-y-4 shadow-2xl">
          <div className="text-4xl">🏆</div>
          <h3 className="text-2xl font-black text-white">
            {gameState.winner === myPlayerRole
              ? 'Victory! You Won the Match!'
              : gameState.winner === 'tie'
              ? 'Tied Match! Legendary Duel!'
              : 'Defeat! Opponent Won the Match!'}
          </h3>
          <p className="text-sm text-gray-300">
            Final Score: Tigers {gameState.team1Score} - {gameState.team2Score} Bulls
          </p>

          <RematchActions
            gameOver={gameState.isOver}
            mode={mode}
            multiplayerData={multiplayerData}
            onReset={handleRestart}
            onExit={onExit}
            opponentLeft={opponentLeft}
            themeColor="amber"
          />
        </div>
      )}
    </div>
  );
};
