// client/src/games/hangman/HangmanGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Heart, Sparkles, HelpCircle, Film, Shield } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';
import { DC_CHARACTERS, DC_MOVIES } from '../../data/dcData';
import { TELUGU_MOVIES } from '../../data/teluguData';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
}

interface HangmanGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface WordEntry {
  word: string;
  category: string;
  hint: string;
}

const HANGMAN_WORDS: WordEntry[] = [
  ...DC_CHARACTERS.slice(0, 15).map(c => ({
    word: c.name.toUpperCase().replace(/[^A-Z]/g, ''),
    category: 'DC Superhero',
    hint: `Debuted around ${c.year} (${c.name})`
  })),
  ...DC_MOVIES.slice(0, 15).map(m => ({
    word: m.name.toUpperCase().replace(/[^A-Z]/g, ''),
    category: 'DC Movie',
    hint: `Released in ${m.year} (${m.name})`
  })),
  ...TELUGU_MOVIES.slice(0, 15).map(t => ({
    word: t.name.toUpperCase().replace(/[^A-Z]/g, ''),
    category: 'Tollywood Movie',
    hint: `Blockbuster (${t.year})`
  }))
];

export const HangmanGame: React.FC<HangmanGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const isHost = !isMultiplayer || multiplayerData?.you?.isHost || false;
  const roomId = multiplayerData?.roomId || '';

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

    const botNames = ['Bramhi Bot', 'Nani AI', 'Samantha Bot'];
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
  const [currentEntry, setCurrentEntry] = useState<WordEntry>(HANGMAN_WORDS[0]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const secretWord = currentEntry.word;
  const wrongGuesses = guessedLetters.filter(l => !secretWord.includes(l));
  const maxStrikes = 6;
  const isDead = wrongGuesses.length >= maxStrikes;

  // Check victory
  const isSolved = secretWord.split('').every(ch => guessedLetters.includes(ch));

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  // Host sync secret entry
  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_HANGMAN', entry: currentEntry });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_HANGMAN' && action.entry) {
        setCurrentEntry(action.entry);
        setGuessedLetters([]);
        setGameOver(false);
        setHasWon(false);
      } else if (action.type === 'GUESS_LETTER') {
        applyGuess(action.letter);
      } else if (action.type === 'REMATCH') {
        setCurrentEntry(action.entry);
        setGuessedLetters([]);
        setGameOver(false);
        setHasWon(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers, secretWord]);

  useEffect(() => {
    if (isSolved && !gameOver) {
      sound.play('win');
      confetti({ particleCount: 70, spread: 80 });
      setHasWon(true);
      setGameOver(true);
      recordGameResult('win');
      setPlayers(prev =>
        prev.map(p => (p.id === myPlayerId ? { ...p, score: p.score + 20 } : p))
      );
    } else if (isDead && !gameOver) {
      sound.play('loss');
      setGameOver(true);
      recordGameResult('loss');
    }
  }, [isSolved, isDead, gameOver, myPlayerId]);

  const applyGuess = (char: string) => {
    if (guessedLetters.includes(char) || gameOver) return;
    setGuessedLetters(prev => [...prev, char]);

    if (secretWord.includes(char)) {
      sound.play('move');
    } else {
      sound.play('loss');
    }
  };

  const handleGuess = (char: string) => {
    applyGuess(char);
    if (isMultiplayer) {
      sendAction({ type: 'GUESS_LETTER', letter: char });
    }
  };

  const handleRematch = () => {
    const nextEntry = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    setCurrentEntry(nextEntry);
    setGuessedLetters([]);
    setGameOver(false);
    setHasWon(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', entry: nextEntry });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-rose-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(244,63,94,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-black tracking-wider text-rose-400 uppercase">
              Hangman Arena · {currentEntry.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/40 rounded-full text-xs font-bold text-rose-300">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            Lives: {maxStrikes - wrongGuesses.length} / {maxStrikes}
          </div>
        </div>

        {/* Gallows SVG Animation */}
        <div className="w-48 h-44 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-center p-2 shadow-inner">
          <svg viewBox="0 0 100 110" className="w-full h-full stroke-slate-300 stroke-2 fill-none">
            {/* Base */}
            <line x1="10" y1="100" x2="80" y2="100" />
            {/* Pole */}
            <line x1="30" y1="100" x2="30" y2="15" />
            {/* Beam */}
            <line x1="30" y1="15" x2="70" y2="15" />
            {/* Rope */}
            <line x1="70" y1="15" x2="70" y2="30" stroke="#f43f5e" strokeWidth="2.5" />

            {/* Head (Strike 1) */}
            {wrongGuesses.length >= 1 && <circle cx="70" cy="38" r="8" stroke="#f43f5e" />}
            {/* Body (Strike 2) */}
            {wrongGuesses.length >= 2 && <line x1="70" y1="46" x2="70" y2="70" stroke="#f43f5e" />}
            {/* Left Arm (Strike 3) */}
            {wrongGuesses.length >= 3 && <line x1="70" y1="52" x2="56" y2="62" stroke="#f43f5e" />}
            {/* Right Arm (Strike 4) */}
            {wrongGuesses.length >= 4 && <line x1="70" y1="52" x2="84" y2="62" stroke="#f43f5e" />}
            {/* Left Leg (Strike 5) */}
            {wrongGuesses.length >= 5 && <line x1="70" y1="70" x2="58" y2="88" stroke="#f43f5e" />}
            {/* Right Leg (Strike 6 - Dead) */}
            {wrongGuesses.length >= 6 && <line x1="70" y1="70" x2="82" y2="88" stroke="#f43f5e" />}
          </svg>
        </div>

        {/* Mystery Word Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2 my-2">
          {secretWord.split('').map((char, idx) => {
            const revealed = guessedLetters.includes(char) || gameOver;
            return (
              <div
                key={idx}
                className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center font-mono font-black text-lg sm:text-xl transition-all ${
                  revealed
                    ? 'bg-slate-900 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-transparent'
                }`}
              >
                {revealed ? char : ''}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 italic">Hint: {currentEntry.hint}</div>

        {/* Alphabet Keyboard */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mt-2">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const isRight = isGuessed && secretWord.includes(letter);
            const isWrong = isGuessed && !secretWord.includes(letter);

            let btnClass = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-rose-500/50';
            if (isRight) btnClass = 'bg-emerald-600 border-emerald-500 text-white opacity-60';
            else if (isWrong) btnClass = 'bg-slate-950 border-slate-900 text-slate-600 opacity-40 cursor-not-allowed';

            return (
              <button
                key={letter}
                disabled={isGuessed || gameOver}
                onClick={() => handleGuess(letter)}
                className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg border font-mono font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow ${btnClass}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-rose-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">
              {hasWon ? 'Hero Saved! 🎉' : 'Gallows Claimed!'}
            </h2>
            <div className="text-xs text-slate-300">
              The secret answer was: <strong className="text-rose-400 font-mono text-base">{secretWord}</strong>
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="rose"
            />
          </div>
        </div>
      )}
    </div>
  );
};
