// client/src/games/guesstheword/GuessTheWordGame.tsx
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Type,
  Users,
  Bot,
  RotateCcw,
  Sparkles,
  Heart,
  HelpCircle
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { WordRiddle, getRandomWord } from './words';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
}

interface GuessTheWordGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const GuessTheWordGame: React.FC<GuessTheWordGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [currentRiddle, setCurrentRiddle] = useState<WordRiddle>(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0); // max 6

  const initialPlayers: Player[] = useMemo(() => {
    if (mode === 'room' && multiplayerData?.allPlayers && multiplayerData.allPlayers.length > 0) {
      return multiplayerData.allPlayers.map(p => ({
        id: p.socketId,
        name: p.name,
        avatar: p.avatar || 'fox',
        isBot: !!p.isBot,
        score: 0
      }));
    }

    const count = Math.max(2, Math.min(8, playerCount));
    const list: Player[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', isBot: false, score: 0 }
    ];

    const botNames = ['Bramhi Bot', 'Nani AI', 'Mahesh AI', 'Samantha Bot'];
    for (let i = 1; i < count; i++) {
      list.push({
        id: `bot_${i + 1}`,
        name: botNames[i - 1] || `Player ${i + 1}`,
        avatar: 'robot',
        isBot: true,
        score: 0
      });
    }
    return list;
  }, [mode, multiplayerData, playerCount]);

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';

  // Check if word solved
  const isWordSolved = useMemo(() => {
    return currentRiddle.word.split('').every(ch => guessedLetters.has(ch));
  }, [currentRiddle, guessedLetters]);

  // Handle letter guess
  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.has(letter) || gameOver || isWon) return;

    const newSet = new Set(guessedLetters);
    newSet.add(letter);
    setGuessedLetters(newSet);

    if (currentRiddle.word.includes(letter)) {
      sound.play('win');
      // Check if this guess completed the word
      const completed = currentRiddle.word.split('').every(ch => newSet.has(ch));
      if (completed) {
        setIsWon(true);
        setGameOver(true);
        confetti({ particleCount: 50, spread: 70 });
        recordGameResult('win');
        setPlayers(prev =>
          prev.map(p => (p.id === myPlayerId ? { ...p, score: p.score + 25 } : p))
        );
      }
    } else {
      sound.play('loss');
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= 6) {
        setGameOver(true);
        recordGameResult('loss');
      }
    }
  };

  const handleRematch = () => {
    setCurrentRiddle(getRandomWord());
    setGuessedLetters(new Set());
    setWrongCount(0);
    setGameOver(false);
    setIsWon(false);
  };

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black tracking-wider text-cyan-400 uppercase">
              Guess the Word · {currentRiddle.category}
            </span>
          </div>
          {/* Hearts / Attempts */}
          <div className="flex gap-1">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < 6 - wrongCount ? 'text-rose-500' : 'text-slate-700'}`}
              >
                ♥
              </span>
            ))}
          </div>
        </div>

        {/* Hint banner */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">
            Clue / Hint:
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic">
            "{currentRiddle.hint}"
          </p>
        </div>

        {/* Word Letter Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2 my-4">
          {currentRiddle.word.split('').map((char, idx) => {
            const revealed = guessedLetters.has(char) || gameOver;
            return (
              <div
                key={idx}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 flex items-center justify-center font-black font-mono text-xl sm:text-2xl transition-all shadow-md ${
                  revealed
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-transparent'
                }`}
              >
                {revealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* On-screen alphabet keyboard */}
        <div className="w-full max-w-lg flex flex-wrap items-center justify-center gap-1.5 mt-2">
          {ALPHABET.map(letter => {
            const isUsed = guessedLetters.has(letter);
            const inWord = currentRiddle.word.includes(letter);

            let keyStyle = 'bg-slate-900 border-slate-800 text-white hover:border-cyan-500 hover:bg-slate-800';
            if (isUsed) {
              keyStyle = inWord
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 opacity-70'
                : 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed opacity-40';
            }

            return (
              <button
                key={letter}
                disabled={isUsed || gameOver}
                onClick={() => handleLetterGuess(letter)}
                className={`w-8 h-9 sm:w-9 sm:h-10 rounded-xl border font-bold text-xs font-mono transition-transform active:scale-95 flex items-center justify-center ${keyStyle}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-cyan-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">
              {isWon ? 'Word Solved!' : 'Out of Attempts!'}
            </h2>
            <div className="text-xs text-slate-400">
              The secret word was: <strong className="text-cyan-400 font-mono text-base">{currentRiddle.word}</strong>
            </div>
            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="cyan"
            />
          </div>
        </div>
      )}
    </div>
  );
};
