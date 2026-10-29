// client/src/games/dumbcharades/DumbCharadesGame.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Bot,
  Clapperboard,
  Timer,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Send,
  Film
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { TollywoodCharadesMovie, TOLLYWOOD_CHARADES_MOVIES, getRandomCharadesMovie } from './movies';
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

interface DumbCharadesGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const DumbCharadesGame: React.FC<DumbCharadesGameProps> = ({
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

  const [currentMovie, setCurrentMovie] = useState<TollywoodCharadesMovie>(() => getRandomCharadesMovie());
  const [roundIdx, setRoundIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [guessInput, setGuessInput] = useState('');
  const [isGuessed, setIsGuessed] = useState(false);
  const [winnerGuesser, setWinnerGuesser] = useState<string | null>(null);
  const [showSecretToActor, setShowSecretToActor] = useState(true);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [actorIdx, setActorIdx] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentActor = players[actorIdx] || players[0];
  const isMeActor = currentActor.id === myPlayerId;

  // Broadcast action helper
  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  // Host synchronizes movie upon game start
  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({
        type: 'SYNC_MOVIE',
        movie: currentMovie,
        actorIdx: 0,
        roundIdx: 0
      });
    }
  }, [isMultiplayer, isHost, roomId]);

  // Multiplayer socket listener
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_MOVIE') {
        if (action.movie) setCurrentMovie(action.movie);
        if (action.actorIdx !== undefined) setActorIdx(action.actorIdx);
        if (action.roundIdx !== undefined) setRoundIdx(action.roundIdx);
        setIsGuessed(false);
        setWinnerGuesser(null);
        setTimeLeft(60);
      } else if (action.type === 'CORRECT_GUESS') {
        setIsGuessed(true);
        setWinnerGuesser(action.guesserName);
        sound.play('win');
        confetti({ particleCount: 60, spread: 80 });

        setPlayers(prev =>
          prev.map(p => {
            if (p.id === action.actorId || p.id === action.guesserId) {
              return { ...p, score: p.score + 10 };
            }
            return p;
          })
        );
      } else if (action.type === 'TIME_EXPIRED') {
        setIsGuessed(true);
        sound.play('loss');
      } else if (action.type === 'NEXT_ROUND') {
        setCurrentMovie(action.movie);
        setActorIdx(action.actorIdx);
        setRoundIdx(action.roundIdx);
        setIsGuessed(false);
        setWinnerGuesser(null);
        setTimeLeft(60);
        setGuessInput('');
      } else if (action.type === 'REMATCH') {
        setCurrentMovie(action.movie || getRandomCharadesMovie());
        setActorIdx(0);
        setRoundIdx(0);
        setIsGuessed(false);
        setWinnerGuesser(null);
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
    if (gameOver || isGuessed) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isGuessed, currentMovie]);

  // Bot guessing simulation if actor is human
  useEffect(() => {
    if (!isMeActor || isGuessed || gameOver) return;

    const delay = (botDifficulty === 'hard' ? 14 : botDifficulty === 'medium' ? 22 : 34) * 1000;
    const botTimer = setTimeout(() => {
      if (!isGuessed) {
        handleSuccessGuess('Bramhi Bot', 'bot_2');
      }
    }, delay);

    return () => clearTimeout(botTimer);
  }, [isMeActor, isGuessed, gameOver, botDifficulty, currentMovie]);

  const handleTimeExpired = () => {
    sound.play('loss');
    setIsGuessed(true);
    if (isMultiplayer && isHost) {
      sendAction({ type: 'TIME_EXPIRED' });
    }
  };

  const handleSuccessGuess = (guesserName: string, guesserId?: string) => {
    setIsGuessed(true);
    setWinnerGuesser(guesserName);
    sound.play('win');
    confetti({ particleCount: 50, spread: 70 });

    const gId = guesserId || myPlayerId;

    if (isMultiplayer) {
      sendAction({
        type: 'CORRECT_GUESS',
        actorId: currentActor.id,
        guesserId: gId,
        guesserName
      });
    }

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === currentActor.id || p.id === gId) {
          return { ...p, score: p.score + 10 };
        }
        return p;
      })
    );
  };

  const handleCheckGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuessed || isMeActor || !guessInput.trim()) return;

    const normalizedGuess = guessInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedActual = currentMovie.title.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedGuess === normalizedActual) {
      const myName = players.find(p => p.id === myPlayerId)?.name || 'You';
      handleSuccessGuess(myName, myPlayerId);
      setGuessInput('');
    } else {
      sound.play('loss');
      setGuessInput('');
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= 5) {
      setGameOver(true);
      recordGameResult('win');
    } else {
      const nextMovie = getRandomCharadesMovie();
      const nextActor = (actorIdx + 1) % players.length;
      const nextRound = roundIdx + 1;

      setCurrentMovie(nextMovie);
      setActorIdx(nextActor);
      setRoundIdx(nextRound);
      setIsGuessed(false);
      setWinnerGuesser(null);
      setTimeLeft(60);
      setGuessInput('');

      if (isMultiplayer) {
        sendAction({
          type: 'NEXT_ROUND',
          movie: nextMovie,
          actorIdx: nextActor,
          roundIdx: nextRound
        });
      }
    }
  };

  const handleRematch = () => {
    const freshMovie = getRandomCharadesMovie();
    setCurrentMovie(freshMovie);
    setActorIdx(0);
    setRoundIdx(0);
    setIsGuessed(false);
    setWinnerGuesser(null);
    setTimeLeft(60);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({
        type: 'REMATCH',
        movie: freshMovie
      });
    }
  };

  // Masked title for guessers (shows first letter and word lengths)
  const maskedTitle = currentMovie.title
    .split(' ')
    .map(word => word[0] + ' _ '.repeat(Math.max(1, word.length - 1)))
    .join('   ');

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-rose-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(244,63,94,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-black tracking-wider text-rose-400 uppercase">
              Tollywood Dumb Charades · Round {roundIdx + 1}/5
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-rose-500/20 border border-rose-500/40 rounded-full text-xs font-mono font-bold text-rose-300">
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
              Actor: {currentActor.name} {isMeActor && '(YOU)'}
            </div>
          </div>
        </div>

        {/* Players Scoreboard */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p, idx) => {
            const isActor = idx === actorIdx;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                  isActor
                    ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-400'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isActor ? (
                    <Clapperboard className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-rose-400">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        {/* Actor View vs Guesser View */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-4">
          {isMeActor ? (
            /* ACTOR PERSPECTIVE: Shows secret movie + acting clues */
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest">
                <span>🤫 YOU ARE ACTING! DO NOT SPEAK!</span>
                <button
                  onClick={() => setShowSecretToActor(!showSecretToActor)}
                  className="text-slate-400 hover:text-white"
                >
                  {showSecretToActor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {showSecretToActor ? (
                <div className="w-full max-w-md bg-slate-950 border-2 border-rose-500/60 rounded-2xl p-4 shadow-xl">
                  <span className="text-xs text-slate-400 font-bold uppercase">Secret Movie:</span>
                  <h2 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide mt-1">
                    {currentMovie.title}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Year: {currentMovie.year} · Words: {currentMovie.wordCount}
                  </div>

                  <div className="mt-3 p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-left flex flex-col gap-1.5">
                    <div className="text-[11px] font-bold text-amber-300">🎭 Acting Hints & Gestures:</div>
                    <div className="text-xs text-slate-300">
                      • <strong>Signature Action:</strong> {currentMovie.actingCues?.[0] || 'Act out iconic scene'}
                    </div>
                    <div className="text-xs text-slate-300">
                      • <strong>Cast / Clues:</strong> {currentMovie.starring}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">Movie title hidden. Click eye icon to reveal.</div>
              )}
            </div>
          ) : (
            /* GUESSER PERSPECTIVE: Shows clues, blanks, and input box */
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Watch {currentActor.name}'s gestures & guess the movie!
              </div>

              {/* Masked Word Blanks */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-lg sm:text-2xl font-black text-rose-300 tracking-widest max-w-xl">
                {isGuessed ? currentMovie.title : maskedTitle}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Release Year: <strong className="text-slate-200">{currentMovie.year}</strong></span>
                <span>•</span>
                <span>Words: <strong className="text-slate-200">{currentMovie.wordCount}</strong></span>
              </div>

              {/* Guess Submission Form */}
              {!isGuessed && (
                <form onSubmit={handleCheckGuess} className="w-full max-w-md flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={guessInput}
                    onChange={e => setGuessInput(e.target.value)}
                    placeholder="Type Telugu movie title (e.g. Baahubali, Pushpa)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition-transform active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" /> Guess
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Correct Guess celebration banner */}
          {isGuessed && (
            <div className="w-full max-w-md bg-emerald-950/80 border border-emerald-500 rounded-2xl p-4 flex flex-col items-center gap-2 animate-fade-in shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div className="text-sm font-black text-emerald-200">
                {winnerGuesser ? `🎉 ${winnerGuesser} Guessed Correctly!` : `Time's Up!`}
              </div>
              <div className="text-xs text-slate-300">
                Movie was: <strong className="text-white">{currentMovie.title}</strong> ({currentMovie.year})
              </div>

              <button
                onClick={handleNextRound}
                className="mt-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95"
              >
                Next Round ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-rose-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Charades Over!</h2>
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
                    <span className="font-mono font-bold text-rose-400">{p.score} pts</span>
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
