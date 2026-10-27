// client/src/games/wordclash/WordClashGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Delete, CornerDownLeft, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  getRandomTargetWord,
  evaluateWordGuess,
  VALID_GUESS_WORDS,
  TileState
} from './words';
import { getBotWordGuess } from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface WordClashGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

export const WordClashGame: React.FC<WordClashGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [targetWord, setTargetWord] = useState<string>(() => getRandomTargetWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [opponentGuesses, setOpponentGuesses] = useState<string[]>([]);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);
  const [shakeRow, setShakeRow] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const myRole = multiplayerData?.yourRole || 'player1';

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Turn timer per guess (30 seconds)
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && !isBotThinking,
    isMyTurn: true,
    turnKey: `wordle-guess-${guesses.length}`,
    initialTime: 30,
    onTimeout: () => {
      if (gameOver) return;
      // Auto-submit random or forfeit if time expires
      if (currentGuess.length === 5 && VALID_GUESS_WORDS.has(currentGuess)) {
        submitGuess(currentGuess);
      } else {
        setGameOver(true);
        setWinner('opponent');
        setEndMessage(`⏰ Time Expired! The secret word was: ${targetWord}`);
        sound.play('loss');
        recordGameResult('loss');
      }
    }
  });

  // Calculate keyboard letter states (green > yellow > gray)
  const keyStates = useMemo(() => {
    const states: Record<string, TileState> = {};
    guesses.forEach(g => {
      const evals = evaluateWordGuess(g, targetWord);
      for (let i = 0; i < 5; i++) {
        const letter = g[i];
        const state = evals[i];
        if (state === 'correct') {
          states[letter] = 'correct';
        } else if (state === 'present' && states[letter] !== 'correct') {
          states[letter] = 'present';
        } else if (state === 'absent' && !states[letter]) {
          states[letter] = 'absent';
        }
      }
    });
    return states;
  }, [guesses, targetWord]);

  // Handle typing or virtual keyboard input
  const handleKeyPress = useCallback((key: string) => {
    if (gameOver || isBotThinking) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setShakeRow(true);
        showToast('Not enough letters (5 required)');
        setTimeout(() => setShakeRow(false), 500);
        return;
      }
      if (!VALID_GUESS_WORDS.has(currentGuess)) {
        setShakeRow(true);
        showToast('Not in word bank');
        setTimeout(() => setShakeRow(false), 500);
        return;
      }
      submitGuess(currentGuess);
    } else if (key === 'BACK' || key === 'BACKSPACE') {
      sound.play('click');
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      sound.play('click');
      setCurrentGuess(prev => prev + key);
    }
  }, [gameOver, isBotThinking, currentGuess, targetWord, guesses]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('BACK');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const submitGuess = (guessWord: string) => {
    const nextGuesses = [...guesses, guessWord];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    const evals = evaluateWordGuess(guessWord, targetWord);
    const isPlayerSolved = evals.every(e => e === 'correct');

    if (isPlayerSolved) {
      sound.play('win');
      triggerConfetti();
      setGameOver(true);
      setWinner('player');
      setEndMessage(`🎉 Solved in ${nextGuesses.length}/6! Word: ${targetWord}`);
      recordGameResult('win');

      if (mode !== 'bot' && multiplayerData) {
        const socket = getSocket();
        socket.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: { guess: guessWord, isSolved: true, guessCount: nextGuesses.length },
          nextTurnState: {}
        });
      }
      return;
    }

    sound.play('move');

    if (mode === 'bot') {
      // Trigger Bot Guess
      setIsBotThinking(true);
      setTimeout(() => {
        const botGuess = getBotWordGuess(targetWord, opponentGuesses, botDifficulty);
        const nextBotGuesses = [...opponentGuesses, botGuess];
        setOpponentGuesses(nextBotGuesses);
        setIsBotThinking(false);

        const botEvals = evaluateWordGuess(botGuess, targetWord);
        const isBotSolved = botEvals.every(e => e === 'correct');

        if (isBotSolved) {
          setGameOver(true);
          setWinner('opponent');
          setEndMessage(`💀 Bot cracked the code in ${nextBotGuesses.length}/6! Word: ${targetWord}`);
          sound.play('loss');
          recordGameResult('loss');
        } else if (nextGuesses.length >= 6 && nextBotGuesses.length >= 6) {
          setGameOver(true);
          setWinner('draw');
          setEndMessage(`🤝 Stalemate! Both exhausted 6 guesses. Word: ${targetWord}`);
          recordGameResult('draw');
        }
      }, 1500);
    } else if (multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { guess: guessWord, isSolved: false, guessCount: nextGuesses.length },
        nextTurnState: {}
      });

      if (nextGuesses.length >= 6) {
        setGameOver(true);
        setWinner('opponent');
        setEndMessage(`Out of attempts! Secret Word was: ${targetWord}`);
        sound.play('loss');
        recordGameResult('loss');
      }
    } else if (nextGuesses.length >= 6) {
      setGameOver(true);
      setWinner('opponent');
      setEndMessage(`Out of attempts! Secret Word was: ${targetWord}`);
      sound.play('loss');
      recordGameResult('loss');
    }
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { guess: string; isSolved: boolean; guessCount: number } }) => {
      setOpponentGuesses(prev => [...prev, data.move.guess]);
      if (data.move.isSolved) {
        setGameOver(true);
        setWinner('opponent');
        setEndMessage(`💀 Opponent cracked the code first! Word: ${targetWord}`);
        sound.play('loss');
        recordGameResult('loss');
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner('player');
      setEndMessage(data.message || '🏆 Opponent left! You win by default!');
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
  }, [mode, multiplayerData, targetWord]);

  const resetGame = () => {
    setTargetWord(getRandomTargetWord());
    setGuesses([]);
    setCurrentGuess('');
    setOpponentGuesses([]);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  // 6 rows grid
  const rows = Array.from({ length: 6 });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={!isBotThinking}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Guess ${Math.min(guesses.length + 1, 6)} of 6 · 5-Letter Code`}
      />

      {/* Opponent Progress Pill */}
      <div className="w-full max-w-[340px] mb-2 px-3 py-1.5 rounded-full bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-300">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>You: <strong className="text-cyan-300">{guesses.length}/6</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-300">
          <span>{mode === 'bot' ? 'Bot' : 'Opponent'}: <strong className="text-purple-300">{opponentGuesses.length}/6</strong></span>
          {mode === 'bot' ? <Bot className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-purple-400" />}
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 z-50 px-4 py-2 rounded-xl bg-gray-950/95 border border-amber-400 text-amber-300 text-xs font-bold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* End Message */}
      {endMessage && (
        <div className={`w-full max-w-[340px] p-2.5 mb-2 rounded-xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Word Grid Board */}
      <div className="flex flex-col gap-1.5 mb-3">
        {rows.map((_, rowIdx) => {
          const isCurrentRow = rowIdx === guesses.length;
          const guess = guesses[rowIdx] || (isCurrentRow ? currentGuess : '');
          const evaluations = guesses[rowIdx] ? evaluateWordGuess(guesses[rowIdx], targetWord) : null;

          return (
            <div
              key={rowIdx}
              className={`flex gap-1.5 justify-center ${isCurrentRow && shakeRow ? 'animate-shake' : ''}`}
            >
              {Array.from({ length: 5 }).map((_, colIdx) => {
                const char = guess[colIdx] || '';
                const evalState = evaluations ? evaluations[colIdx] : null;

                let tileBg = 'bg-[#10142b]/80 border-gray-800 text-white';

                if (evalState === 'correct') {
                  tileBg = 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(5,245,155,0.4)] animate-flip';
                } else if (evalState === 'present') {
                  tileBg = 'bg-amber-500 border-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.4)] animate-flip';
                } else if (evalState === 'absent') {
                  tileBg = 'bg-gray-800/90 border-gray-700 text-gray-400';
                } else if (char) {
                  tileBg = 'bg-gray-900 border-cyan-400/80 text-cyan-200 ring-1 ring-cyan-400/40 scale-105';
                }

                return (
                  <div
                    key={colIdx}
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-xl border-2 flex items-center justify-center text-lg sm:text-xl font-black transition-all duration-200 select-none ${tileBg}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Cyber Virtual Keyboard */}
      <div className="w-full max-w-[360px] flex flex-col gap-1.5 px-1 py-2 rounded-2xl bg-gray-950/70 border border-gray-800/80">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map(k => {
              const state = keyStates[k];
              const isAction = k === 'ENTER' || k === 'BACK';

              let keyStyle = 'bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700';

              if (state === 'correct') {
                keyStyle = 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
              } else if (state === 'present') {
                keyStyle = 'bg-amber-500 text-black border-amber-400';
              } else if (state === 'absent') {
                keyStyle = 'bg-gray-900/90 text-gray-600 border-gray-900 opacity-50';
              }

              return (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  disabled={gameOver || isBotThinking}
                  className={`h-10 sm:h-11 rounded-lg text-xs font-bold border transition-all active:scale-90 flex items-center justify-center ${
                    isAction ? 'px-2.5 sm:px-3 text-[10px] font-black bg-cyan-950/80 text-cyan-300 border-cyan-700/60' : 'w-7 sm:w-8'
                  } ${keyStyle}`}
                >
                  {k === 'BACK' ? <Delete className="w-4 h-4" /> : k}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
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
