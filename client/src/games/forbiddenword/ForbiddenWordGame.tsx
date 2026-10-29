// client/src/games/forbiddenword/ForbiddenWordGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Timer, AlertOctagon, Send, RotateCcw, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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

interface ForbiddenWordGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface TabooCard {
  target: string;
  forbidden: string[];
  category: string;
}

const TABOO_CARDS: TabooCard[] = [
  {
    target: 'BATMAN',
    forbidden: ['GOTHAM', 'JOKER', 'CAPE', 'WAYNE'],
    category: 'DC Superhero'
  },
  {
    target: 'SUPERMAN',
    forbidden: ['KRYPTON', 'CLARK', 'FLYING', 'CAPE'],
    category: 'DC Superhero'
  },
  {
    target: 'BIRYANI',
    forbidden: ['RICE', 'HYDERABAD', 'CHICKEN', 'POT'],
    category: 'Food / Culture'
  },
  {
    target: 'PUSHPA',
    forbidden: ['ALLU ARJUN', 'RED SANDALWOOD', 'THAGGEDE LE', 'FOREST'],
    category: 'Tollywood Hit'
  },
  {
    target: 'BAAHUBALI',
    forbidden: ['PRABHAS', 'MAHISHMATI', 'KATTAPPA', 'SWORD'],
    category: 'Indian Epic'
  },
  {
    target: 'THE FLASH',
    forbidden: ['SPEED', 'FAST', 'RUN', 'LIGHTNING'],
    category: 'DC Superhero'
  }
];

