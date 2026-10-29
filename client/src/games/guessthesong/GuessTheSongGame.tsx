// client/src/games/guessthesong/GuessTheSongGame.tsx
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Music,
  Play,
  Volume2,
  Users,
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { TollywoodSongRiddle, getRandomSongRiddles } from './songs';
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

interface GuessTheSongGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const GuessTheSongGame: React.FC<GuessTheSongGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [songs, setSongs] = useState<TollywoodSongRiddle[]>(() => getRandomSongRiddles(5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const isHost = !isMultiplayer || multiplayerData?.you?.isHost || false;
  const roomId = multiplayerData?.roomId || '';

  // Host sync songs on mount
  React.useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      const socket = getSocket();
      socket.emit('game_action', {
        roomId,
        action: { type: 'SYNC_SONGS', songs }
      });
    }
  }, [isMultiplayer, isHost, roomId]);

  // Listen for actions
  React.useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();
    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;
      if (action.type === 'SYNC_SONGS' && action.songs) {
        setSongs(action.songs);
      } else if (action.type === 'NEXT_SONG') {
        setCurrentIdx(action.nextIdx);
        setSelectedOpt(null);
        setIsAnswerLocked(false);
      }
    };
    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer]);

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

    const botNames = ['Bramhi Bot', 'Sid AI', 'Thaman Bot', 'DSP Bot'];
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
  const currentSong = songs[currentIdx] || songs[0];

  // Play Web Audio synth tune
  const playMelodyTune = () => {
    if (isPlayingMelody) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      setIsPlayingMelody(true);

      const notes = currentSong.melodyNotes || [440, 523, 659];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.25 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.25);
        osc.stop(ctx.currentTime + idx * 0.25 + 0.25);
      });

      setTimeout(() => {
        setIsPlayingMelody(false);
      }, notes.length * 250 + 200);
    } catch {
      setIsPlayingMelody(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOpt(idx);

    const isCorrect = idx === currentSong.correctIndex;
    if (isCorrect) {
      sound.play('win');
      confetti({ particleCount: 30, spread: 60 });
    } else {
      sound.play('loss');
    }

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === myPlayerId && isCorrect) return { ...p, score: p.score + 10 };
        if (p.isBot) {
          const botWin = Math.random() > 0.45;
          return botWin ? { ...p, score: p.score + 10 } : p;
        }
        return p;
      })
    );

    setTimeout(() => {
      if (currentIdx + 1 >= songs.length) {
        setGameOver(true);
        recordGameResult('win');
      } else {
        setCurrentIdx(prev => prev + 1);
        setSelectedOpt(null);
        setIsAnswerLocked(false);
      }
    }, 2400);
  };

  const handleRematch = () => {
    setSongs(getRandomSongRiddles(5));
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswerLocked(false);
    setGameOver(false);
    setPlayers(initialPlayers);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-pink-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(236,72,153,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-black tracking-wider text-pink-400 uppercase">
              Guess the Tollywood Song · Track {currentIdx + 1} of {songs.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {players.length} Players
          </span>
        </div>

        {/* Players Standings */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map(p => (
            <div
              key={p.id}
              className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5 truncate">
                {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
              </div>
              <span className="text-xs font-mono font-black text-pink-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Melody & Lyrics Clue Card */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
          {/* Synth Melody Player */}
          <button
            onClick={playMelodyTune}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase flex items-center gap-2 transition-transform active:scale-95 shadow-md ${
              isPlayingMelody
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-pink-600 hover:bg-pink-500 text-white'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isPlayingMelody ? 'animate-spin' : ''}`} />
            {isPlayingMelody ? 'Playing 8-Bit Melody...' : '▶ Play Synth Melody Tune'}
          </button>

          {/* Lyrics Snippet */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 max-w-lg mt-1">
            <div className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1.5">
              Fill-in-the-Blank Lyric:
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed italic">
              "{currentSong.lyricSnippet}"
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Movie: <strong className="text-white">{currentSong.movie}</strong> · Composer: <strong className="text-pink-300">{currentSong.composer}</strong>
          </div>
        </div>

        {/* 4 Song Options */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
          {currentSong.options.map((opt, idx) => {
            const isCorrect = idx === currentSong.correctIndex;
            const isSelected = selectedOpt === idx;

            let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-pink-500 hover:bg-slate-800';
            if (isAnswerLocked) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-300';
              } else {
                btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswerLocked}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all duration-200 flex items-center justify-between ${btnStyle}`}
              >
                <span>🎵 {opt}</span>
                {isAnswerLocked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isAnswerLocked && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-pink-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">Tollywood Music Connoisseur!</h2>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              {[...players].sort((a, b) => b.score - a.score).map((p, rank) => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">#{rank + 1} {p.name}</span>
                  <span className="font-mono font-bold text-pink-400">{p.score} pts</span>
                </div>
              ))}
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
