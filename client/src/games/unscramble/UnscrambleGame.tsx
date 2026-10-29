// client/src/games/unscramble/UnscrambleGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Timer, HelpCircle, Send, RotateCcw, Shuffle, Sparkles, CheckCircle2 } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';
import { DC_CHARACTERS } from '../../data/dcData';
import { TELUGU_MOVIES } from '../../data/teluguData';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
}

interface UnscrambleGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

interface JumbledItem {
  word: string;
  jumbled: string;
  category: string;
  hint: string;
}

function scramble(word: string): string {
  const chars = word.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const result = chars.join('');
  return result === word ? scramble(word) : result;
}

const UNSCRAMBLE_ITEMS: JumbledItem[] = [
  ...DC_CHARACTERS.slice(0, 10).map(c => {
    const w = c.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    return {
      word: w,
      jumbled: scramble(w),
      category: 'DC Hero',
      hint: `${c.name} (${c.year})`
    };
  }),
  ...TELUGU_MOVIES.slice(0, 10).map(m => {
    const w = m.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    return {
      word: w,
      jumbled: scramble(w),
      category: 'Tollywood Hit',
      hint: `${m.name} (${m.year})`
    };
  })
];

export const UnscrambleGame: React.FC<UnscrambleGameProps> = ({
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
  const [roundIdx, setRoundIdx] = useState(0);
  const [items, setItems] = useState<JumbledItem[]>(() => [...UNSCRAMBLE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 5));
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [inputGuess, setInputGuess] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentItem = items[roundIdx] || items[0];

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_UNSCRAMBLE_ITEMS', items, roundIdx: 0 });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_UNSCRAMBLE_ITEMS') {
        setItems(action.items);
        setRoundIdx(action.roundIdx);
        setIsSolved(false);
        setPlacedLetters([]);
        setShowHint(false);
      } else if (action.type === 'WORD_SOLVED') {
        setIsSolved(true);
        sound.play('win');
        confetti({ particleCount: 50, spread: 70 });
        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, score: p.score + 20 } : p))
        );
      } else if (action.type === 'NEXT_ROUND') {
        setRoundIdx(action.nextRound);
        setIsSolved(false);
        setPlacedLetters([]);
        setShowHint(false);
        setInputGuess('');
      } else if (action.type === 'REMATCH') {
        setItems(action.items);
        setRoundIdx(0);
        setIsSolved(false);
        setPlacedLetters([]);
        setShowHint(false);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  const handleTileClick = (char: string) => {
    if (isSolved) return;
    sound.play('click');
    setPlacedLetters(prev => [...prev, char]);
  };

  const handleClearLetters = () => {
    sound.play('click');
    setPlacedLetters([]);
  };

  const handleCheckWord = (wordToCheck: string) => {
    const clean = wordToCheck.trim().toUpperCase();
    if (clean === currentItem.word) {
      sound.play('win');
      confetti({ particleCount: 50, spread: 70 });
      setIsSolved(true);

      setPlayers(prev =>
        prev.map(p => (p.id === myPlayerId ? { ...p, score: p.score + 20 } : p))
      );

      if (isMultiplayer) {
        sendAction({
          type: 'WORD_SOLVED',
          playerId: myPlayerId,
          word: clean
        });
      }
    } else {
      sound.play('loss');
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= items.length) {
      setGameOver(true);
      recordGameResult('win');
    } else {
      const nextR = roundIdx + 1;
      setRoundIdx(nextR);
      setIsSolved(false);
      setPlacedLetters([]);
      setShowHint(false);
      setInputGuess('');

      if (isMultiplayer) {
        sendAction({ type: 'NEXT_ROUND', nextRound: nextR });
      }
    }
  };

  const handleRematch = () => {
    const fresh = [...UNSCRAMBLE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 5);
    setItems(fresh);
    setRoundIdx(0);
    setIsSolved(false);
    setPlacedLetters([]);
    setShowHint(false);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', items: fresh });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-teal-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(20,184,166,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-black tracking-wider text-teal-400 uppercase">
              Unscramble the Word · Round {roundIdx + 1} of {items.length}
            </span>
          </div>
          <div className="text-xs px-3 py-1 bg-teal-500/20 border border-teal-500/40 rounded-full text-teal-300 font-bold">
            Category: {currentItem.category}
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
                {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
              </div>
              <span className="text-xs font-mono font-black text-teal-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Jumbled Letters Presentation */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-4">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Scrambled Word Letters:
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {currentItem.jumbled.split('').map((char, idx) => (
              <button
                key={idx}
                disabled={isSolved}
                onClick={() => handleTileClick(char)}
                className="w-11 h-13 sm:w-13 sm:h-15 rounded-2xl bg-teal-950/80 border-2 border-teal-500 text-teal-300 font-mono font-black text-xl sm:text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:scale-105 active:scale-95 transition-transform"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Constructed Word Area */}
          <div className="flex items-center gap-2">
            <div className="min-w-44 h-12 px-4 rounded-xl bg-slate-950 border border-teal-500/40 font-mono font-black text-xl tracking-widest text-teal-300 flex items-center justify-center shadow-inner">
              {placedLetters.join('') || <span className="text-xs text-slate-600 font-normal">Click tiles above...</span>}
            </div>
            {placedLetters.length > 0 && !isSolved && (
              <>
                <button
                  onClick={() => handleCheckWord(placedLetters.join(''))}
                  className="px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase shadow active:scale-95"
                >
                  Verify
                </button>
                <button
                  onClick={handleClearLetters}
                  className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs active:scale-95"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Direct Text Input Alternative */}
          {!isSolved && (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleCheckWord(inputGuess);
              }}
              className="flex items-center gap-2 max-w-sm w-full mt-1"
            >
              <input
                type="text"
                value={inputGuess}
                onChange={e => setInputGuess(e.target.value.toUpperCase())}
                placeholder="Or type full unscrambled word..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase active:scale-95 shadow"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Hint Section */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Need a Hint?
            </button>
            {showHint && <span className="text-xs text-amber-300 font-bold">Hint: {currentItem.hint}</span>}
          </div>

          {/* Solved celebration banner */}
          {isSolved && (
            <div className="w-full max-w-md bg-teal-950/80 border border-teal-500 rounded-2xl p-4 flex flex-col items-center gap-2 animate-fade-in shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
              <div className="text-sm font-black text-teal-200">
                Correct! Unscrambled: <strong className="text-white">{currentItem.word}</strong>
              </div>
              <button
                onClick={handleNextRound}
                className="mt-1 px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95"
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
          <div className="w-full max-w-sm bg-slate-900 border-2 border-teal-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-teal-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">All Words Unscrambled!</h2>
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
                    <span className="font-mono font-bold text-teal-400">{p.score} pts</span>
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
