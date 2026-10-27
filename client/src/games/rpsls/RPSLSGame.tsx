// client/src/games/rpsls/RPSLSGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Swords, User, Bot, Sparkles, HelpCircle } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  RPSLSChoice,
  RPSLS_CHOICES,
  RPSLS_DETAILS,
  evaluateRPSLS,
  getRPSLSBotChoice
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

const WIN_TARGET = 3;

interface RPSLSGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const RPSLSGame: React.FC<RPSLSGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [playerChoice, setPlayerChoice] = useState<RPSLSChoice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<RPSLSChoice | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [clashResultText, setClashResultText] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const [playerHistory, setPlayerHistory] = useState<RPSLSChoice[]>([]);
  const [botHistory, setBotHistory] = useState<RPSLSChoice[]>([]);

  const myRole = multiplayerData?.yourRole || 'player1';

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // 12s round timer for fast-action clash
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && !isRevealed,
    isMyTurn: playerChoice === null,
    turnKey: `rpsls-round-${roundNumber}`,
    initialTime: 12,
    onTimeout: () => {
      if (!isRevealed && !gameOver) {
        const randomPick = RPSLS_CHOICES[Math.floor(Math.random() * RPSLS_CHOICES.length)];
        handlePlayerPick(randomPick);
      }
    }
  });

  const handlePlayerPick = useCallback((choice: RPSLSChoice) => {
    if (playerChoice !== null || isRevealed || gameOver) return;
    sound.play('click');
    setPlayerChoice(choice);

    if (mode === 'bot') {
      setIsBotThinking(true);
      setTimeout(() => {
        setIsBotThinking(false);
        const botPick = getRPSLSBotChoice(playerHistory, botHistory, botDifficulty);
        setOpponentChoice(botPick);
        executeClash(choice, botPick);
      }, 750);
    } else if (multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { round: roundNumber, choice },
        nextTurnState: {}
      });

      if (opponentChoice !== null) {
        executeClash(choice, opponentChoice);
      }
    }
  }, [playerChoice, isRevealed, gameOver, mode, botDifficulty, playerHistory, botHistory, multiplayerData, roundNumber, opponentChoice]);

  const executeClash = (pPick: RPSLSChoice, oppPick: RPSLSChoice) => {
    setIsRevealed(true);
    const { outcome, explanation } = evaluateRPSLS(pPick, oppPick);

    setPlayerHistory(prev => [...prev, pPick]);
    setBotHistory(prev => [...prev, oppPick]);

    let newPScore = playerScore;
    let newOScore = opponentScore;

    if (outcome === 'p1') {
      sound.play('capture');
      newPScore = playerScore + 1;
      setPlayerScore(newPScore);
      setClashResultText(`💥 ${explanation} (+1 Point)`);
    } else if (outcome === 'p2') {
      sound.play('move');
      newOScore = opponentScore + 1;
      setOpponentScore(newOScore);
      setClashResultText(`💀 ${explanation} (Opponent Scored)`);
    } else {
      sound.play('click');
      setClashResultText(`🤝 ${explanation}`);
    }

    setTimeout(() => {
      if (newPScore >= WIN_TARGET) {
        setGameOver(true);
        setWinner('player');
        setEndMessage(`🏆 VICTORY! First to 3 Points (${newPScore} - ${newOScore})`);
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else if (newOScore >= WIN_TARGET) {
        setGameOver(true);
        setWinner('opponent');
        setEndMessage(`💀 DEFEAT! Opponent reached 3 Points (${newOScore} - ${newPScore})`);
        sound.play('loss');
        recordGameResult('loss');
      } else {
        setRoundNumber(prev => prev + 1);
        setPlayerChoice(null);
        setOpponentChoice(null);
        setIsRevealed(false);
        setClashResultText(null);
      }
    }, 2500);
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { round: number; choice: RPSLSChoice } }) => {
      if (data.move.round === roundNumber) {
        setOpponentChoice(data.move.choice);
        if (playerChoice !== null && !isRevealed) {
          executeClash(playerChoice, data.move.choice);
        }
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner('player');
      setEndMessage(data.message || '🏆 Opponent left! You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handleRematchStarted = () => {
      resetGame();
      sound.play('match');
    };

    socket.on('opponent_move', handleOpponentMove);
    socket.on('opponent_left', handleOpponentLeft);
    socket.on('rematch_started', handleRematchStarted);

    return () => {
      socket.off('opponent_move', handleOpponentMove);
      socket.off('opponent_left', handleOpponentLeft);
      socket.off('rematch_started', handleRematchStarted);
    };
  }, [mode, multiplayerData, roundNumber, playerChoice, isRevealed]);

  const resetGame = () => {
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundNumber(1);
    setPlayerChoice(null);
    setOpponentChoice(null);
    setIsRevealed(false);
    setClashResultText(null);
    setIsBotThinking(false);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
    setPlayerHistory([]);
    setBotHistory([]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={playerChoice === null}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Round ${roundNumber} · First to 3 Wins`}
      />

      {/* Cyber Score Crest */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-950 via-[#130f26] to-gray-950 border border-purple-500/30 shadow-lg">
        {/* Player Score */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">You</div>
            <div className="text-xl font-black text-cyan-200 drop-shadow">
              {playerScore} <span className="text-[10px] font-bold text-gray-500">/ 3</span>
            </div>
          </div>
        </div>

        {/* Center Target Indicator */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
            RPSLS ARENA
          </span>
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < playerScore ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-gray-800'
                }`}
              />
            ))}
            <span className="text-gray-600 text-[10px]">•</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < opponentScore ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Opponent Score */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">
              {mode === 'bot' ? 'Bot' : 'Opp'}
            </div>
            <div className="text-xl font-black text-purple-200 drop-shadow">
              {opponentScore} <span className="text-[10px] font-bold text-gray-500">/ 3</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
            {mode === 'bot' ? <Bot className="w-4 h-4 text-purple-300" /> : <User className="w-4 h-4 text-purple-300" />}
          </div>
        </div>
      </div>

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[420px] p-2.5 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Center Clash Arena */}
      <div className="w-full max-w-[420px] h-44 rounded-3xl bg-gradient-to-b from-[#180d2b] via-[#10081d] to-[#0a0412] border-2 border-purple-500/40 p-3 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl mb-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="text-[9px] font-black tracking-widest uppercase text-purple-300/80 z-10">
          5-WAY QUANTUM CLASH
        </div>

        {/* Duelists Cards Display */}
        <div className="flex items-center justify-center gap-6 w-full z-10">
          {/* Player Clash Card */}
          <div className="flex flex-col items-center gap-1">
            <div className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 ${
              isRevealed && playerChoice
                ? `bg-gradient-to-b ${RPSLS_DETAILS[playerChoice].color} ${RPSLS_DETAILS[playerChoice].border} scale-105 shadow-neon-cyan`
                : playerChoice
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 animate-pulse'
                : 'bg-gray-900/60 border-gray-800 text-gray-600'
            }`}>
              {isRevealed && playerChoice ? RPSLS_DETAILS[playerChoice].icon : playerChoice ? '🔒' : '?'}
            </div>
            <span className="text-[10px] font-black text-cyan-300 uppercase">You</span>
          </div>

          {/* VS Lightning Icon */}
          <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/60 flex items-center justify-center shadow-lg">
            <Swords className="w-4 h-4 text-purple-300 animate-pulse" />
          </div>

          {/* Opponent Clash Card */}
          <div className="flex flex-col items-center gap-1">
            <div className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 ${
              isRevealed && opponentChoice
                ? `bg-gradient-to-b ${RPSLS_DETAILS[opponentChoice].color} ${RPSLS_DETAILS[opponentChoice].border} scale-105 shadow-neon-purple`
                : opponentChoice
                ? 'bg-purple-950/80 border-purple-400 text-purple-300 animate-pulse'
                : 'bg-gray-900/60 border-gray-800 text-gray-600'
            }`}>
              {isRevealed && opponentChoice ? RPSLS_DETAILS[opponentChoice].icon : opponentChoice ? '🔒' : '?'}
            </div>
            <span className="text-[10px] font-black text-purple-300 uppercase">
              {mode === 'bot' ? 'Bot' : 'Opp'}
            </span>
          </div>
        </div>

        {/* Clash Result Notification */}
        <div className="z-10 min-h-[20px] text-center px-2">
          {clashResultText ? (
            <span className="text-xs font-black text-amber-300 drop-shadow animate-bounce">
              {clashResultText}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-gray-400">
              {playerChoice ? 'Weapon Locked · Awaiting Opponent...' : 'Choose your Quantum Weapon below!'}
            </span>
          )}
        </div>
      </div>

      {/* 5 Selectable Weapon Cards */}
      <div className="w-full max-w-[420px] grid grid-cols-5 gap-1.5 sm:gap-2">
        {RPSLS_CHOICES.map(choiceKey => {
          const info = RPSLS_DETAILS[choiceKey];
          const isSelected = playerChoice === choiceKey;

          return (
            <button
              key={choiceKey}
              onClick={() => handlePlayerPick(choiceKey)}
              disabled={playerChoice !== null || isRevealed || gameOver}
              className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-95 disabled:cursor-default ${
                isSelected
                  ? `bg-gradient-to-b ${info.color} ${info.border} ring-2 ring-amber-400 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.5)]`
                  : 'bg-gray-900/70 border-gray-800 hover:border-purple-400/80 hover:bg-purple-950/30'
              }`}
            >
              <span className="text-2xl mb-0.5">{info.icon}</span>
              <span className="text-[11px] font-black text-white">{info.name.split(' ')[1] || info.name}</span>
            </button>
          );
        })}
      </div>

      {/* Rules cheat pill */}
      <div className="mt-3 text-[10px] font-bold text-purple-300/60 bg-purple-950/30 border border-purple-900/40 px-3 py-1 rounded-full text-center max-w-[420px]">
        🖖 Spock smashes Scissors & vaporizes Rock · 🦎 Lizard poisons Spock & eats Paper
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="purple"
        maxWidthClass="max-w-[420px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
