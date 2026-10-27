// client/src/games/cointoss/CoinTossGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, User, Bot, HelpCircle, Coins } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

type CoinSide = 'heads' | 'tails';
const WIN_TARGET = 3;

interface CoinTossGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const CoinTossGame: React.FC<CoinTossGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [playerChoice, setPlayerChoice] = useState<CoinSide | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flippedResult, setFlippedResult] = useState<CoinSide | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // 12s prediction timer
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && !isFlipping && flippedResult === null,
    isMyTurn: playerChoice === null,
    turnKey: `cointoss-round-${roundNumber}`,
    initialTime: 12,
    onTimeout: () => {
      if (!isFlipping && flippedResult === null && !gameOver) {
        handlePlayerPick(Math.random() < 0.5 ? 'heads' : 'tails');
      }
    }
  });

  const handlePlayerPick = useCallback((side: CoinSide) => {
    if (playerChoice !== null || isFlipping || flippedResult !== null || gameOver) return;
    sound.play('click');
    setPlayerChoice(side);

    if (mode === 'bot') {
      setIsBotThinking(true);
      setTimeout(() => {
        setIsBotThinking(false);
        const botPick: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
        setOpponentChoice(botPick);
        executeCoinFlip(side, botPick);
      }, 700);
    } else if (multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { round: roundNumber, choice: side },
        nextTurnState: {}
      });

      if (opponentChoice !== null) {
        executeCoinFlip(side, opponentChoice);
      }
    }
  }, [playerChoice, isFlipping, flippedResult, gameOver, mode, multiplayerData, roundNumber, opponentChoice]);

  const executeCoinFlip = (pPick: CoinSide, oppPick: CoinSide) => {
    setIsFlipping(true);
    sound.play('move');

    // 2-second spinning animation
    setTimeout(() => {
      const outcome: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
      setFlippedResult(outcome);
      setIsFlipping(false);

      const pWon = pPick === outcome;
      const oppWon = oppPick === outcome;

      let newP = playerScore;
      let newO = opponentScore;

      if (pWon) {
        newP = playerScore + 1;
        setPlayerScore(newP);
        sound.play('capture');
      }
      if (oppWon) {
        newO = opponentScore + 1;
        setOpponentScore(newO);
      }

      setResultMessage(
        `🪙 Coin landed on ${outcome.toUpperCase()}! ${
          pWon && oppWon
            ? 'Both Scored! (+1 pt)'
            : pWon
            ? 'You Called It! (+1 pt)'
            : oppWon
            ? 'Opponent Called It!'
            : 'Both missed!'
        }`
      );

      // Check win condition (First to 3 points)
      setTimeout(() => {
        if (newP >= WIN_TARGET && newP > newO) {
          setGameOver(true);
          setWinner('player');
          setEndMessage(`🏆 VICTORY! First to 3 Points (${newP} - ${newO})`);
          sound.play('win'); triggerConfetti(); recordGameResult('win');
        } else if (newO >= WIN_TARGET && newO > newP) {
          setGameOver(true);
          setWinner('opponent');
          setEndMessage(`💀 DEFEAT! Opponent reached 3 Points (${newO} - ${newP})`);
          sound.play('loss'); recordGameResult('loss');
        } else {
          setRoundNumber(prev => prev + 1);
          setPlayerChoice(null);
          setOpponentChoice(null);
          setFlippedResult(null);
          setResultMessage(null);
        }
      }, 2500);
    }, 1800);
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { round: number; choice: CoinSide } }) => {
      if (data.move.round === roundNumber) {
        setOpponentChoice(data.move.choice);
        if (playerChoice !== null && !isFlipping && flippedResult === null) {
          executeCoinFlip(playerChoice, data.move.choice);
        }
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner('player');
      setEndMessage(data.message || '🏆 Opponent left! You win by forfeit!');
      sound.play('win'); triggerConfetti(); recordGameResult('win');
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
  }, [mode, multiplayerData, roundNumber, playerChoice, isFlipping, flippedResult]);

  const resetGame = () => {
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundNumber(1);
    setPlayerChoice(null);
    setOpponentChoice(null);
    setIsFlipping(false);
    setFlippedResult(null);
    setResultMessage(null);
    setIsBotThinking(false);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={playerChoice === null}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Round ${roundNumber} · First to 3 Correct Calls`}
      />

      {/* Cyber Score Crest */}
      <div className="w-full max-w-[360px] mb-3 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-950 via-[#1e1709] to-gray-950 border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">You</div>
            <div className="text-xl font-black text-amber-200 drop-shadow">{playerScore} <span className="text-[10px] text-gray-500">/ 3</span></div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
            COIN ARENA
          </span>
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < playerScore ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-gray-800'
                }`}
              />
            ))}
            <span className="text-gray-600 text-[10px]">•</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < opponentScore ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              {mode === 'bot' ? 'Bot' : 'Opp'}
            </div>
            <div className="text-xl font-black text-cyan-200 drop-shadow">{opponentScore} <span className="text-[10px] text-gray-500">/ 3</span></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            {mode === 'bot' ? <Bot className="w-4 h-4 text-cyan-300" /> : <User className="w-4 h-4 text-cyan-300" />}
          </div>
        </div>
      </div>

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[360px] p-2.5 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* 3D Coin Toss Chamber */}
      <div className="w-full max-w-[360px] h-48 rounded-3xl bg-gradient-to-b from-[#241a08] via-[#140e04] to-[#0a0701] border-2 border-amber-500/40 p-3 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl mb-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="text-[9px] font-black tracking-widest uppercase text-amber-400/80 z-10">
          CYBER GOLDEN FLIP
        </div>

        {/* 3D Flipping Coin */}
        <div className="relative z-10 flex items-center justify-center my-auto">
          <div
            className={`w-24 h-24 rounded-full border-4 border-amber-300 flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-transform duration-500 ${
              isFlipping
                ? 'animate-spin bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700'
                : flippedResult === 'heads'
                ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 scale-105'
                : flippedResult === 'tails'
                ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-700 scale-105 border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                : 'bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-700'
            }`}
          >
            {isFlipping ? '🪙' : flippedResult === 'heads' ? '👑' : flippedResult === 'tails' ? '🐉' : '🪙'}
          </div>
        </div>

        {/* Result Text */}
        <div className="z-10 min-h-[20px] text-center px-2">
          {resultMessage ? (
            <span className="text-xs font-black text-amber-300 drop-shadow animate-bounce">
              {resultMessage}
            </span>
          ) : isFlipping ? (
            <span className="text-xs font-black text-amber-400 animate-pulse">
              Flipping the Coin in Air...
            </span>
          ) : (
            <span className="text-[10px] font-bold text-gray-400">
              {playerChoice ? 'Prediction Locked · Awaiting Opponent...' : 'Predict Heads or Tails below!'}
            </span>
          )}
        </div>
      </div>

      {/* 2 Prediction Choice Buttons: Heads or Tails */}
      <div className="w-full max-w-[360px] grid grid-cols-2 gap-3">
        <button
          onClick={() => handlePlayerPick('heads')}
          disabled={playerChoice !== null || isFlipping || flippedResult !== null || gameOver}
          className={`py-3.5 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm transition-all duration-200 cursor-pointer active:scale-95 disabled:cursor-default ${
            playerChoice === 'heads'
              ? 'bg-amber-500 border-amber-300 text-black scale-105 shadow-neon-amber ring-2 ring-amber-300'
              : 'bg-gray-900/80 border-gray-800 text-amber-200 hover:border-amber-400 hover:bg-amber-950/40'
          }`}
        >
          <span className="text-2xl">👑</span>
          <span>HEADS</span>
        </button>

        <button
          onClick={() => handlePlayerPick('tails')}
          disabled={playerChoice !== null || isFlipping || flippedResult !== null || gameOver}
          className={`py-3.5 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm transition-all duration-200 cursor-pointer active:scale-95 disabled:cursor-default ${
            playerChoice === 'tails'
              ? 'bg-cyan-500 border-cyan-300 text-black scale-105 shadow-neon-cyan ring-2 ring-cyan-300'
              : 'bg-gray-900/80 border-gray-800 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-950/40'
          }`}
        >
          <span className="text-2xl">🐉</span>
          <span>TAILS</span>
        </button>
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="amber"
        maxWidthClass="max-w-[360px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
