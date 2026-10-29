// client/src/games/lastletter/LastLetterGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Timer, Heart, Zap, Send, RotateCcw, AlertTriangle } from 'lucide-react';
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
  lives: number;
}

interface LastLetterGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const STARTER_WORDS = ['WARRIOR', 'GALAXY', 'PHOENIX', 'THUNDER', 'NIGHT', 'DRAGON', 'SHADOW'];

const BOT_WORDS: Record<string, string[]> = {
  A: ['ATTACK', 'ACTION', 'ARROW', 'ALPHA', 'AMAZING', 'ASTRO', 'ANGEL'],
  B: ['BATTLE', 'BLADE', 'BEAST', 'BRAVE', 'BLOOD', 'BULLET', 'BOMB'],
  C: ['CYBORG', 'COMET', 'CLASH', 'COSMIC', 'CASTLE', 'CHASER'],
  D: ['DEMON', 'DRAGON', 'DANGER', 'DARK', 'DUEL', 'DREAM', 'DIVINE'],
  E: ['ENERGY', 'EAGLE', 'EMPIRE', 'ESCAPE', 'ECHO', 'ELITE'],
  F: ['FLAME', 'FLASH', 'FURY', 'FORCE', 'FIGHT', 'FALCON', 'FROST'],
  G: ['GHOST', 'GIANT', 'GLORY', 'GRAVITY', 'GUNNER', 'GALAXY'],
  H: ['HAWK', 'HERO', 'HELL', 'HEART', 'HUNTER', 'HAVOC', 'HYDRA'],
  I: ['IRON', 'IMPACT', 'ICE', 'INFINITY', 'INFERNO', 'ISLAND'],
  J: ['JOKER', 'JUDGE', 'JAGUAR', 'JET', 'JUSTICE', 'JUNGLE'],
  K: ['KNIGHT', 'KING', 'KINETIC', 'KOBRA', 'KARMA', 'KRAKEN'],
  L: ['LASER', 'LIGHT', 'LEGEND', 'LION', 'LUNAR', 'LOCK'],
  M: ['MAGIC', 'MYTH', 'MONSTER', 'METEOR', 'MUTANT', 'MATRIX'],
  N: ['NINJA', 'NIGHT', 'NOVA', 'NEXUS', 'NEBULA', 'NUCLEAR'],
  O: ['OMEGA', 'ORBIT', 'OVERLORD', 'OCEAN', 'OUTLAW', 'ORB'],
  P: ['PUNCH', 'POWER', 'PHOENIX', 'PULSE', 'PLASMA', 'PHANTOM'],
  Q: ['QUAKE', 'QUANTUM', 'QUEEN', 'QUICK'],
  R: ['RAIDER', 'ROBOT', 'ROCKET', 'RUSH', 'RIDER', 'REBEL'],
  S: ['SHADOW', 'STRIKE', 'SHIELD', 'SPIDER', 'STORM', 'SWORD'],
  T: ['THUNDER', 'TITAN', 'TIGER', 'TRACKER', 'TERROR', 'TORCH'],
  U: ['ULTRA', 'URANIUM', 'UNIVERSE', 'UNION'],
  V: ['VENOM', 'VIPER', 'VORTEX', 'VALIANT', 'VICTOR', 'VAMPIRE'],
  W: ['WARRIOR', 'WEAPON', 'WIZARD', 'WAVE', 'WOLF', 'WIND'],
  X: ['XMEN', 'XENON'],
  Y: ['YELLOW', 'YOUTH', 'YACHT'],
  Z: ['ZEUS', 'ZERO', 'ZONE', 'ZENITH']
};

