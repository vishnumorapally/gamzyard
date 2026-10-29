// client/src/games/antakshari/AntakshariGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Mic,
  Music,
  Heart,
  Volume2,
  Trophy,
  RotateCcw,
  Sparkles,
  Search,
  Users,
  Bot,
  Play,
  Flame,
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { BollywoodSong, BOLLYWOOD_SONGS, getSongsForLetter, searchSongs } from './songs';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface AntakshariPlayer {
  id: string;
  name: string;
  avatar: string;
  role: 'p1' | 'p2' | 'p3' | 'p4';
  isBot: boolean;
  lives: number;
  score: number;
  isEliminated: boolean;
}

interface AntakshariGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const AntakshariGame: React.FC<AntakshariGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
  multiplayerData,
  onExit
}) => {
  // Determine players
  const initialPlayers: AntakshariPlayer[] = useMemo(() => {
    if (mode === 'room' && multiplayerData?.allPlayers && multiplayerData.allPlayers.length > 0) {
      return multiplayerData.allPlayers.map((p, idx) => ({
        id: p.socketId,
        name: p.name,
        avatar: p.avatar || 'fox',
        role: `p${idx + 1}` as any,
        isBot: !!p.isBot,
        lives: 3,
        score: 0,
        isEliminated: false
      }));
    }

    const count = Math.max(2, Math.min(4, playerCount));
    const list: AntakshariPlayer[] = [
      { id: 'player_1', name: 'You (Singer)', avatar: 'singer', role: 'p1', isBot: false, lives: 3, score: 0, isEliminated: false }
    ];

    const botNames = ['Kishore Bot', 'Lata AI', 'Sonu Maestro'];
    for (let i = 1; i < count; i++) {
      list.push({
        id: `bot_${i + 1}`,
        name: botNames[i - 1] || `Singer Bot ${i + 1}`,
        avatar: 'robot',
        role: `p${i + 1}` as any,
        isBot: true,
        lives: 3,
        score: 0,
        isEliminated: false
      });
    }
    return list;
  }, [mode, multiplayerData, playerCount]);

  const [players, setPlayers] = useState<AntakshariPlayer[]>(initialPlayers);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('M');
  const [currentHindiChar, setCurrentHindiChar] = useState('म');
  const [timeLeft, setTimeLeft] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [customSongInput, setCustomSongInput] = useState('');
  const [recentlySungSong, setRecentlySungSong] = useState<BollywoodSong | null>(null);
  const [songSingHistory, setSongSingHistory] = useState<string[]>([
    'Baithe baithe kya karein, karna hai kuch kaam! Shuru karo Antakshari leke Prabhu ka naam! M se shuru!'
  ]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<AntakshariPlayer | null>(null);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const currentPlayer = players[currentTurnIndex] || players[0];
  const isMyTurn = !currentPlayer.isBot && (mode === 'bot' || currentPlayer.id === myPlayerId);

  // Available matching songs for current letter
  const matchingSongs = useMemo(() => {
    return searchSongs(searchQuery, currentLetter);
  }, [searchQuery, currentLetter]);

  // Turn advance helper
  const advanceTurn = useCallback((nextLetter: string, nextHindiChar: string) => {
    setCurrentLetter(nextLetter.toUpperCase());
    setCurrentHindiChar(nextHindiChar);
    setTimeLeft(25);
    setSearchQuery('');
    setCustomSongInput('');

    setPlayers(prev => {
      let nextIdx = (currentTurnIndex + 1) % prev.length;
      let loopCount = 0;
      while (prev[nextIdx].isEliminated && loopCount < prev.length) {
        nextIdx = (nextIdx + 1) % prev.length;
        loopCount++;
      }

      // Check if only one player remaining
      const activePlayers = prev.filter(p => !p.isEliminated);
      if (activePlayers.length <= 1) {
        setGameOver(true);
        setWinner(activePlayers[0] || prev[0]);
        sound.play('win');
        confetti({ particleCount: 90, spread: 80 });
      }

      setCurrentTurnIndex(nextIdx);
      return prev;
    });
  }, [currentTurnIndex]);

  // Song submission logic
  const handleSingSong = useCallback((song: BollywoodSong) => {
    sound.play('win');
    setRecentlySungSong(song);

    // Update score of current player
    setPlayers(prev =>
      prev.map((p, idx) => {
        if (idx === currentTurnIndex) {
          return { ...p, score: p.score + 10 };
        }
        return p;
      })
    );

    const announceText = `🎵 ${currentPlayer.name} sang "${song.title}" (${song.movie})! Next letter: ${song.endingLetter}`;
    setSongSingHistory(prev => [announceText, ...prev.slice(0, 4)]);

    // Emit socket action if multiplayer
    if (isMultiplayer && multiplayerData?.roomId) {
      const socket = getSocket();
      socket.emit('game_action', {
        roomId: multiplayerData.roomId,
        action: 'sing_song',
        song,
        playerIndex: currentTurnIndex
      });
    }

    // Small delay for applause and animation before passing to next letter
    setTimeout(() => {
      advanceTurn(song.endingLetter, song.endingLetter);
    }, 2200);
  }, [currentPlayer, currentTurnIndex, isMultiplayer, multiplayerData, advanceTurn]);

  // Turn timer countdown
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time expired! Deduct life
          sound.play('loss');
          setPlayers(prevPlayers => {
            const updated = prevPlayers.map((p, idx) => {
              if (idx === currentTurnIndex) {
                const newLives = p.lives - 1;
                return { ...p, lives: newLives, isEliminated: newLives <= 0 };
              }
              return p;
            });
            return updated;
          });

          setSongSingHistory(prevLogs => [
            `⏰ ${currentPlayer.name} ran out of time! Lost 1 heart! ❤️`,
            ...prevLogs.slice(0, 4)
          ]);

          // Pick random next letter
          const alphabet = 'ABCDEFGHIJKLMNOPRSTUVYZ';
          const randomNext = alphabet[Math.floor(Math.random() * alphabet.length)];
          setTimeout(() => advanceTurn(randomNext, randomNext), 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, currentTurnIndex, currentPlayer, advanceTurn]);

  // Bot AI Turn execution
  useEffect(() => {
    if (gameOver || !currentPlayer.isBot) return;

    const songs = getSongsForLetter(currentLetter);
    const chosenSong = songs.length > 0
      ? songs[Math.floor(Math.random() * songs.length)]
      : {
          id: `bot-fallback-${Date.now()}`,
          title: `${currentLetter} Main Khiladi Tu Anari`,
          openingLyrics: 'Hum dono hain alag alag, hum dono hain juda juda...',
          movie: 'Main Khiladi Tu Anari',
          year: 1994,
          singers: 'Kumar Sanu',
          startingLetter: currentLetter,
          endingLetter: 'A',
          hindiChar: currentHindiChar
        };

    const delay = (botDifficulty === 'hard' ? 2 : botDifficulty === 'medium' ? 3.5 : 5) * 1000;
    const botTimer = setTimeout(() => {
      if (!gameOver) {
        handleSingSong(chosenSong);
      }
    }, delay);

    return () => clearTimeout(botTimer);
  }, [currentPlayer, currentLetter, currentHindiChar, botDifficulty, gameOver, handleSingSong]);

  // Multiplayer socket listener
  useEffect(() => {
    if (!isMultiplayer || !multiplayerData?.roomId) return;
    const socket = getSocket();

    const handleGameAction = (data: any) => {
      if (data.action === 'sing_song' && data.playerIndex !== currentTurnIndex) {
        setRecentlySungSong(data.song);
        sound.play('win');
        setSongSingHistory(prev => [
          `🎵 ${players[data.playerIndex]?.name || 'Player'} sang "${data.song.title}"! Next letter: ${data.song.endingLetter}`,
          ...prev.slice(0, 4)
        ]);
        setTimeout(() => {
          advanceTurn(data.song.endingLetter, data.song.endingLetter);
        }, 2200);
      }
    };

    socket.on('game_action', handleGameAction);
    return () => {
      socket.off('game_action', handleGameAction);
    };
  }, [isMultiplayer, multiplayerData, players, currentTurnIndex, advanceTurn]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSongInput.trim() || !isMyTurn) return;

    const trimmed = customSongInput.trim();
    const endingChar = trimmed.slice(-1).toUpperCase();
    const customSong: BollywoodSong = {
      id: `custom-${Date.now()}`,
      title: trimmed,
      openingLyrics: trimmed,
      movie: 'Bollywood Superhit',
      year: 2024,
      singers: 'Live Vocalist',
      startingLetter: currentLetter,
      endingLetter: endingChar && /[A-Z]/.test(endingChar) ? endingChar : 'K',
      hindiChar: currentHindiChar
    };
    handleSingSong(customSong);
  };

  const handleRematch = () => {
    setPlayers(initialPlayers);
    setCurrentTurnIndex(0);
    setCurrentLetter('M');
    setCurrentHindiChar('म');
    setTimeLeft(25);
    setSearchQuery('');
    setCustomSongInput('');
    setRecentlySungSong(null);
    setSongSingHistory(['Shuru karo Antakshari leke Prabhu ka naam! M se shuru!']);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      {/* Musical Stage Ambient Header */}
      <div className="w-full bg-slate-950/95 border-2 border-pink-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(236,72,153,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Equalizer Bars Ambient Animation */}
        <div className="absolute top-2 left-6 right-6 flex justify-between opacity-15 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-pink-500 to-amber-400 rounded-full animate-pulse"
              style={{
                height: `${20 + (i % 5) * 8}px`,
                animationDelay: `${(i * 120) % 1000}ms`
              }}
            />
          ))}
        </div>

        {/* Players Circle Bar */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10">
          {players.map((p, idx) => {
            const isActive = idx === currentTurnIndex;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 relative ${
                  isActive
                    ? 'bg-pink-950/70 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-105'
                    : p.isEliminated
                    ? 'bg-slate-950/40 border-slate-900 opacity-40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                    <Mic className="w-2.5 h-2.5 animate-bounce" /> Singing
                  </div>
                )}
                <div className="text-xs font-bold text-white flex items-center gap-1 mt-1 truncate max-w-[120px]">
                  {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <span className="truncate">{p.name}</span>
                </div>
                {/* Lives / Hearts */}
                <div className="flex gap-1 mt-1">
                  {[...Array(3)].map((_, heartIdx) => (
                    <span
                      key={heartIdx}
                      className={`text-xs ${heartIdx < p.lives ? 'text-rose-500' : 'text-slate-700'}`}
                    >
                      ♥
                    </span>
                  ))}
                </div>
                <div className="text-[11px] font-mono font-bold text-pink-400 mt-0.5">
                  {p.score} pts
                </div>
              </div>
            );
          })}
        </div>

        {/* Glowing Center Microphone Stage */}
        <div className="w-full flex flex-col items-center justify-center py-2 z-10 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-pink-400 flex items-center gap-1.5 mb-1">
            <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            Current Singing Letter
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-pink-600 via-rose-500 to-amber-500 p-1 flex items-center justify-center shadow-[0_0_35px_rgba(236,72,153,0.5)] animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-amber-300 font-serif leading-none">
                {currentHindiChar}
              </span>
              <span className="text-xs font-mono font-bold text-pink-400 mt-1">
                ({currentLetter})
              </span>
            </div>
          </div>

          {/* Turn timer clock */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-sm font-mono font-black px-3 py-1 rounded-full border ${
              timeLeft > 10
                ? 'bg-slate-900 border-pink-500/40 text-pink-300'
                : 'bg-rose-950/80 border-rose-500 text-rose-300 animate-bounce'
            }`}>
              ⏱ {timeLeft}s Left
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Song Selection or Singing Deck */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 mt-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">
              {isMyTurn ? `Your Turn! Pick a song starting with "${currentHindiChar} (${currentLetter})"` : `Waiting for ${currentPlayer.name} to sing...`}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {matchingSongs.length} available songs
          </span>
        </div>

        {/* Search input */}
        {isMyTurn && (
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search Bollywood songs starting with "${currentLetter}"...`}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        )}

        {/* Song Cards List */}
        <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {matchingSongs.slice(0, 8).map(song => (
            <div
              key={song.id}
              className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-pink-500/50 hover:bg-slate-950 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                  {song.title}
                  <span className="text-[10px] text-slate-400 font-normal">({song.movie}, {song.year})</span>
                </div>
                <div className="text-[11px] text-slate-400 italic truncate mt-0.5">
                  "{song.openingLyrics}"
                </div>
                <div className="text-[10px] text-pink-400 font-medium mt-0.5">
                  Ends on: <strong>'{song.endingLetter}'</strong> · Singer: {song.singers}
                </div>
              </div>

              {isMyTurn && (
                <button
                  onClick={() => handleSingSong(song)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold tracking-wide shrink-0 transition-transform active:scale-95 shadow-md flex items-center gap-1"
                >
                  <Mic className="w-3 h-3" /> Sing!
                </button>
              )}
            </div>
          ))}

          {matchingSongs.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">
              No matching songs found in database for letter '{currentLetter}'. Type your own below!
            </div>
          )}
        </div>

        {/* Custom Song Sing Form */}
        {isMyTurn && (
          <form onSubmit={handleCustomSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={customSongInput}
              onChange={e => setCustomSongInput(e.target.value)}
              placeholder="Or type any Bollywood song title/lyrics here..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={!customSongInput.trim()}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition-all flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" /> Gaao!
            </button>
          </form>
        )}
      </div>

      {/* Musical History Feed */}
      <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 mt-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Music className="w-3 h-3 text-pink-400" /> Antakshari Stage Chronicle
        </div>
        <div className="flex flex-col gap-1 text-xs font-mono text-slate-300">
          {songSingHistory.slice(0, 3).map((log, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-pink-400 font-bold">♪</span>
              <span className={index === 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-pink-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
              <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {winner?.id === myPlayerId ? '🏆 ANTAKSHARI CHAMPION!' : 'STAGE CONCLUDED'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {winner?.name} has won the Bollywood musical championship!
              </p>
            </div>

            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1 text-xs">
              {players.map(p => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">{p.name}</span>
                  <span className="font-mono font-bold text-pink-400">{p.score} pts ({p.lives} lives)</span>
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
