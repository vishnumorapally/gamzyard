// client/src/games/higherlower/HigherLowerGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowUp, ArrowDown, User, Bot, Sparkles, Trophy } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface Card {
  value: number; // 1 to 13
  suit: '♠' | '♥' | '♦' | '♣';
  name: string;
  isRed: boolean;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];

function generateRandomCard(): Card {
  const value = Math.floor(Math.random() * 13) + 1;
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const nameMap: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
  const name = nameMap[value] || String(value);
  const isRed = suit === '♥' || suit === '♦';
  return { value, suit, name, isRed };
}

const TOTAL_ROUNDS = 5;

interface HigherLowerGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const HigherLowerGame: React.FC<HigherLowerGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [currentCard, setCurrentCard] = useState<Card>(() => generateRandomCard());
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [playerStreak, setPlayerStreak] = useState<number>(0);
  const [playerPick, setPlayerPick] = useState<'higher' | 'lower' | null>(null);
  const [opponentPick, setOpponentPick] = useState<'higher' | 'lower' | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [roundResultText, setRoundResultText] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // 15s round timer
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && !isRevealed,
    isMyTurn: playerPick === null,
    turnKey: `higherlower-round-${roundNumber}`,
    initialTime: 15,
    onTimeout: () => {
      if (!isRevealed && !gameOver) {
        handlePredict(currentCard.value <= 7 ? 'higher' : 'lower');
      }
    }
  });

  const handlePredict = useCallback((guess: 'higher' | 'lower') => {
    if (playerPick !== null || isRevealed || gameOver) return;
    sound.play('click');
    setPlayerPick(guess);

    if (mode === 'bot') {
      setIsBotThinking(true);
      setTimeout(() => {
        setIsBotThinking(false);
        let botGuess: 'higher' | 'lower' = 'higher';
        if (botDifficulty === 'easy') {
          botGuess = Math.random() < 0.5 ? 'higher' : 'lower';
        } else {
          botGuess = currentCard.value <= 7 ? 'higher' : 'lower';
        }
        setOpponentPick(botGuess);
        executeReveal(guess, botGuess);
      }, 700);
    } else if (multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { round: roundNumber, guess },
        nextTurnState: {}
      });

      if (opponentPick !== null) {
        executeReveal(guess, opponentPick);
      }
    }
  }, [playerPick, isRevealed, gameOver, mode, botDifficulty, currentCard, multiplayerData, roundNumber, opponentPick]);

  const executeReveal = (pGuess: 'higher' | 'lower', oppGuess: 'higher' | 'lower') => {
    setIsRevealed(true);
    let drawn = generateRandomCard();
    while (drawn.value === currentCard.value) {
      drawn = generateRandomCard();
    }
    setNextCard(drawn);

    const isHigher = drawn.value > currentCard.value;
    const actualResult: 'higher' | 'lower' = isHigher ? 'higher' : 'lower';

    const pCorrect = pGuess === actualResult;
    const oppCorrect = oppGuess === actualResult;

    let newP = playerScore;
    let newO = opponentScore;
    let newStreak = playerStreak;

    if (pCorrect) {
      newStreak = playerStreak + 1;
      const pts = 100 * newStreak;
      newP = playerScore + pts;
      setPlayerScore(newP);
      setPlayerStreak(newStreak);
      sound.play('capture');
    } else {
      newStreak = 0;
      setPlayerStreak(0);
      sound.play('move');
    }

    if (oppCorrect) {
      newO = opponentScore + 100;
      setOpponentScore(newO);
    }

    setRoundResultText(
      `Next card was ${drawn.name}${drawn.suit} (${actualResult.toUpperCase()})! ${
        pCorrect ? `Correct! +${100 * (pCorrect ? (playerStreak + 1) : 1)} pts` : 'Missed!'
      }`
    );

    setTimeout(() => {
      if (roundNumber < TOTAL_ROUNDS) {
        setRoundNumber(prev => prev + 1);
        setCurrentCard(drawn);
        setNextCard(null);
        setPlayerPick(null);
        setOpponentPick(null);
        setIsRevealed(false);
        setRoundResultText(null);
      } else {
        // Game Over!
        setGameOver(true);
        if (newP > newO) {
          setWinner('player');
          setEndMessage(`🏆 High Roller Victory! You won ${newP} - ${newO} pts!`);
          sound.play('win'); triggerConfetti(); recordGameResult('win');
        } else if (newO > newP) {
          setWinner('opponent');
          setEndMessage(`💀 Defeat! Opponent won ${newO} - ${newP} pts!`);
          sound.play('loss'); recordGameResult('loss');
        } else {
          setWinner('draw');
          setEndMessage(`🤝 Tie at ${newP} pts!`);
          recordGameResult('draw');
        }
      }
    }, 2800);
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { round: number; guess: 'higher' | 'lower' } }) => {
      if (data.move.round === roundNumber) {
        setOpponentPick(data.move.guess);
        if (playerPick !== null && !isRevealed) {
          executeReveal(playerPick, data.move.guess);
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
  }, [mode, multiplayerData, roundNumber, playerPick, isRevealed]);

  const resetGame = () => {
    setCurrentCard(generateRandomCard());
    setNextCard(null);
    setRoundNumber(1);
    setPlayerScore(0);
    setOpponentScore(0);
    setPlayerStreak(0);
    setPlayerPick(null);
    setOpponentPick(null);
    setIsRevealed(false);
    setRoundResultText(null);
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
        isMyTurn={playerPick === null}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Round ${roundNumber} of 5 · Predict Higher or Lower`}
      />

      {/* Duel Scoreboard */}
      <div className="w-full max-w-[360px] mb-3 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-950 via-[#10192e] to-gray-950 border border-sky-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center">
            <User className="w-4 h-4 text-sky-300" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-sky-400">You</div>
            <div className="text-xl font-black text-sky-200 drop-shadow">{playerScore} pts</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-sky-400">
            ROUND {roundNumber} / 5
          </span>
          {playerStreak > 1 && (
            <span className="text-[9px] font-black text-amber-300 animate-pulse">
              🔥 {playerStreak}X STREAK
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">
              {mode === 'bot' ? 'Bot' : 'Opp'}
            </div>
            <div className="text-xl font-black text-purple-200 drop-shadow">{opponentScore} pts</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
            {mode === 'bot' ? <Bot className="w-4 h-4 text-purple-300" /> : <User className="w-4 h-4 text-purple-300" />}
          </div>
        </div>
      </div>

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[360px] p-2.5 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Card Arena Chamber */}
      <div className="w-full max-w-[360px] h-52 rounded-3xl bg-gradient-to-b from-[#0e1629] via-[#090f1d] to-[#040811] border-2 border-sky-500/40 p-4 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl mb-4">
        <div className="text-[9px] font-black tracking-widest uppercase text-sky-400/80 z-10">
          CYBER CARD CASINO
        </div>

        {/* The Playing Cards */}
        <div className="flex items-center justify-center gap-6 z-10 my-auto">
          {/* Current Card */}
          <div className="w-20 h-28 rounded-2xl bg-white border-2 border-gray-300 shadow-2xl flex flex-col items-center justify-between p-2 transform hover:scale-105 transition-all">
            <span className={`text-base font-black self-start ${currentCard.isRed ? 'text-rose-600' : 'text-gray-900'}`}>
              {currentCard.name}
            </span>
            <span className={`text-3xl ${currentCard.isRed ? 'text-rose-600' : 'text-gray-900'}`}>
              {currentCard.suit}
            </span>
            <span className={`text-base font-black self-end ${currentCard.isRed ? 'text-rose-600' : 'text-gray-900'}`}>
              {currentCard.name}
            </span>
          </div>

          <span className="text-xl font-bold text-sky-400 animate-pulse">➔</span>

          {/* Next Card (Hidden or Revealed) */}
          <div className={`w-20 h-28 rounded-2xl border-2 flex flex-col items-center justify-between p-2 shadow-2xl transition-all duration-300 ${
            isRevealed && nextCard
              ? 'bg-white border-sky-400 animate-flip scale-105'
              : 'bg-gradient-to-br from-sky-950 via-gray-900 to-sky-950 border-sky-500/60'
          }`}>
            {isRevealed && nextCard ? (
              <>
                <span className={`text-base font-black self-start ${nextCard.isRed ? 'text-rose-600' : 'text-gray-900'}`}>
                  {nextCard.name}
                </span>
                <span className={`text-3xl ${nextCard.isRed ? 'text-rose-600' : 'text-gray-900'}`}>
                  {nextCard.suit}
                </span>
                <span className={`text-base font-black self-end ${nextCard.isRed ? 'text-rose-600' : 'text-gray-900'}`}>
                  {nextCard.name}
                </span>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-3xl font-black text-sky-400">
                ?
              </div>
            )}
          </div>
        </div>

        {/* Result Text */}
        <div className="z-10 min-h-[20px] text-center px-2">
          {roundResultText ? (
            <span className="text-xs font-black text-amber-300 drop-shadow animate-bounce">
              {roundResultText}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-gray-400">
              {playerPick ? 'Prediction Locked · Awaiting Opponent...' : 'Will the next card be Higher or Lower?'}
            </span>
          )}
        </div>
      </div>

      {/* 2 Prediction Choice Buttons: Higher or Lower */}
      <div className="w-full max-w-[360px] grid grid-cols-2 gap-3">
        <button
          onClick={() => handlePredict('higher')}
          disabled={playerPick !== null || isRevealed || gameOver}
          className={`py-3.5 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm transition-all duration-200 cursor-pointer active:scale-95 disabled:cursor-default ${
            playerPick === 'higher'
              ? 'bg-emerald-500 border-emerald-300 text-black scale-105 shadow-neon-emerald ring-2 ring-emerald-300'
              : 'bg-gray-900/80 border-gray-800 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/40'
          }`}
        >
          <ArrowUp className="w-5 h-5 stroke-[3]" />
          <span>HIGHER</span>
        </button>

        <button
          onClick={() => handlePredict('lower')}
          disabled={playerPick !== null || isRevealed || gameOver}
          className={`py-3.5 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm transition-all duration-200 cursor-pointer active:scale-95 disabled:cursor-default ${
            playerPick === 'lower'
              ? 'bg-rose-500 border-rose-300 text-white scale-105 shadow-[0_0_15px_rgba(244,63,94,0.6)] ring-2 ring-rose-300'
              : 'bg-gray-900/80 border-gray-800 text-rose-300 hover:border-rose-400 hover:bg-rose-950/40'
          }`}
        >
          <ArrowDown className="w-5 h-5 stroke-[3]" />
          <span>LOWER</span>
        </button>
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="cyan"
        maxWidthClass="max-w-[360px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