export const LastLetterGame: React.FC<LastLetterGameProps> = ({
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
        lives: 3
      }));
    }

    const count = Math.max(2, Math.min(8, playerCount));
    const list: Player[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', isBot: false, lives: 3 }
    ];

    const botNames = ['Speedy AI', 'Blitz Bot', 'Flash AI'];
    for (let i = 1; i < count; i++) {
      list.push({
        id: `bot_${i + 1}`,
        name: botNames[i - 1] || `Player ${i + 1}`,
        avatar: 'robot',
        isBot: true,
        lives: 3
      });
    }
    return list;
  }, [mode, multiplayerData, playerCount]);

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [turnIdx, setTurnIdx] = useState(0);
  const [currentWord, setCurrentWord] = useState('WARRIOR');
  const [usedWords, setUsedWords] = useState<string[]>(['WARRIOR']);
  const [inputWord, setInputWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const activePlayers = players.filter(p => p.lives > 0);
  const currentTurnPlayer = players[turnIdx] || players[0];
  const requiredChar = currentWord[currentWord.length - 1].toUpperCase();
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

      if (action.type === 'WORD_PLAYED') {
        setCurrentWord(action.word);
        setUsedWords(prev => [...prev, action.word]);
        setTurnIdx(action.nextTurn);
        setTimeLeft(10);
        setErrorMsg(null);
        sound.play('move');
      } else if (action.type === 'LIFE_LOST') {
        sound.play('loss');
        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, lives: p.lives - 1 } : p))
        );
        setTurnIdx(action.nextTurn);
        setTimeLeft(10);
      } else if (action.type === 'REMATCH') {
        setCurrentWord(action.starter);
        setUsedWords([action.starter]);
        setTurnIdx(0);
        setTimeLeft(10);
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
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [turnIdx, gameOver, currentWord]);

  // Check game over
  useEffect(() => {
    const alive = players.filter(p => p.lives > 0);
    if (alive.length <= 1 && !gameOver) {
      setGameOver(true);
      sound.play('win');
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    }
  }, [players, gameOver]);

  // Bot Turn Simulation
  useEffect(() => {
    if (gameOver || !currentTurnPlayer.isBot || currentTurnPlayer.lives <= 0) return;

    const botDelay = (botDifficulty === 'hard' ? 2 : botDifficulty === 'medium' ? 3.5 : 5) * 1000;
    const botTimer = setTimeout(() => {
      const candidates = BOT_WORDS[requiredChar] || ['ZEUS', 'ZONE'];
      const unused = candidates.filter(w => !usedWords.includes(w));
      if (unused.length > 0) {
        const pick = unused[Math.floor(Math.random() * unused.length)];
        applyWord(pick, currentTurnPlayer.id);
      } else {
        handleTimeout();
      }
    }, botDelay);

    return () => clearTimeout(botTimer);
  }, [turnIdx, requiredChar, gameOver, currentTurnPlayer, usedWords, botDifficulty]);

  const handleTimeout = () => {
    sound.play('loss');
    const penalizedId = currentTurnPlayer.id;

    setPlayers(prev =>
      prev.map(p => (p.id === penalizedId ? { ...p, lives: Math.max(0, p.lives - 1) } : p))
    );

    let next = (turnIdx + 1) % players.length;
    while (players[next] && players[next].lives <= 0 && players.filter(p => p.lives > 0).length > 1) {
      next = (next + 1) % players.length;
    }

    setTurnIdx(next);
    setTimeLeft(10);

    if (isMultiplayer) {
      sendAction({
        type: 'LIFE_LOST',
        playerId: penalizedId,
        nextTurn: next
      });
    }
  };

  const applyWord = (word: string, playerId: string) => {
    const clean = word.trim().toUpperCase();
    if (clean.length < 3) {
      setErrorMsg('Min 3 letters required!');
      sound.play('loss');
      return;
    }

    if (clean[0] !== requiredChar) {
      setErrorMsg(`Must start with letter "${requiredChar}"!`);
      sound.play('loss');
      return;
    }

    if (usedWords.includes(clean)) {
      setErrorMsg(`"${clean}" was already used!`);
      sound.play('loss');
      return;
    }

    sound.play('win');
    setErrorMsg(null);
    setInputWord('');
    setCurrentWord(clean);
    setUsedWords(prev => [...prev, clean]);

    let next = (turnIdx + 1) % players.length;
    while (players[next] && players[next].lives <= 0 && players.filter(p => p.lives > 0).length > 1) {
      next = (next + 1) % players.length;
    }

    setTurnIdx(next);
    setTimeLeft(10);

    if (isMultiplayer) {
      sendAction({
        type: 'WORD_PLAYED',
        word: clean,
        playerId,
        nextTurn: next
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || gameOver || !inputWord) return;
    applyWord(inputWord, myPlayerId);
  };

  const handleRematch = () => {
    const nextStart = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    setCurrentWord(nextStart);
    setUsedWords([nextStart]);
    setTurnIdx(0);
    setTimeLeft(10);
    setGameOver(false);
    setPlayers(initialPlayers);
    setErrorMsg(null);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', starter: nextStart });
    }
  };

  const winner = players.find(p => p.lives > 0) || players[0];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-red-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-xs font-black tracking-wider text-red-400 uppercase">
              Last Letter Blitz Duel (10s Clock)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timeLeft <= 3 ? 'bg-rose-500 text-white animate-ping' : 'bg-red-500/20 text-red-300'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
              Turn: {currentTurnPlayer.name} {isMyTurn && '(YOU)'}
            </div>
          </div>
        </div>

        {/* Players Life Bars */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p, idx) => {
            const isTurn = idx === turnIdx;
            const isEliminated = p.lives <= 0;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex flex-col gap-1 transition-all ${
                  isEliminated
                    ? 'bg-slate-950/60 border-slate-900 opacity-40'
                    : isTurn
                    ? 'bg-red-950/70 border-red-500 ring-1 ring-red-400 shadow-md'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                  </div>
                  {isEliminated && <span className="text-[10px] text-rose-500 font-bold uppercase">OUT</span>}
                </div>
                {/* 3 Hearts */}
                <div className="flex items-center gap-1 mt-0.5">
                  {[0, 1, 2].map(hIdx => (
                    <Heart
                      key={hIdx}
                      className={`w-3.5 h-3.5 ${hIdx < p.lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Active Word Spotlight */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Last Played Word:
          </span>
          <div className="text-2xl sm:text-4xl font-black text-white font-mono tracking-wider flex items-center gap-1">
            <span>{currentWord.slice(0, -1)}</span>
            <span className="text-red-400 bg-red-950/80 px-2 py-0.5 rounded-xl border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              {requiredChar}
            </span>
          </div>

          <div className="text-xs text-red-300 font-bold">
            👉 Type a word starting with <span className="text-red-400 font-black text-sm">"{requiredChar}"</span>
          </div>

          {/* Submission Input */}
          {!gameOver && (
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center gap-2 mt-2">
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  disabled={!isMyTurn}
                  value={inputWord}
                  onChange={e => setInputWord(e.target.value.toUpperCase())}
                  placeholder={isMyTurn ? `Type word starting with "${requiredChar}"...` : `Waiting for ${currentTurnPlayer.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-red-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isMyTurn || !inputWord.trim()}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Shoot
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold animate-shake">
                  <AlertTriangle className="w-3.5 h-3.5" />
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
          <div className="w-full max-w-sm bg-slate-900 border-2 border-red-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-red-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Duel Over!</h2>
            <div className="text-sm font-bold text-emerald-400">
              🏆 {winner.name} is the Last Player Standing!
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
