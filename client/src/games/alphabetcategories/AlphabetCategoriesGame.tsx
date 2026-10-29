// client/src/games/alphabetcategories/AlphabetCategoriesGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Timer, Send, RotateCcw, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
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

interface AlphabetCategoriesGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const CATEGORIES = [
  { id: 'movie', label: 'Movie / Film', placeholder: 'e.g. Baahubali, Batman...' },
  { id: 'hero', label: 'Celebrity / Hero', placeholder: 'e.g. Balakrishna, Bruce Wayne...' },
  { id: 'city', label: 'City / Place', placeholder: 'e.g. Bangalore, Berlin...' },
  { id: 'food', label: 'Food / Drink', placeholder: 'e.g. Biryani, Burger...' },
  { id: 'thing', label: 'Animal / Object', placeholder: 'e.g. Bear, Boomerang...' }
];

const LETTERS = ['B', 'P', 'M', 'S', 'R', 'K', 'A', 'D', 'T', 'C', 'L', 'G'];

export const AlphabetCategoriesGame: React.FC<AlphabetCategoriesGameProps> = ({
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
  const [currentLetter, setCurrentLetter] = useState(LETTERS[0]);
  const [round, setRound] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({
    movie: '',
    hero: '',
    city: '',
    food: '',
    thing: ''
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_LETTER', letter: currentLetter, round: 1 });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_LETTER') {
        setCurrentLetter(action.letter);
        setRound(action.round);
        setTimeLeft(60);
        setIsSubmitted(false);
        setAnswers({ movie: '', hero: '', city: '', food: '', thing: '' });
      } else if (action.type === 'ROUND_STOPPED') {
        setTimeLeft(Math.min(5, timeLeft));
        sound.play('click');
      } else if (action.type === 'SCORES_UPDATED') {
        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, score: p.score + action.pts } : p))
        );
      } else if (action.type === 'REMATCH') {
        setCurrentLetter(action.letter);
        setRound(1);
        setTimeLeft(60);
        setIsSubmitted(false);
        setGameOver(false);
        setAnswers({ movie: '', hero: '', city: '', food: '', thing: '' });
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers, timeLeft]);

  // Timer
  useEffect(() => {
    if (gameOver || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isSubmitted, currentLetter]);

  const handleInputChange = (catId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [catId]: val }));
  };

  const handleStopBuzzer = () => {
    sound.play('win');
    handleSubmitAnswers();

    if (isMultiplayer) {
      sendAction({ type: 'ROUND_STOPPED' });
    }
  };

  const handleSubmitAnswers = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    sound.play('win');

    // Count valid answers starting with current letter
    let myEarnedPts = 0;
    CATEGORIES.forEach(cat => {
      const ans = (answers[cat.id] || '').trim().toUpperCase();
      if (ans.length >= 2 && ans[0] === currentLetter) {
        myEarnedPts += 10;
      }
    });

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === myPlayerId) return { ...p, score: p.score + myEarnedPts };
        if (p.isBot) {
          const botPts = (Math.floor(Math.random() * 3) + 2) * 10;
          return { ...p, score: p.score + botPts };
        }
        return p;
      })
    );

    if (isMultiplayer) {
      sendAction({
        type: 'SCORES_UPDATED',
        playerId: myPlayerId,
        pts: myEarnedPts
      });
    }
  };

  const handleNextRound = () => {
    if (round >= 4) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    } else {
      const nextR = round + 1;
      const nextLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
      setRound(nextR);
      setCurrentLetter(nextLetter);
      setTimeLeft(60);
      setIsSubmitted(false);
      setAnswers({ movie: '', hero: '', city: '', food: '', thing: '' });

      if (isMultiplayer) {
        sendAction({ type: 'SYNC_LETTER', letter: nextLetter, round: nextR });
      }
    }
  };

  const handleRematch = () => {
    const nextL = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setCurrentLetter(nextL);
    setRound(1);
    setTimeLeft(60);
    setIsSubmitted(false);
    setGameOver(false);
    setAnswers({ movie: '', hero: '', city: '', food: '', thing: '' });
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', letter: nextL });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-blue-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(59,130,246,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-blue-400 uppercase">
              Alphabet Categories · Round {round} of 4
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold ${
              timeLeft <= 10 ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-500/20 text-blue-300'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {players.length} Players
            </span>
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
                {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
              </div>
              <span className="text-xs font-mono font-black text-blue-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Big Alphabet Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Target Letter:</span>
          <div className="w-14 h-14 rounded-2xl bg-blue-950/80 border-2 border-blue-500 text-blue-300 font-mono font-black text-3xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse">
            {currentLetter}
          </div>
        </div>

        {/* 5 Category Inputs Grid */}
        <div className="w-full max-w-lg flex flex-col gap-2.5">
          {CATEGORIES.map(cat => {
            const val = answers[cat.id] || '';
            const isValid = isSubmitted && val.trim().length >= 2 && val.trim()[0].toUpperCase() === currentLetter;

            return (
              <div key={cat.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>{cat.label}</span>
                  {isSubmitted && (
                    <span className={isValid ? 'text-emerald-400 font-black' : 'text-rose-400'}>
                      {isValid ? '✓ +10 pts' : '✗ 0 pts'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={val}
                  onChange={e => handleInputChange(cat.id, e.target.value)}
                  placeholder={cat.placeholder}
                  className={`w-full px-4 py-2 rounded-xl bg-slate-900 border text-white text-xs sm:text-sm focus:outline-none ${
                    isSubmitted
                      ? isValid
                        ? 'border-emerald-500 bg-emerald-950/20'
                        : 'border-rose-500/50 bg-rose-950/20'
                      : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-1">
          {!isSubmitted ? (
            <button
              onClick={handleStopBuzzer}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-95 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" /> STOP! / Done Slam 🚨
            </button>
          ) : (
            <button
              onClick={handleNextRound}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow active:scale-95"
            >
              Next Round ▶
            </button>
          )}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-blue-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-blue-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Categories Finished!</h2>
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
                    <span className="font-mono font-bold text-blue-400">{p.score} pts</span>
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
