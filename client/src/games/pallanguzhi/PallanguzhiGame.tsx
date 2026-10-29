// client/src/games/pallanguzhi/PallanguzhiGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Bot, User, RotateCcw, Info } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  PallanguzhiState,
  P1_PITS,
  P2_PITS,
  createInitialPallanguzhi,
  executePallanguzhiMove,
  getPallanguzhiBotMove
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface PallanguzhiGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const PallanguzhiGame: React.FC<PallanguzhiGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [gameState, setGameState] = useState<PallanguzhiState>(createInitialPallanguzhi);
  const [activeSowingPit, setActiveSowingPit] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select one of your pits to sow cowries');
  const [moveCount, setMoveCount] = useState<number>(0);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerRole: 'p1' | 'p2' = useMemo(() => {
    if (mode === 'bot') return 'p1';
    return multiplayerData?.yourRole === 'player2' ? 'p2' : 'p1';
  }, [mode, multiplayerData]);

  const isMyTurn = isMultiplayer
    ? gameState.currentTurn === myPlayerRole
    : gameState.currentTurn === 'p1';

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
    isActive: !gameState.isOver && !isAnimating,
    isMyTurn,
    turnKey: `${moveCount}-${gameState.currentTurn}`,
    initialTime: 30,
    onTimeout: handleTimeoutLoss
  });

  const handleGameOver = useCallback((state: PallanguzhiState) => {
    const isMeWinner = state.winner === myPlayerRole || (!isMultiplayer && state.winner === 'p1');
    if (isMeWinner) {
      sound.play('win');
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      recordGameResult('win');
    } else if (state.winner === 'tie') {
      sound.play('move');
      recordGameResult('draw');
    } else {
      sound.play('loss');
      recordGameResult('loss');
    }
  }, [myPlayerRole, isMultiplayer]);

  // Handle move execution with step-by-step sowing animation
  const handlePitSelect = useCallback((pitIndex: number) => {
    if (gameState.isOver || isAnimating) return;
    if (isMultiplayer && gameState.currentTurn !== myPlayerRole) return;
    if (!isMultiplayer && gameState.currentTurn !== 'p1') return;

    const validPits = gameState.currentTurn === 'p1' ? P1_PITS : P2_PITS;
    if (!validPits.includes(pitIndex) || gameState.pits[pitIndex] === 0) return;

    sound.play('click');
    const result = executePallanguzhiMove(gameState, pitIndex, gameState.currentTurn);
    setIsAnimating(true);
    setActiveSowingPit(pitIndex);

    // Animate sowing
    let step = 0;
    const history = result.sowHistory;
    const interval = setInterval(() => {
      if (step < history.length) {
        setActiveSowingPit(history[step].pit);
        sound.play('tick');
        step++;
      } else {
        clearInterval(interval);
        setActiveSowingPit(null);
        setIsAnimating(false);
        setGameState(result.nextState);
        setMoveCount(c => c + 1);

        if (result.capturedSeeds > 0) {
          sound.play('capture');
          setStatusMessage(`Captured ${result.capturedSeeds} cowries!`);
        } else {
          setStatusMessage('Turn passed to opponent');
        }

        if (result.nextState.isOver) {
          handleGameOver(result.nextState);
        }

        // Multiplayer socket sync
        if (isMultiplayer && multiplayerData?.roomId) {
          const socket = getSocket();
          socket?.emit('make_move', {
            roomId: multiplayerData.roomId,
            move: { pitIndex }
          });
        }
      }
    }, 160);
  }, [gameState, isAnimating, isMultiplayer, myPlayerRole, multiplayerData, handleGameOver]);

  // Bot Turn trigger
  useEffect(() => {
    if (mode === 'bot' && gameState.currentTurn === 'p2' && !gameState.isOver && !isAnimating) {
      const timer = setTimeout(() => {
        const botMove = getPallanguzhiBotMove(gameState, botDifficulty);
        if (botMove !== -1) {
          sound.play('click');
          const result = executePallanguzhiMove(gameState, botMove, 'p2');
          setIsAnimating(true);
          setActiveSowingPit(botMove);

          let step = 0;
          const interval = setInterval(() => {
            if (step < result.sowHistory.length) {
              setActiveSowingPit(result.sowHistory[step].pit);
              sound.play('tick');
              step++;
            } else {
              clearInterval(interval);
              setActiveSowingPit(null);
              setIsAnimating(false);
              setGameState(result.nextState);
              setMoveCount(c => c + 1);
              if (result.capturedSeeds > 0) {
                sound.play('capture');
                setStatusMessage(`Bot captured ${result.capturedSeeds} cowries!`);
              }
              if (result.nextState.isOver) {
                handleGameOver(result.nextState);
              }
            }
          }, 160);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [gameState, mode, botDifficulty, isAnimating, handleGameOver]);

  // Multiplayer opponent move listener
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();
    const handleRemoteMove = (payload: any) => {
      const pitIndex = payload?.move?.pitIndex;
      if (typeof pitIndex === 'number' && pitIndex >= 0 && pitIndex < 14) {
        const result = executePallanguzhiMove(gameState, pitIndex, gameState.currentTurn);
        setIsAnimating(true);
        setActiveSowingPit(pitIndex);
        let step = 0;
        const interval = setInterval(() => {
          if (step < result.sowHistory.length) {
            setActiveSowingPit(result.sowHistory[step].pit);
            sound.play('tick');
            step++;
          } else {
            clearInterval(interval);
            setActiveSowingPit(null);
            setIsAnimating(false);
            setGameState(result.nextState);
            setMoveCount(c => c + 1);
            if (result.nextState.isOver) {
              handleGameOver(result.nextState);
            }
          }
        }, 160);
      }
    };

    const handleOpponentLeft = () => {
      setOpponentLeft(true);
      setGameState(prev => ({ ...prev, isOver: true, winner: myPlayerRole }));
      sound.play('win');
    };

    socket?.on('opponent_moved', handleRemoteMove);
    socket?.on('opponent_left', handleOpponentLeft);
    return () => {
      socket?.off('opponent_moved', handleRemoteMove);
      socket?.off('opponent_left', handleOpponentLeft);
    };
  }, [isMultiplayer, gameState, myPlayerRole, handleGameOver]);

  // Restart
  const handleRestart = () => {
    setGameState(createInitialPallanguzhi());
    setIsAnimating(false);
    setActiveSowingPit(null);
    setMoveCount(0);
    setStatusMessage('Select one of your pits to sow cowries');
  };

  // Cowrie pit renderer helper
  const renderPit = (pitIndex: number) => {
    const count = gameState.pits[pitIndex];
    const isClickable = !isAnimating && !gameState.isOver && isMyTurn &&
      (myPlayerRole === 'p1' ? P1_PITS.includes(pitIndex) : P2_PITS.includes(pitIndex)) &&
      count > 0;
    const isActive = activeSowingPit === pitIndex;

    return (
      <button
        key={pitIndex}
        disabled={!isClickable}
        onClick={() => handlePitSelect(pitIndex)}
        className={`relative flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-2xl transition-all duration-200 ${
          isActive
            ? 'scale-105 ring-4 ring-amber-400 bg-amber-950/80 shadow-lg shadow-amber-500/40'
            : isClickable
            ? 'hover:scale-105 cursor-pointer bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-amber-500/40 hover:border-amber-400 shadow-md hover:shadow-amber-500/20'
            : 'bg-stone-900/90 border border-stone-800/80 cursor-default opacity-85'
        }`}
      >
        <span className="text-[10px] text-stone-400 font-mono absolute top-1.5 font-bold">
          #{pitIndex + 1}
        </span>

        {/* Cowrie shells visual cluster */}
        <div className="flex flex-wrap items-center justify-center gap-1 w-12 h-12 px-1">
          {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
            <span
              key={i}
              className="w-2.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-200 via-amber-100 to-yellow-400 border border-amber-600/60 shadow-sm transform -rotate-12"
            />
          ))}
        </div>

        {/* Count Badge */}
        <span
          className={`text-xs font-black px-2 py-0.5 rounded-full ${
            count > 0
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-500'
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 select-none">
      {/* Top Header / Player stats */}
      <div className="w-full flex items-center justify-between bg-stone-900/90 border border-amber-900/40 rounded-2xl p-4 mb-4 backdrop-blur-md shadow-xl">
        {/* Player 2 / Bot */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            {mode === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {mode === 'bot' ? `Cyber Bot (${botDifficulty})` : multiplayerData?.opponent?.name || 'Opponent'}
            </div>
            <div className="text-lg font-black text-purple-300">
              {gameState.stores.p2} <span className="text-xs font-normal text-stone-400">cowries</span>
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
              ? 'Match Ended'
              : gameState.currentTurn === myPlayerRole
              ? 'Your Turn'
              : mode === 'bot' ? "Bot's Turn..." : "Opponent's Turn..."}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 max-w-[200px] truncate">
            {statusMessage}
          </div>
        </div>

        {/* Player 1 */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              {multiplayerData?.you?.name || 'You'}
            </div>
            <div className="text-lg font-black text-emerald-300">
              {gameState.stores.p1} <span className="text-xs font-normal text-stone-400">cowries</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full mb-3">
        <TimerBar
          timeLeft={timeLeft}
          percent={percent}
          isMyTurn={isMyTurn}
          gameOver={gameState.isOver}
          statusText={statusMessage}
        />
      </div>

      {/* Pallanguzhi Wooden Board Frame */}
      <div className="relative w-full bg-gradient-to-b from-[#2a1b12] via-[#1c120c] to-[#2a1b12] border-4 border-[#854d0e] rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/80 flex flex-col items-center gap-4">
        {/* Top Tray: Player 2 store & pits (13 down to 7) */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
          {/* P2 Side Store */}
          <div className="hidden sm:flex flex-col items-center justify-center w-20 h-44 rounded-2xl bg-black/40 border-2 border-purple-500/30 p-2">
            <span className="text-[10px] text-purple-400 uppercase font-black">P2 Store</span>
            <span className="text-2xl font-black text-purple-300 mt-2">{gameState.stores.p2}</span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Row 2 (Top, P2): Pits 13 down to 7 */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {[13, 12, 11, 10, 9, 8, 7].map(p => renderPit(p))}
            </div>

            {/* Brass Divider with Inlay Motifs */}
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex items-center justify-center">
              <span className="bg-[#1c120c] px-3 text-[10px] text-amber-500/60 font-serif">
                ✦ 14-PIT PALLANGUZHI TRADITION ✦
              </span>
            </div>

            {/* Row 1 (Bottom, P1): Pits 0 up to 6 */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {[0, 1, 2, 3, 4, 5, 6].map(p => renderPit(p))}
            </div>
          </div>

          {/* P1 Side Store */}
          <div className="hidden sm:flex flex-col items-center justify-center w-20 h-44 rounded-2xl bg-black/40 border-2 border-emerald-500/30 p-2">
            <span className="text-[10px] text-emerald-400 uppercase font-black">Your Store</span>
            <span className="text-2xl font-black text-emerald-300 mt-2">{gameState.stores.p1}</span>
          </div>
        </div>

        {/* Legend / Guide */}
        <div className="flex items-center gap-4 text-xs text-amber-300/80 bg-black/30 px-4 py-2 rounded-xl border border-amber-900/30">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Continuous Sowing:</strong> Hand empties &rarr; pickup next pit & continue! Empty next pit &rarr; capture the pit after it (*Pasu*)!
          </span>
        </div>
      </div>

      {/* Rematch Actions component */}
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
export default PallanguzhiGame;
