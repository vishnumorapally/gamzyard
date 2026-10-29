// client/src/games/wordchain/WordChainGame.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Timer, Link2, Send, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
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

interface WordChainGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const STARTER_WORDS = ['CINEMA', 'SUPERMAN', 'BATMAN', 'AVENGERS', 'TIGER', 'HERO', 'GALAXY', 'LEGEND'];

// Common words dictionary sample for bot & validation
const BOT_DICTIONARY: Record<string, string[]> = {
  A: ['ACTOR', 'ACTION', 'AMAZING', 'AMARAN', 'APPLE', 'ANIMAL', 'ARROW', 'AQUAMAN'],
  B: ['BATMAN', 'BIRYANI', 'BLOCKBUSTER', 'BRAVE', 'BLADE', 'BATTLE', 'BLUE', 'BOSS'],
  C: ['CINEMA', 'CYBORG', 'COMEDY', 'CHAMPION', 'CANDY', 'CLOUD', 'CASTLE', 'CRICKET'],
  D: ['DIRECTOR', 'DRAGON', 'DANCE', 'DEADPOOL', 'DIAMOND', 'DREAM', 'DESTINY', 'DANGER'],
  E: ['ENERGY', 'EAGLE', 'EMPEROR', 'EXPRESS', 'EPIC', 'EARTH', 'ELEPHANT', 'ESCAPE'],
  F: ['FLASH', 'FUTURE', 'FOREST', 'FLAME', 'FANTASY', 'FRIEND', 'FIGHTER', 'FALCON'],
  G: ['GALAXY', 'GLORY', 'GOLDEN', 'GIANT', 'GAMER', 'GUITAR', 'GREEN', 'GUARDIAN'],
  H: ['HERO', 'HUNTER', 'HEART', 'HONOR', 'HAWKMAN', 'HULK', 'HEAVEN', 'HARBOR'],
  I: ['IRONMAN', 'ISLAND', 'INFINITY', 'IMPACT', 'ILLUSION', 'INDIAN', 'ICE', 'INSPIRE'],
  J: ['JOKER', 'JOURNEY', 'JUSTICE', 'JUNGLE', 'JEWEL', 'JAGUAR', 'JACKET', 'JOY'],
  K: ['KABALI', 'KNIGHT', 'KING', 'KANGUVA', 'KARATE', 'KINGDOM', 'KINETIC', 'KANGAROO'],
  L: ['LEGEND', 'LEO', 'LEADER', 'LIGHTNING', 'LOGAN', 'LION', 'LUCKY', 'LASER'],
  M: ['MOVIE', 'MASTER', 'MARVEL', 'MAGIC', 'MYTH', 'MONSTER', 'MEGATRON', 'METEOR'],
  N: ['NIGHTWING', 'NATURE', 'NINJA', 'NOVA', 'NEON', 'NAVY', 'NATION', 'NUGGET'],
  O: ['ORIGIN', 'OMEGA', 'ORBIT', 'OCEAN', 'OPERA', 'OUTLAW', 'OWL', 'OVERLORD'],
  P: ['PUNCH', 'POWER', 'PHOENIX', 'PLANET', 'PIRATE', 'PALACE', 'PANTHER', 'PACIFIC'],
  Q: ['QUEEN', 'QUEST', 'QUICK', 'QUANTUM', 'QUAKE', 'QUIZ', 'QUARTZ'],
  R: ['ROBIN', 'ROBOT', 'ROCKET', 'RUNNER', 'REBEL', 'RIVER', 'RADAR', 'RAIDER'],
  S: ['SUPERMAN', 'SPIDERMAN', 'STAR', 'SHIELD', 'STORM', 'SECRET', 'SHAZAM', 'SILVER'],
  T: ['THOR', 'TITAN', 'THUNDER', 'TIGER', 'TIME', 'TALENT', 'TOWER', 'TEMPLE'],
  U: ['ULTRA', 'UNIVERSE', 'ULTIMATE', 'UNION', 'UMBRELLA', 'UPPER', 'URANIUM'],
  V: ['VENOM', 'VICTORY', 'VILLAIN', 'VALIANT', 'VORTEX', 'VISION', 'VIPER', 'VIOLET'],
  W: ['WARRIOR', 'WONDER', 'WOLVERINE', 'WAVE', 'WINTER', 'WEAPON', 'WIZARD', 'WORLD'],
  X: ['XMEN', 'XENON', 'XYLOPHONE'],
  Y: ['YELLOW', 'YOUTH', 'YIELD', 'YEAR', 'YARD', 'YACHT'],
  Z: ['ZEUS', 'ZODIAC', 'ZERO', 'ZATANNA', 'ZONE', 'ZENITH', 'ZEPHYR']
};

