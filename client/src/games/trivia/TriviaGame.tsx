// client/src/games/trivia/TriviaGame.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, HelpCircle, CheckCircle2, XCircle, Bot, User, Zap } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { TriviaQuestion, getRandomTriviaRound, TRIVIA_QUESTIONS } from './questions';
import { getBotTriviaAnswer, calculateTriviaScore } from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface TriviaGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const TriviaGame: React.FC<TriviaGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>(() => getRandomTriviaRound(5));
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [opponentSelectedOption, setOpponentSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  const myRole = multiplayerData?.yourRole || 'player1';
  const currentQuestion = questions[currentRound] || questions[0];

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // Timer per round (25 seconds)
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && !isRevealed,
    isMyTurn: selectedOption === null,
    turnKey: `trivia-round-${currentRound}`,
    initialTime: 25,
    onTimeout: () => {
      if (!isRevealed && !gameOver) {
        handleRoundTimeout();
      }
    }
  });

  // Handle player selecting an answer
  const handleSelectOption = useCallback((index: number) => {
    if (selectedOption !== null || isRevealed || gameOver) return;
    sound.play('click');
    setSelectedOption(index);

    const isCorrect = index === currentQuestion.correctIndex;
    const earned = calculateTriviaScore(isCorrect, timeLeft);

    if (mode === 'bot') {
      // In bot mode, schedule bot answer
      setIsBotThinking(true);
      const botAns = getBotTriviaAnswer(currentQuestion, botDifficulty);
      setTimeout(() => {
        setIsBotThinking(false);
        setOpponentSelectedOption(botAns.selectedIndex);
        revealRound(index, botAns.selectedIndex, earned, botAns.scoreEarned);
      }, Math.min(botAns.thinkingDelayMs, Math.max(1000, timeLeft * 1000 - 500)));
    } else if (multiplayerData) {
      // In multiplayer mode, send answer to opponent
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: {
          round: currentRound,
          selectedOption: index,
          scoreEarned: earned
        },
        nextTurnState: {}
      });

      // If opponent already answered this round, reveal now!
      if (opponentSelectedOption !== null) {
        revealRound(index, opponentSelectedOption, earned, null);
      }
    }
  }, [selectedOption, isRevealed, gameOver, currentQuestion, timeLeft, mode, botDifficulty, multiplayerData, currentRound, opponentSelectedOption]);

  const handleRoundTimeout = useCallback(() => {
    if (isRevealed || gameOver) return;
    const myChoice = selectedOption !== null ? selectedOption : -1;
    const oppChoice = opponentSelectedOption !== null ? opponentSelectedOption : -1;
    const earned = myChoice === currentQuestion.correctIndex ? calculateTriviaScore(true, 1) : 0;
    const oppEarned = oppChoice === currentQuestion.correctIndex ? calculateTriviaScore(true, 1) : 0;
    revealRound(myChoice, oppChoice, earned, oppEarned);
  }, [isRevealed, gameOver, selectedOption, opponentSelectedOption, currentQuestion]);

  const revealRound = (
    myChoice: number,
    oppChoice: number,
    myEarned: number,
    oppEarned: number | null
  ) => {
    setIsRevealed(true);
    const isMeCorrect = myChoice === currentQuestion.correctIndex;

    if (isMeCorrect) {
      sound.play('capture');
      setPlayerScore(prev => prev + myEarned);
    } else {
      sound.play('move');
    }

    if (oppEarned !== null) {
      setOpponentScore(prev => prev + oppEarned);
    }

    // Advance to next round or end game after 3.2 seconds
    setTimeout(() => {
      if (currentRound + 1 < questions.length) {
        setCurrentRound(prev => prev + 1);
        setSelectedOption(null);
        setOpponentSelectedOption(null);
        setIsRevealed(false);
      } else {
        // Game Over!
        setGameOver(true);
        const finalP = playerScore + (isMeCorrect ? myEarned : 0);
        const finalO = opponentScore + (oppEarned || 0);

        if (finalP > finalO) {
          setWinner('player');
          setEndMessage(`🏆 Cyber Champion! You won ${finalP} - ${finalO} pts!`);
          sound.play('win');
          triggerConfetti();
          recordGameResult('win');
        } else if (finalO > finalP) {
          setWinner('opponent');
          setEndMessage(`💀 Defeat! Opponent won ${finalO} - ${finalP} pts!`);
          sound.play('loss');
          recordGameResult('loss');
        } else {
          setWinner('draw');
          setEndMessage(`🤝 Cyber Stalemate! Tied at ${finalP} pts!`);
          recordGameResult('draw');
        }
      }
    }, 3200);
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { round: number; selectedOption: number; scoreEarned: number } }) => {
      if (data.move.round === currentRound) {
        setOpponentSelectedOption(data.move.selectedOption);
        if (selectedOption !== null && !isRevealed) {
          const isMeCorrect = selectedOption === currentQuestion.correctIndex;
          const myEarned = calculateTriviaScore(isMeCorrect, timeLeft);
          revealRound(selectedOption, data.move.selectedOption, myEarned, data.move.scoreEarned);
        }
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner('player');
      setEndMessage(data.message || '🏆 Opponent disconnected! You win by default!');
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
  }, [mode, multiplayerData, currentRound, selectedOption, isRevealed, currentQuestion, timeLeft]);

  const resetGame = () => {
    setQuestions(getRandomTriviaRound(5));
    setCurrentRound(0);
    setPlayerScore(0);
    setOpponentScore(0);
    setSelectedOption(null);
    setOpponentSelectedOption(null);
    setIsRevealed(false);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={selectedOption === null}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Round ${currentRound + 1} of 5 · ${currentQuestion.category}`}
      />

      {/* Live Duel Scoreboard */}
      <div className="w-full max-w-[500px] mb-3 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-950 via-[#10142b] to-gray-950 border border-cyan-500/30 shadow-lg">
        {/* Player Score */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">You</div>
            <div className="text-xl font-black text-cyan-200 drop-shadow">{playerScore} <span className="text-[10px] font-bold text-gray-400">pts</span></div>
          </div>
        </div>

        {/* Center Round Indicator */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1.5 mb-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < currentRound
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : i === currentRound
                    ? 'bg-amber-400 ring-2 ring-amber-400/50 animate-pulse'
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            ROUND {currentRound + 1} / 5
          </span>
        </div>

        {/* Opponent Score */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">
              {mode === 'bot' ? 'Bot' : 'Opponent'}
            </div>
            <div className="text-xl font-black text-purple-200 drop-shadow">{opponentScore} <span className="text-[10px] font-bold text-gray-400">pts</span></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
            {mode === 'bot' ? <Bot className="w-4 h-4 text-purple-300" /> : <User className="w-4 h-4 text-purple-300" />}
          </div>
        </div>
      </div>

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[500px] p-3 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Main Holographic Question Display */}
      <div className="w-full max-w-[500px] bg-gradient-to-b from-[#131738] via-[#0d1028] to-[#070918] border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] flex flex-col gap-4">
        {/* Category Pill & Speed Bonus Notice */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
            {currentQuestion.category}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> +50 Speed Bonus
          </span>
        </div>

        {/* The Question Text */}
        <h2 className="text-base sm:text-lg font-bold text-white text-center leading-snug min-h-[52px] flex items-center justify-center px-2">
          {currentQuestion.question}
        </h2>

        {/* 4 Interactive Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isOpponentSelected = opponentSelectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let cardStyle = 'bg-gray-900/60 border-gray-800 text-gray-200 hover:border-cyan-400/80 hover:bg-cyan-950/30';

            if (isRevealed) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
              } else if (isSelected) {
                cardStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
              } else {
                cardStyle = 'bg-gray-950/60 border-gray-900 text-gray-500 opacity-60';
              }
            } else if (isSelected) {
              cardStyle = 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/40';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={selectedOption !== null || isRevealed || gameOver}
                className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer active:scale-95 disabled:cursor-default ${cardStyle}`}
              >
                {/* Option Letter Tag */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  isRevealed && isCorrect
                    ? 'bg-emerald-500 text-black'
                    : isRevealed && isSelected
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-cyan-400 text-black'
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  {isRevealed && isCorrect ? <CheckCircle2 className="w-4 h-4" /> : isRevealed && isSelected ? <XCircle className="w-4 h-4" /> : optionLetters[idx]}
                </div>

                <span className="text-xs sm:text-sm font-semibold flex-1 leading-tight">
                  {option}
                </span>

                {/* Opponent Picked Tag during reveal */}
                {isRevealed && isOpponentSelected && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400 text-purple-300 shrink-0">
                    {mode === 'bot' ? 'Bot' : 'Opp'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Reveal Explanation Box */}
        {isRevealed && (
          <div className="p-2.5 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-xs flex items-start gap-2 animate-fade-in">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{currentQuestion.explanation}</span>
          </div>
        )}
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="cyan"
        maxWidthClass="max-w-[500px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
