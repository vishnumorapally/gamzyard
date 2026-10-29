// client/src/games/emojimovieguess/EmojiMovieGuessGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Film, Sparkles, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
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

interface EmojiMovieGuessProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface EmojiPuzzle {
  emojis: string;
  options: string[];
  correctIndex: number;
  industry: string;
}

const EMOJI_PUZZLES: EmojiPuzzle[] = [
  {
    emojis: '🦇 🃏 🏙️ 💥',
    options: ['The Dark Knight', 'Batman Begins', 'Joker', 'Suicide Squad'],
    correctIndex: 0,
    industry: 'DC Comics'
  },
  {
    emojis: '🌲 🪓 🚛 🔴',
    options: ['Pushpa: The Rise', 'KGF: Chapter 1', 'Devara', 'Sarpatta Parambarai'],
    correctIndex: 0,
    industry: 'Tollywood'
  },
  {
    emojis: '🦸 🔴 🔵 ⚡',
    options: ['Superman', 'The Flash', 'Shazam!', 'Aquaman'],
    correctIndex: 0,
    industry: 'DC Comics'
  },
  {
    emojis: '🕷️ 🕸️ 🧪 🏙️',
    options: ['Spider-Man', 'Iron Man', 'Doctor Strange', 'Ant-Man'],
    correctIndex: 0,
    industry: 'Marvel'
  },
  {
    emojis: '👑 🗡️ 🐘 🏰',
    options: ['Baahubali: The Beginning', 'Ponniyin Selvan', 'Magadheera', 'Kalki 2898 AD'],
    correctIndex: 0,
    industry: 'Tollywood'
  },
  {
    emojis: '🔫 🚂 🐅 🏹',
    options: ['RRR', 'Salaar', 'Devara', 'Vikram'],
    correctIndex: 0,
    industry: 'Tollywood'
  },
  {
    emojis: '🍫 🏫 🎒 🎶',
    options: ['Master', 'Boys', 'Don', 'Happy Days'],
    correctIndex: 0,
    industry: 'Kollywood'
  },
  {
    emojis: '🦅 🤖 🦾 🕶️',
    options: ['Enthiran', 'Robo 2.0', 'Cyborg', 'Iron Man'],
    correctIndex: 0,
    industry: 'Kollywood'
  }
];

export const EmojiMovieGuessGame: React.FC<EmojiMovieGuessProps> = ({
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
  const [puzzles, setPuzzles] = useState<EmojiPuzzle[]>(() => [...EMOJI_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 6));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = puzzles[currentIdx] || puzzles[0];

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_PUZZLES', puzzles, currentIdx: 0 });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_PUZZLES') {
        setPuzzles(action.puzzles);
        setCurrentIdx(action.currentIdx);
        setSelectedOpt(null);
        setIsAnswerLocked(false);
      } else if (action.type === 'NEXT_PUZZLE') {
        setCurrentIdx(action.nextIdx);
        setSelectedOpt(null);
        setIsAnswerLocked(false);
      } else if (action.type === 'REMATCH') {
        setPuzzles(action.puzzles);
        setCurrentIdx(0);
        setSelectedOpt(null);
        setIsAnswerLocked(false);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOpt(idx);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      sound.play('win');
      confetti({ particleCount: 30, spread: 60 });
    } else {
      sound.play('loss');
    }

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === myPlayerId && isCorrect) return { ...p, score: p.score + 15 };
        if (p.isBot) {
          const botWin = Math.random() > 0.35;
          return botWin ? { ...p, score: p.score + 15 } : p;
        }
        return p;
      })
    );

    setTimeout(() => {
      if (currentIdx + 1 >= puzzles.length) {
        setGameOver(true);
        recordGameResult('win');
      } else {
        const next = currentIdx + 1;
        setCurrentIdx(next);
        setSelectedOpt(null);
        setIsAnswerLocked(false);

        if (isMultiplayer) {
          sendAction({ type: 'NEXT_PUZZLE', nextIdx: next });
        }
      }
    }, 2200);
  };

  const handleRematch = () => {
    const fresh = [...EMOJI_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 6);
    setPuzzles(fresh);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswerLocked(false);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', puzzles: fresh });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-yellow-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(234,179,8,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-black tracking-wider text-yellow-400 uppercase">
              Emoji Movie Guess ({currentIdx + 1}/{puzzles.length})
            </span>
          </div>
          <div className="text-xs px-2.5 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-300 font-bold">
            Universe: {currentQ.industry}
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
                {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
              </div>
              <span className="text-xs font-mono font-black text-yellow-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Emoji Display Box */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Crack this emoji clue sequence:
          </span>
          <div className="text-4xl sm:text-5xl tracking-widest my-2 p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner animate-bounce">
            {currentQ.emojis}
          </div>

          {/* 4 Movie Options */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {currentQ.options.map((opt, idx) => {
              const isCorrect = idx === currentQ.correctIndex;
              const isSelected = selectedOpt === idx;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-yellow-500/50';
              if (isAnswerLocked) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerLocked}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between ${btnStyle} active:scale-95`}
                >
                  <span className="font-bold">{opt}</span>
                  {isAnswerLocked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isAnswerLocked && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-yellow-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Quiz Over!</h2>
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
                    <span className="font-mono font-bold text-yellow-400">{p.score} pts</span>
                  </div>
                ))}
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="amber"
            />
          </div>
        </div>
      )}
    </div>
  );
};
