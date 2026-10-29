// client/src/games/wordle/WordleGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, RotateCcw, HelpCircle, Delete, CornerDownLeft } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
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

interface WordleGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const SECRET_WORDS = [
  { word: 'FLASH', hint: 'Fastest DC Superhero' },
  { word: 'ROBIN', hint: 'Batman\'s Legendary Sidekick' },
  { word: 'JOKER', hint: 'Clown Prince of Gotham' },
  { word: 'TIGER', hint: 'Young Tiger Jr. NTR / Hero' },
  { word: 'PUSHP', hint: 'Pushpa the Rise / Wild Fire' },
  { word: 'BHIMA', hint: 'Jai Bhim / Mighty Warrior' },
  { word: 'TITAN', hint: 'Thanos or Giant Warrior' },
  { word: 'BLADE', hint: 'Daywalker Marvel Hero' },
  { word: 'RAVEN', hint: 'Teen Titans Dark Magic Hero' },
  { word: 'LOGAN', hint: 'Wolverine\'s Real Identity' }
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

export const WordleGame: React.FC<WordleGameProps> = ({
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

    const botNames = ['Bramhi AI', 'Nani Bot', 'Samantha AI'];
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
  const [currentWordItem, setCurrentWordItem] = useState(SECRET_WORDS[0]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const secretWord = currentWordItem.word;

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  // Host sync secret word
  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_SECRET_WORD', wordItem: currentWordItem });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_SECRET_WORD' && action.wordItem) {
        setCurrentWordItem(action.wordItem);
        setGuesses([]);
        setCurrentInput('');
        setGameOver(false);
        setHasWon(false);
      } else if (action.type === 'REMATCH') {
        setCurrentWordItem(action.wordItem);
        setGuesses([]);
        setCurrentInput('');
        setGameOver(false);
        setHasWon(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  const handleKeyPress = (char: string) => {
    if (gameOver) return;

    if (char === 'ENTER') {
      if (currentInput.length !== secretWord.length) {
        sound.play('loss');
        return;
      }

      const nextGuesses = [...guesses, currentInput];
      setGuesses(nextGuesses);
      setCurrentInput('');

      if (currentInput === secretWord) {
        sound.play('win');
        confetti({ particleCount: 70, spread: 80 });
        setHasWon(true);
        setGameOver(true);
        recordGameResult('win');
        setPlayers(prev =>
          prev.map(p => (p.id === myPlayerId ? { ...p, score: p.score + 25 } : p))
        );
      } else if (nextGuesses.length >= 6) {
        sound.play('loss');
        setGameOver(true);
        recordGameResult('loss');
      } else {
        sound.play('move');
      }
    } else if (char === 'BACK') {
      setCurrentInput(prev => prev.slice(0, -1));
      sound.play('click');
    } else if (currentInput.length < secretWord.length) {
      setCurrentInput(prev => prev + char);
      sound.play('click');
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (e.key === 'Backspace') handleKeyPress('BACK');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const getTileStatus = (char: string, index: number, guess: string) => {
    if (secretWord[index] === char) return 'bg-emerald-600 border-emerald-500 text-white';
    if (secretWord.includes(char)) return 'bg-amber-600 border-amber-500 text-white';
    return 'bg-slate-800 border-slate-700 text-slate-400';
  };

  const getKeyStatus = (key: string) => {
    let status = 'bg-slate-800 text-slate-200 border-slate-700';
    for (const g of guesses) {
      for (let i = 0; i < g.length; i++) {
        if (g[i] === key) {
          if (secretWord[i] === key) return 'bg-emerald-600 text-white border-emerald-500';
          if (secretWord.includes(key) && status !== 'bg-emerald-600 text-white border-emerald-500') {
            status = 'bg-amber-600 text-white border-amber-500';
          } else if (!secretWord.includes(key)) {
            status = 'bg-slate-900 text-slate-600 border-slate-800';
          }
        }
      }
    }
    return status;
  };

  const handleRematch = () => {
    const nextItem = SECRET_WORDS[Math.floor(Math.random() * SECRET_WORDS.length)];
    setCurrentWordItem(nextItem);
    setGuesses([]);
    setCurrentInput('');
    setGameOver(false);
    setHasWon(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', wordItem: nextItem });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
              Wordle Masters · 5-Letter Mystery
            </span>
          </div>
          <div className="text-xs px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full text-emerald-300 font-bold">
            Hint: {currentWordItem.hint}
          </div>
        </div>

        {/* Wordle Grid (6 rows) */}
        <div className="flex flex-col gap-2 my-2">
          {Array.from({ length: 6 }).map((_, rowIdx) => {
            const guess = guesses[rowIdx];
            const isCurrentRow = rowIdx === guesses.length;

            return (
              <div key={rowIdx} className="flex gap-2">
                {Array.from({ length: secretWord.length }).map((_, colIdx) => {
                  let char = '';
                  let tileClass = 'bg-slate-900/60 border-slate-800 text-white';

                  if (guess) {
                    char = guess[colIdx] || '';
                    tileClass = getTileStatus(char, colIdx, guess);
                  } else if (isCurrentRow) {
                    char = currentInput[colIdx] || '';
                    if (char) tileClass = 'border-slate-500 text-white scale-105';
                  }

                  return (
                    <div
                      key={colIdx}
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border-2 flex items-center justify-center font-mono font-black text-lg sm:text-xl transition-all ${tileClass}`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Keyboard */}
        <div className="w-full max-w-md flex flex-col items-center gap-1.5 mt-1">
          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-1">
              {row.map(k => (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className={`h-10 sm:h-11 px-2.5 sm:px-3 rounded-lg border font-mono font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow ${getKeyStatus(k)}`}
                >
                  {k === 'BACK' ? <Delete className="w-4 h-4" /> : k}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">
              {hasWon ? 'You Cracked the Word! 🎉' : 'Game Over!'}
            </h2>
            <div className="text-xs text-slate-300">
              The secret word was: <strong className="text-emerald-400 font-mono text-base">{secretWord}</strong>
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="emerald"
            />
          </div>
        </div>
      )}
    </div>
  );
};
