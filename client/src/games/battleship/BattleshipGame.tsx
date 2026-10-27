// client/src/games/battleship/BattleshipGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  PlacedShip,
  generateRandomFleet,
  BattleshipBot,
  createEmptyGrid,
  CellState
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface BattleshipGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const BattleshipGame: React.FC<BattleshipGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [phase, setPhase] = useState<'placement' | 'battle' | 'ended'>('placement');

  const [playerFleet, setPlayerFleet] = useState<PlacedShip[]>([]);
  const [playerGrid, setPlayerGrid] = useState<CellState[][]>(createEmptyGrid());

  const [radarGrid, setRadarGrid] = useState<CellState[][]>(createEmptyGrid());
  const [enemyFleet, setEnemyFleet] = useState<PlacedShip[]>([]);
  const [enemyGrid, setEnemyGrid] = useState<CellState[][]>(createEmptyGrid());

  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'radar' | 'fleet'>('radar');
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);

  const botAi = useMemo(() => new BattleshipBot(), []);

  useEffect(() => {
    deployPlayerFleet();
  }, []);

  const deployPlayerFleet = () => {
    const { fleet, grid } = generateRandomFleet();
    setPlayerFleet(fleet);
    setPlayerGrid(grid);
    sound.play('click');
  };

  const handleStartBattle = () => {
    if (playerFleet.length === 0) return;

    if (mode === 'bot') {
      const enemy = generateRandomFleet();
      setEnemyFleet(enemy.fleet);
      setEnemyGrid(enemy.grid);
      setPhase('battle');
      setIsPlayerTurn(true);
      sound.play('match');
    } else if (multiplayerData) {
      setPhase('battle');
      setIsPlayerTurn(multiplayerData.yourRole === 'player1');
      sound.play('match');
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { type: 'fleet_ready', fleet: playerFleet },
        nextTurnState: {}
      });
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // 30s Move Timer (Active during 'battle' phase)
  const { timeLeft, percent } = useTurnTimer({
    isActive: phase === 'battle',
    isMyTurn: isPlayerTurn,
    turnKey: `${moveCount}-${isPlayerTurn}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (phase !== 'battle') return;
      setPhase('ended');

      if (timedOutUser === 'me') {
        setWinner('opponent');
        setEndMessage('⏰ 30s Radar Strike Timeout! Command lost.');
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
        setWinner('player');
        setEndMessage('🏆 Victory! Opponent commander ran out of 30s time.');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      }
    }
  });

  const handleRadarClick = (r: number, c: number) => {
    if (phase !== 'battle' || !isPlayerTurn || isBotThinking) return;
    if (radarGrid[r][c] !== 'empty') return;

    const isHit = enemyGrid[r][c] === 'ship';
    const nextRadar = radarGrid.map(row => [...row]);
    nextRadar[r][c] = isHit ? 'hit' : 'miss';
    setRadarGrid(nextRadar);
    setMoveCount(prev => prev + 1);

    let didSink = false;
    let sunkShipName = '';

    if (isHit) {
      sound.play('capture');
      const nextEnemyFleet = enemyFleet.map(ship => {
        const hitsCoord = ship.coordinates.some(([sr, sc]) => sr === r && sc === c);
        if (hitsCoord) {
          const hits = ship.hits + 1;
          const sunk = hits >= ship.size;
          if (sunk && !ship.sunk) {
            didSink = true;
            sunkShipName = ship.name;
          }
          return { ...ship, hits, sunk };
        }
        return ship;
      });
      setEnemyFleet(nextEnemyFleet);

      const allSunk = nextEnemyFleet.every(s => s.sunk);
      if (allSunk) {
        setWinner('player');
        setPhase('ended');
        setEndMessage('🏆 Armada Destroyed! All enemy warships sunk!');
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
        return;
      }
    } else {
      sound.play('move');
    }

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { type: 'fire', r, c, isHit, didSink, sunkShipName },
        nextTurnState: { isPlayerTurn: false }
      });
    }

    setIsPlayerTurn(false);
  };

  // Bot Turn Handler
  useEffect(() => {
    if (mode === 'bot' && phase === 'battle' && !isPlayerTurn) {
      setIsBotThinking(true);

      const timer = setTimeout(() => {
        const [br, bc] = botAi.getNextShot(botDifficulty);
        const isHit = playerGrid[br][bc] === 'ship';

        const nextPlayerGrid = playerGrid.map(row => [...row]);
        nextPlayerGrid[br][bc] = isHit ? 'hit' : 'miss';
        setPlayerGrid(nextPlayerGrid);
        setMoveCount(prev => prev + 1);

        let didSink = false;
        if (isHit) {
          sound.play('capture');
          const nextPlayerFleet = playerFleet.map(ship => {
            const hitsCoord = ship.coordinates.some(([sr, sc]) => sr === br && sc === bc);
            if (hitsCoord) {
              const hits = ship.hits + 1;
              const sunk = hits >= ship.size;
              if (sunk && !ship.sunk) didSink = true;
              return { ...ship, hits, sunk };
            }
            return ship;
          });
          setPlayerFleet(nextPlayerFleet);

          const allPlayerSunk = nextPlayerFleet.every(s => s.sunk);
          if (allPlayerSunk) {
            setWinner('opponent');
            setPhase('ended');
            setEndMessage('💀 Defeat! Your armada was destroyed.');
            sound.play('loss');
            recordGameResult('loss');
            setIsBotThinking(false);
            return;
          }
        }

        botAi.registerShotResult([br, bc], isHit, didSink);
        setIsPlayerTurn(true);
        setIsBotThinking(false);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [mode, phase, isPlayerTurn, botDifficulty, botAi, playerGrid, playerFleet]);

  // Multiplayer socket listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;

    const socket = getSocket();

    const handleOpponentMove = (data: { move: { type: string; r?: number; c?: number; isHit?: boolean; didSink?: boolean; fleet?: PlacedShip[] } }) => {
      if (data.move.type === 'fleet_ready' && data.move.fleet) {
        setEnemyFleet(data.move.fleet);
        const grid = createEmptyGrid();
        data.move.fleet.forEach(s => {
          s.coordinates.forEach(([r, c]) => { grid[r][c] = 'ship'; });
        });
        setEnemyGrid(grid);
      } else if (data.move.type === 'fire') {
        const { r, c } = data.move;
        if (r !== undefined && c !== undefined) {
          const isHit = playerGrid[r][c] === 'ship';
          const nextPlayerGrid = playerGrid.map(row => [...row]);
          nextPlayerGrid[r][c] = isHit ? 'hit' : 'miss';
          setPlayerGrid(nextPlayerGrid);
          setMoveCount(prev => prev + 1);

          if (isHit) {
            sound.play('capture');
            const nextFleet = playerFleet.map(ship => {
              const hitsCoord = ship.coordinates.some(([sr, sc]) => sr === r && sc === c);
              if (hitsCoord) {
                const hits = ship.hits + 1;
                return { ...ship, hits, sunk: hits >= ship.size };
              }
              return ship;
            });
            setPlayerFleet(nextFleet);
            if (nextFleet.every(s => s.sunk)) {
              setWinner('opponent');
              setPhase('ended');
              setEndMessage('💀 Defeat! Your armada was destroyed.');
              sound.play('loss');
            }
          } else {
            sound.play('move');
          }
          setIsPlayerTurn(true);
        }
      }
    };

    // Auto-win if opponent exits or disconnects!
    const handleOpponentLeft = (data: { message?: string }) => {
      setWinner('player');
      setPhase('ended');
      setOpponentLeft(true);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setPhase('ended');
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? 'player' : 'opponent');
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
  }, [mode, multiplayerData, playerGrid, playerFleet]);

  const resetGame = () => {
    setRadarGrid(createEmptyGrid());
    botAi.reset();
    setPhase('placement');
    setWinner(null);
    setOpponentLeft(false);
    setMoveCount(0);
    setEndMessage(null);
    deployPlayerFleet();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2">
      {/* 30-Second Turn Timer Bar during Combat */}
      {phase === 'battle' && (
        <TimerBar
          timeLeft={timeLeft}
          percent={percent}
          isMyTurn={isPlayerTurn}
          isBotThinking={isBotThinking}
          gameOver={false}
          statusText="Naval Radar Strike"
        />
      )}

      {/* End / Forfeit Banner Alert */}
      {endMessage && (
        <div className={`w-full p-3 mb-3 rounded-2xl text-center text-xs sm:text-sm font-extrabold border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Tabs for Mobile Switch between Radar and Fleet */}
      {phase !== 'placement' && (
        <div className="flex w-full mb-3 bg-gray-900/90 rounded-xl p-1 border border-gray-800">
          <button
            onClick={() => { setActiveTab('radar'); sound.play('click'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'radar' ? 'bg-emerald-600 text-white shadow-neon-emerald' : 'text-gray-400 hover:text-white'
            }`}
          >
            🎯 Enemy Radar ({enemyFleet.filter(s => s.sunk).length}/5 Sunk)
          </button>
          <button
            onClick={() => { setActiveTab('fleet'); sound.play('click'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'fleet' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            🛡️ Your Fleet ({playerFleet.filter(s => s.sunk).length}/5 Lost)
          </button>
        </div>
      )}

      {/* Placement Screen */}
      {phase === 'placement' && (
        <div className="w-full flex flex-col items-center">
          <div className="text-center mb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Deploy Your Naval Armada</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Review fleet coordinates below or tap Randomize for tactical positions.
            </p>
          </div>

          <div className="grid grid-cols-10 gap-1 p-2 bg-gray-950/90 rounded-2xl border-2 border-emerald-500/30 w-full max-w-[360px] aspect-square shadow-2xl">
            {playerGrid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`rounded flex items-center justify-center text-[10px] ${
                    cell === 'ship'
                      ? 'bg-emerald-500/80 border border-emerald-300 shadow-[0_0_6px_#00f59b]'
                      : 'bg-gray-900/60 border border-gray-800'
                  }`}
                />
              ))
            )}
          </div>

          <div className="flex space-x-3 w-full max-w-[360px] mt-4">
            <button
              onClick={deployPlayerFleet}
              className="flex-1 py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl border border-gray-700 active:scale-95 text-xs transition-all"
            >
              🎲 Randomize Fleet
            </button>
            <button
              onClick={handleStartBattle}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-neon-emerald active:scale-95 text-xs transition-all"
            >
              ⚔️ Ready for Battle!
            </button>
          </div>
        </div>
      )}

      {/* Active Combat Radar View */}
      {phase !== 'placement' && activeTab === 'radar' && (
        <div className="w-full flex flex-col items-center">
          <div className="grid grid-cols-10 gap-1 p-2 bg-gray-950/95 rounded-2xl border-2 border-emerald-500/40 w-full max-w-[360px] aspect-square shadow-2xl shadow-emerald-950/40">
            {radarGrid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleRadarClick(r, c)}
                  disabled={cell !== 'empty' || !isPlayerTurn || isBotThinking || phase === 'ended'}
                  className={`rounded flex items-center justify-center text-xs font-bold transition-all ${
                    cell === 'empty'
                      ? isPlayerTurn
                        ? 'bg-gray-900/80 hover:bg-emerald-500/30 border border-gray-800 cursor-pointer active:scale-90'
                        : 'bg-gray-900/60 border border-gray-800 cursor-not-allowed'
                      : cell === 'hit'
                      ? 'bg-rose-600/90 border border-rose-400 shadow-[0_0_8px_#f43f5e]'
                      : 'bg-gray-800 border border-gray-700 text-sky-400'
                  }`}
                >
                  {cell === 'hit' && '💥'}
                  {cell === 'miss' && '💧'}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Friendly Fleet View */}
      {phase !== 'placement' && activeTab === 'fleet' && (
        <div className="w-full flex flex-col items-center">
          <div className="grid grid-cols-10 gap-1 p-2 bg-gray-950/95 rounded-2xl border-2 border-blue-500/40 w-full max-w-[360px] aspect-square shadow-2xl">
            {playerGrid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`rounded flex items-center justify-center text-xs ${
                    cell === 'ship'
                      ? 'bg-blue-600 border border-blue-400'
                      : cell === 'hit'
                      ? 'bg-rose-600 border border-rose-400 shadow-[0_0_8px_#f43f5e]'
                      : cell === 'miss'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-gray-900/60 border border-gray-800'
                  }`}
                >
                  {cell === 'hit' && '💥'}
                  {cell === 'miss' && '💧'}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modern Rematch / Opponent Left Actions */}
      <RematchActions
        gameOver={phase === 'ended'}
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
