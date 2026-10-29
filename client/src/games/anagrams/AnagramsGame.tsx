// client/src/games/anagrams/AnagramsGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Timer, Sparkles, Send, RotateCcw, Shuffle, CheckCircle2 } from 'lucide-react';
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

interface AnagramsGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface AnagramPool {
  poolWord: string;
  theme: string;
  validWords: string[];
}

const ANAGRAM_POOLS: AnagramPool[] = [
  {
    poolWord: 'SUPERMAN',
    theme: 'DC Superhero',
    validWords: ['SUPER', 'MAN', 'MAP', 'SUN', 'RUN', 'NEAR', 'PURE', 'NAME', 'SPUR', 'REAP', 'PEAR', 'RAMP', 'MEN', 'PAN', 'SEA']
  },
  {
    poolWord: 'BATMAN',
    theme: 'Dark Knight',
    validWords: ['BAT', 'MAN', 'TAB', 'MAT', 'BAN', 'ANT', 'TAN']
  },
  {
    poolWord: 'DIRECTOR',
    theme: 'Tollywood / Cinema',
    validWords: ['DIRECT', 'RICE', 'RIDE', 'TIED', 'DIET', 'TIRE', 'RIOT', 'ROTE', 'RED', 'DOT', 'ROD', 'TOE']
  },
  {
    poolWord: 'AVENGERS',
    theme: 'Marvel Heroes',
    validWords: ['ANGER', 'RANGE', 'RAGE', 'GEAR', 'SAVE', 'SEER', 'VEER', 'EAVE', 'EARS', 'SAGE', 'VAN', 'ERA', 'GAS']
  },
  {
    poolWord: 'KANGUVA',
    theme: 'Kollywood Epic',
    validWords: ['GUN', 'VAN', 'KANG', 'AGUA', 'VAGU']
  }
];

export const AnagramsGame: React.FC<AnagramsGameProps> = ({
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

    const botNames = ['Nani AI', 'Bramhi Bot', 'Samantha AI'];
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
  const [currentPool, setCurrentPool] = useState<AnagramPool>(ANAGRAM_POOLS[0]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>(() =>
    ANAGRAM_POOLS[0].poolWord.split('').sort(() => Math.random() - 0.5)
  );
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_ANAGRAM_POOL', pool: currentPool });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_ANAGRAM_POOL') {
        setCurrentPool(action.pool);
        setScrambledLetters(action.pool.poolWord.split('').sort(() => Math.random() - 0.5));
        setFoundWords([]);
        setTimeLeft(60);
      } else if (action.type === 'WORD_FOUND') {
        setFoundWords(prev => (prev.includes(action.word) ? prev : [...prev, action.word]));
        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, score: p.score + action.pts } : p))
        );
      } else if (action.type === 'REMATCH') {
        setCurrentPool(action.pool);
        setScrambledLetters(action.pool.poolWord.split('').sort(() => Math.random() - 0.5));
        setFoundWords([]);
        setTimeLeft(60);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  // 60-second timer
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          sound.play('win');
          recordGameResult('win');
          confetti({ particleCount: 70, spread: 80 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  // Bot simulation
  useEffect(() => {
    if (gameOver) return;
    const botInterval = setInterval(() => {
      const candidates = currentPool.validWords.filter(w => !foundWords.includes(w));
      if (candidates.length > 0) {
        const word = candidates[Math.floor(Math.random() * candidates.length)];
        const bot = players.find(p => p.isBot);
        if (bot) {
          const pts = word.length * 10;
          setFoundWords(prev => [...prev, word]);
          setPlayers(prev =>
            prev.map(p => (p.id === bot.id ? { ...p, score: p.score + pts } : p))
          );
        }
      }
    }, (botDifficulty === 'hard' ? 8 : botDifficulty === 'medium' ? 14 : 22) * 1000);

    return () => clearInterval(botInterval);
  }, [gameOver, currentPool, foundWords, botDifficulty, players]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputWord.trim().toUpperCase();
    setInputWord('');

    if (clean.length < 3 || foundWords.includes(clean)) {
      sound.play('loss');
      return;
    }

    if (currentPool.validWords.includes(clean)) {
      sound.play('win');
      const pts = clean.length * 10;
      setFoundWords(prev => [...prev, clean]);
      setPlayers(prev =>
        prev.map(p => (p.id === myPlayerId ? { ...p, score: p.score + pts } : p))
      );

      if (isMultiplayer) {
        sendAction({
          type: 'WORD_FOUND',
          word: clean,
          playerId: myPlayerId,
          pts
        });
      }
    } else {
      sound.play('loss');
    }
  };

  const handleShuffle = () => {
    sound.play('move');
    setScrambledLetters(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleRematch = () => {
    const nextPool = ANAGRAM_POOLS[Math.floor(Math.random() * ANAGRAM_POOLS.length)];
    setCurrentPool(nextPool);
    setScrambledLetters(nextPool.poolWord.split('').sort(() => Math.random() - 0.5));
    setFoundWords([]);
    setTimeLeft(60);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', pool: nextPool });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black tracking-wider text-cyan-400 uppercase">
              Anagrams Rush · {currentPool.theme}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timeLeft <= 10 ? 'bg-rose-500/30 text-rose-300 animate-pulse' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
              Found: {foundWords.length} / {currentPool.validWords.length}
            </div>
          </div>
        </div>

        {/* Players Standings */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map(p => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5 truncate">
                {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
              </div>
              <span className="text-xs font-mono font-black text-cyan-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Big Letter Pool Tiles */}
        <div className="flex items-center gap-2 my-2">
          {scrambledLetters.map((char, idx) => (
            <div
              key={idx}
              className="w-11 h-13 sm:w-13 sm:h-15 rounded-2xl bg-cyan-950/80 border-2 border-cyan-500 text-cyan-300 font-mono font-black text-xl sm:text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse"
            >
              {char}
            </div>
          ))}
          <button
            onClick={handleShuffle}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2 active:scale-95 transition-transform"
            title="Shuffle Tiles"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Word Submission */}
        {!gameOver && (
          <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2 mt-1">
            <input
              type="text"
              value={inputWord}
              onChange={e => setInputWord(e.target.value.toUpperCase())}
              placeholder="Spell sub-words (e.g. SUPER, MAN)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> Submit
            </button>
          </form>
        )}

        {/* Discovered Words Feed */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Discovered Words ({foundWords.length}):
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-h-32 overflow-y-auto">
            {foundWords.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No words found yet. Unscramble the letters!</span>
            ) : (
              foundWords.map(w => (
                <div
                  key={w}
                  className="px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-200 text-xs font-mono font-bold flex items-center gap-1 shadow"
                >
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  {w} (+{w.length * 10} pts)
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-cyan-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Time's Up!</h2>
            <div className="w-full flex flex-col gap-2 my-2">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-xl text-xs"
                  >
                    <span className="font-bold text-slate-200">
                      #{idx + 1} {p.name}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">{p.score} pts</span>
                  </div>
                ))}
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