export const ForbiddenWordGame: React.FC<ForbiddenWordGameProps> = ({
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
  const [describerIdx, setDescriberIdx] = useState(0);
  const [currentCard, setCurrentCard] = useState<TabooCard>(TABOO_CARDS[0]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSolved, setIsSolved] = useState(false);
  const [guesserWinner, setGuesserWinner] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const currentDescriber = players[describerIdx] || players[0];
  const isMeDescriber = currentDescriber.id === myPlayerId;

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_CARD', card: currentCard, describerIdx: 0, roundIdx: 0 });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_CARD') {
        setCurrentCard(action.card);
        setDescriberIdx(action.describerIdx);
        setRoundIdx(action.roundIdx);
        setIsSolved(false);
        setGuesserWinner(null);
        setTimeLeft(60);
      } else if (action.type === 'TABOO_GUESSED') {
        setIsSolved(true);
        setGuesserWinner(action.guesserName);
        sound.play('win');
        confetti({ particleCount: 50, spread: 70 });
        setPlayers(prev =>
          prev.map(p => {
            if (p.id === action.describerId || p.id === action.guesserId) {
              return { ...p, score: p.score + 15 };
            }
            return p;
          })
        );
      } else if (action.type === 'NEXT_ROUND') {
        setCurrentCard(action.card);
        setDescriberIdx(action.describerIdx);
        setRoundIdx(action.roundIdx);
        setIsSolved(false);
        setGuesserWinner(null);
        setTimeLeft(60);
      } else if (action.type === 'REMATCH') {
        setCurrentCard(action.card);
        setDescriberIdx(0);
        setRoundIdx(0);
        setIsSolved(false);
        setGuesserWinner(null);
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

  // Timer
  useEffect(() => {
    if (gameOver || isSolved) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSolved(true);
          sound.play('loss');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isSolved, currentCard]);

  // Bot guesser simulation
  useEffect(() => {
    if (!isMeDescriber || isSolved || gameOver) return;

    const delay = (botDifficulty === 'hard' ? 14 : botDifficulty === 'medium' ? 24 : 36) * 1000;
    const botTimer = setTimeout(() => {
      if (!isSolved) {
        handleSuccessGuess('Bramhi Bot', 'bot_2');
      }
    }, delay);

    return () => clearTimeout(botTimer);
  }, [isMeDescriber, isSolved, gameOver, botDifficulty, currentCard]);

  const handleSuccessGuess = (guesserName: string, guesserId?: string) => {
    setIsSolved(true);
    setGuesserWinner(guesserName);
    sound.play('win');
    confetti({ particleCount: 50, spread: 70 });

    const gId = guesserId || myPlayerId;
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === currentDescriber.id || p.id === gId) {
          return { ...p, score: p.score + 15 };
        }
        return p;
      })
    );

    if (isMultiplayer) {
      sendAction({
        type: 'TABOO_GUESSED',
        describerId: currentDescriber.id,
        guesserId: gId,
        guesserName
      });
    }
  };

  const handleCheckGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSolved || isMeDescriber || !guessInput.trim()) return;

    const clean = guessInput.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const actual = currentCard.target.toUpperCase().replace(/[^A-Z]/g, '');

    if (clean === actual) {
      const myName = players.find(p => p.id === myPlayerId)?.name || 'You';
      handleSuccessGuess(myName, myPlayerId);
      setGuessInput('');
    } else {
      sound.play('loss');
      setGuessInput('');
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= TABOO_CARDS.length) {
      setGameOver(true);
      recordGameResult('win');
    } else {
      const nextCard = TABOO_CARDS[(roundIdx + 1) % TABOO_CARDS.length];
      const nextDescriber = (describerIdx + 1) % players.length;
      const nextR = roundIdx + 1;

      setCurrentCard(nextCard);
      setDescriberIdx(nextDescriber);
      setRoundIdx(nextR);
      setIsSolved(false);
      setGuesserWinner(null);
      setTimeLeft(60);

      if (isMultiplayer) {
        sendAction({
          type: 'NEXT_ROUND',
          card: nextCard,
          describerIdx: nextDescriber,
          roundIdx: nextR
        });
      }
    }
  };

  const handleRematch = () => {
    const nextC = TABOO_CARDS[0];
    setCurrentCard(nextC);
    setDescriberIdx(0);
    setRoundIdx(0);
    setIsSolved(false);
    setGuesserWinner(null);
    setTimeLeft(60);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', card: nextC });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-red-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span className="text-xs font-black tracking-wider text-red-400 uppercase">
              Forbidden Word (Taboo) · Round {roundIdx + 1} of {TABOO_CARDS.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-xs font-mono font-bold text-red-300">
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
              Describer: {currentDescriber.name} {isMeDescriber && '(YOU)'}
            </div>
          </div>
        </div>

        {/* Players Standings */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p, idx) => {
            const isDescriber = idx === describerIdx;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                  isDescriber ? 'bg-red-950/70 border-red-500 ring-1 ring-red-400' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-red-400">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        {/* Card Content Area */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-4">
          {isMeDescriber ? (
            /* DESCRIBER VIEW: Shows target word + 4 forbidden words */
            <div className="w-full max-w-md bg-slate-950 border-2 border-red-500/60 rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Describe this target word:
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                {currentCard.target}
              </h2>
              <div className="text-xs text-slate-400 font-bold">Category: {currentCard.category}</div>

              <div className="w-full border-t border-slate-800 pt-3 flex flex-col items-center gap-2">
                <span className="text-[11px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-1">
                  🚫 DO NOT SAY THESE 4 FORBIDDEN WORDS:
                </span>
                <div className="w-full grid grid-cols-2 gap-2 mt-1">
                  {currentCard.forbidden.map((word, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 font-bold font-mono text-xs text-center"
                    >
                      ✗ {word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* GUESSER VIEW: Shows category and input to guess */
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Listen to {currentDescriber.name}'s clues & guess the word!
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300">
                Category: <strong className="text-white text-sm">{currentCard.category}</strong>
              </div>

              {!isSolved && (
                <form onSubmit={handleCheckGuess} className="w-full max-w-md flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={guessInput}
                    onChange={e => setGuessInput(e.target.value)}
                    placeholder="Type your guess here..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" /> Guess
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Correct Guess celebration */}
          {isSolved && (
            <div className="w-full max-w-md bg-emerald-950/80 border border-emerald-500 rounded-2xl p-4 flex flex-col items-center gap-2 animate-fade-in shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div className="text-sm font-black text-emerald-200">
                {guesserWinner ? `🎉 ${guesserWinner} Guessed the Word!` : `Time's Up!`}
              </div>
              <div className="text-xs text-slate-300">
                Word was: <strong className="text-white font-bold">{currentCard.target}</strong>
              </div>

              <button
                onClick={handleNextRound}
                className="mt-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95"
              >
                Next Word ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-red-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-red-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Taboo Match Complete!</h2>
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
                    <span className="font-mono font-bold text-red-400">{p.score} pts</span>
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
