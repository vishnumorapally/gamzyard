// client/src/games/matchstick/MatchstickGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Check, HelpCircle, Trophy, User, Bot, AlertCircle } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { MatchstickPuzzle, getRandomMatchstickSet } from './puzzles';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface MatchstickGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const MatchstickGame: React.FC<MatchstickGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [puzzles, setPuzzles] = useState<MatchstickPuzzle[]>(() => getRandomMatchstickSet(3));
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [opponentSelected, setOpponentSelected] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const currentPuzzle = puzzles[currentIdx] || puzzles[0];

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // 25s per puzzle timer
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && !isRevealed,
    isMyTurn: selectedOption === null,
    turnKey: `matchstick-${currentIdx}`,
    initialTime: 25,
    onTimeout: () => {
      if (!isRevealed && !gameOver) {
        handleSelect(0); // auto pick first on timeout
      }
    }
  });

  const handleSelect = (idx: number) => {
    if (selectedOption !== null || isRevealed || gameOver) return;
    sound.play('click');
    setSelectedOption(idx);

    const isCorrect = currentPuzzle.options[idx].isCorrect;
    const earned = isCorrect ? 100 + Math.floor((timeLeft / 25) * 50) : 0;

    if (mode === 'bot') {
      setIsBotThinking(true);
      const botDelay = botDifficulty === 'hard' ? 2000 : botDifficulty === 'medium' ? 3500 : 5000;
      const botAccuracy = botDifficulty === 'hard' ? 0.95 : botDifficulty === 'medium' ? 0.75 : 0.45;

      setTimeout(() => {
        setIsBotThinking(false);
        const correctOptIdx = currentPuzzle.options.findIndex(o => o.isCorrect);
        const botWillBeCorrect = Math.random() < botAccuracy;
        const botPick = botWillBeCorrect ? (correctOptIdx !== -1 ? correctOptIdx : 0) : ((correctOptIdx + 1) % currentPuzzle.options.length);
        const botEarned = currentPuzzle.options[botPick].isCorrect ? 100 + 20 : 0;

        setOpponentSelected(botPick);
        revealRound(idx, botPick, earned, botEarned);
      }, botDelay);
    } else if (multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { puzzleIdx: currentIdx, selectedOption: idx, scoreEarned: earned },
        nextTurnState: {}
      });

      if (opponentSelected !== null) {
        revealRound(idx, opponentSelected, earned, null);
      }
    }
  };

  const revealRound = (pPick: number, oppPick: number, pEarned: number, oppEarned: number | null) => {
    setIsRevealed(true);
    const isMeCorrect = currentPuzzle.options[pPick]?.isCorrect;

    if (isMeCorrect) {
      sound.play('capture');
      setPlayerScore(prev => prev + pEarned);
    } else {
      sound.play('move');
    }

    if (oppEarned !== null) {
      setOpponentScore(prev => prev + oppEarned);
    }

    setTimeout(() => {
      if (currentIdx + 1 < puzzles.length) {
        setCurrentIdx(prev => prev + 1);
        setSelectedOption(null);
        setOpponentSelected(null);
        setIsRevealed(false);
      } else {
        // Game Over!
        setGameOver(true);
        const finalP = playerScore + (isMeCorrect ? pEarned : 0);
        const finalO = opponentScore + (oppEarned || 0);

        if (finalP > finalO) {
          setWinner('player');
          setEndMessage(`🏆 Matchstick Master! You won ${finalP} - ${finalO} pts!`);
          sound.play('win'); triggerConfetti(); recordGameResult('win');
        } else if (finalO > finalP) {
          setWinner('opponent');
          setEndMessage(`💀 Defeat! Opponent won ${finalO} - ${finalP} pts!`);
          sound.play('loss'); recordGameResult('loss');
        } else {
          setWinner('draw');
          setEndMessage(`🤝 Puzzle Draw at ${finalP} pts!`);
          recordGameResult('draw');
        }
      }
    }, 3200);
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { puzzleIdx: number; selectedOption: number; scoreEarned: number } }) => {
      if (data.move.puzzleIdx === currentIdx) {
        setOpponentSelected(data.move.selectedOption);
        if (selectedOption !== null && !isRevealed) {
          const isMeCorrect = currentPuzzle.options[selectedOption].isCorrect;
          const myEarned = isMeCorrect ? 100 + Math.floor((timeLeft / 25) * 50) : 0;
          revealRound(selectedOption, data.move.selectedOption, myEarned, data.move.scoreEarned);
        }
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner('player');
      setEndMessage(data.message || '🏆 Opponent left! You win by default!');
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
  }, [mode, multiplayerData, currentIdx, selectedOption, isRevealed, currentPuzzle, timeLeft]);

  const resetGame = () => {
    setPuzzles(getRandomMatchstickSet(3));
    setCurrentIdx(0);
    setPlayerScore(0);
    setOpponentScore(0);
    setSelectedOption(null);
    setOpponentSelected(null);
    setIsRevealed(false);
    setIsBotThinking(false);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={selectedOption === null}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Puzzle ${currentIdx + 1} of 3 · Matchstick Logic`}
      />

      {/* Duel Scoreboard */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-950 via-[#1c1208] to-gray-950 border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center">
            <User className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">You</div>
            <div className="text-xl font-black text-amber-200 drop-shadow">{playerScore} pts</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
            PUZZLE {currentIdx + 1} / 3
          </span>
          <div className="flex gap-1.5 mt-1">
            {puzzles.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < currentIdx ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : i === currentIdx ? 'bg-amber-300 ring-2 ring-amber-400/50 animate-pulse' : 'bg-gray-800'
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
            <div className="text-xl font-black text-cyan-200 drop-shadow">{opponentScore} pts</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            {mode === 'bot' ? <Bot className="w-4 h-4 text-cyan-300" /> : <User className="w-4 h-4 text-cyan-300" />}
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

      {/* Glowing Matchstick Equation Card */}
      <div className="w-full max-w-[440px] bg-gradient-to-b from-[#241306] via-[#140b03] to-[#0a0501] border-2 border-amber-600/50 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-4 mb-4 relative overflow-hidden">
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span>{currentPuzzle.rule}</span>
        </div>

        {/* The Equation Display in Matchstick Typography */}
        <div className="px-6 py-4 rounded-2xl bg-black/60 border border-amber-600/40 shadow-inner flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-amber-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.6)]">
            {currentPuzzle.initialEquation}
          </span>
        </div>

        {/* 4 Interactive Solution Choices */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {currentPuzzle.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = opt.isCorrect;

            let btnStyle = 'bg-gray-900/80 border-gray-800 text-gray-200 hover:border-amber-400 hover:bg-amber-950/30';

            if (isRevealed) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-neon-emerald';
              } else if (isSelected) {
                btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
              } else {
                btnStyle = 'bg-gray-950/60 border-gray-900 text-gray-600 opacity-50';
              }
            } else if (isSelected) {
              btnStyle = 'bg-amber-950/90 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-105';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selectedOption !== null || isRevealed || gameOver}
                className={`p-3 rounded-2xl border-2 text-sm sm:text-base font-mono font-bold transition-all duration-200 cursor-pointer active:scale-95 disabled:cursor-default flex items-center justify-center ${btnStyle}`}
              >
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation text on reveal */}
        {isRevealed && (
          <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2 animate-fade-in w-full">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{currentPuzzle.options.find(o => o.isCorrect)?.explanation}</span>
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
        themeColor="amber"
        maxWidthClass="max-w-[440px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