export const WordChainGame: React.FC<WordChainGameProps> = ({
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

    const botNames = ['Lex Bot', 'Alfred AI', 'Jarvis AI', 'Friday AI'];
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
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [wordChain, setWordChain] = useState<string[]>([STARTER_WORDS[0]]);
  const [inputWord, setInputWord] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);

  const lastWord = wordChain[wordChain.length - 1];
  const requiredLetter = lastWord[lastWord.length - 1].toUpperCase();
  const currentTurnPlayer = players[currentTurnIdx] || players[0];
  const isMyTurn = currentTurnPlayer.id === myPlayerId;

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'WORD_SUBMITTED') {
        setWordChain(prev => [...prev, action.word]);
        setCurrentTurnIdx(action.nextTurnIdx);
        setTimeLeft(15);
        setErrorMsg(null);
        sound.play('move');

        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, score: p.score + action.points } : p))
        );
      } else if (action.type === 'PLAYER_TIMEOUT') {
        sound.play('loss');
        setCurrentTurnIdx(action.nextTurnIdx);
        setTimeLeft(15);
      } else if (action.type === 'REMATCH') {
        setWordChain([action.starterWord]);
        setCurrentTurnIdx(0);
        setTimeLeft(15);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  // Turn timer
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTurnIdx, gameOver, wordChain]);

  // Bot Turn Simulation
  useEffect(() => {
    if (gameOver || !currentTurnPlayer.isBot) return;

    const botDelay = (botDifficulty === 'hard' ? 2 : botDifficulty === 'medium' ? 3.5 : 5) * 1000;
    const botTimer = setTimeout(() => {
      const candidates = BOT_DICTIONARY[requiredLetter] || ['ZENITH', 'ZOOM', 'ZEBRA'];
      const unused = candidates.filter(w => !wordChain.includes(w));
      const chosenWord = unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : `${requiredLetter}EST`;

      submitWord(chosenWord, currentTurnPlayer.id);
    }, botDelay);

    return () => clearTimeout(botTimer);
  }, [currentTurnIdx, requiredLetter, gameOver, currentTurnPlayer, wordChain, botDifficulty]);

  const handleTimeout = () => {
    sound.play('loss');
    const nextIdx = (currentTurnIdx + 1) % players.length;
    setCurrentTurnIdx(nextIdx);
    setTimeLeft(15);

    if (isMultiplayer) {
      sendAction({ type: 'PLAYER_TIMEOUT', nextTurnIdx: nextIdx });
    }
  };

  const submitWord = (word: string, playerId: string) => {
    const cleanWord = word.trim().toUpperCase();
    if (cleanWord.length < 3) {
      setErrorMsg('Word must be at least 3 letters!');
      sound.play('loss');
      return;
    }

    if (cleanWord[0] !== requiredLetter) {
      setErrorMsg(`Word must start with letter "${requiredLetter}"!`);
      sound.play('loss');
      return;
    }

    if (wordChain.includes(cleanWord)) {
      setErrorMsg(`"${cleanWord}" has already been used!`);
      sound.play('loss');
      return;
    }

    // Success!
    sound.play('win');
    setErrorMsg(null);
    setInputWord('');
    const pts = cleanWord.length * 2;

    const nextTurn = (currentTurnIdx + 1) % players.length;
    setWordChain(prev => [...prev, cleanWord]);
    setCurrentTurnIdx(nextTurn);
    setTimeLeft(15);

    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, score: p.score + pts } : p))
    );

    if (isMultiplayer) {
      sendAction({
        type: 'WORD_SUBMITTED',
        word: cleanWord,
        playerId,
        points: pts,
        nextTurnIdx: nextTurn
      });
    }

    if (wordChain.length >= 20) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || gameOver || !inputWord) return;
    submitWord(inputWord, myPlayerId);
  };

  const handleRematch = () => {
    const randomStarter = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    setWordChain([randomStarter]);
    setCurrentTurnIdx(0);
    setTimeLeft(15);
    setGameOver(false);
    setPlayers(initialPlayers);
    setErrorMsg(null);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', starterWord: randomStarter });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(99,102,241,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black tracking-wider text-indigo-400 uppercase">
              Word Chain Masters ({wordChain.length}/20 Words)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timeLeft <= 4 ? 'bg-rose-500/30 text-rose-300 animate-pulse' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
              Turn: {currentTurnPlayer.name} {isMyTurn && '(YOU)'}
            </div>
          </div>
        </div>

        {/* Players Standings */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p, idx) => {
            const isTurn = idx === currentTurnIdx;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                  isTurn ? 'bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-400' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-indigo-400">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        {/* Word Chain Trail */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Current Word Chain:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-h-40 overflow-y-auto p-2">
            {wordChain.map((w, idx) => {
              const isLatest = idx === wordChain.length - 1;
              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-black flex items-center gap-1 transition-all ${
                    isLatest
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{w}</span>
                  {idx < wordChain.length - 1 && <span className="text-indigo-400">→</span>}
                </div>
              );
            })}
          </div>

          {/* Required Letter Display */}
          <div className="mt-2 flex flex-col items-center">
            <span className="text-xs text-slate-400">Next word MUST start with:</span>
            <div className="text-4xl font-black text-indigo-400 font-mono tracking-widest my-1 p-2 bg-slate-950 border-2 border-indigo-500/60 rounded-2xl px-6 shadow-md animate-pulse">
              "{requiredLetter}"
            </div>
          </div>

          {/* Submission Input */}
          {!gameOver && (
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center gap-2 mt-2">
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  disabled={!isMyTurn}
                  value={inputWord}
                  onChange={e => setInputWord(e.target.value)}
                  placeholder={isMyTurn ? `Type word starting with "${requiredLetter}"...` : `Waiting for ${currentTurnPlayer.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isMyTurn || !inputWord.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Link
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold animate-shake">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-indigo-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Chain Completed!</h2>
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
                    <span className="font-mono font-bold text-indigo-400">{p.score} pts</span>
                  </div>
                ))}
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
};
