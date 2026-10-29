// client/src/games/sentencebuilder/SentenceBuilderGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, BookOpen, Send, RotateCcw, Sparkles, MessageCircle } from 'lucide-react';
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

interface SentenceBuilderGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const STORY_PROMPTS = [
  'A superhero visits Hyderabad for spicy biryani',
  'Rajamouli announces a secret 10-year galactic epic',
  'Batman lands his Batmobile in Prasads multiplex',
  'Pushpa and Rocky Bhai open a tea stall together'
];

const BOT_WORDS_POOL = [
  'suddenly', 'flying', 'demanded', 'spicy', 'powerful', 'roared', 'epic', 'cinema',
  'ordered', 'mass', 'hero', 'screamed', 'dancing', 'super', 'glorious', 'clapping', 'unbelievable'
];

export const SentenceBuilderGame: React.FC<SentenceBuilderGameProps> = ({
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
  const [promptIdx, setPromptIdx] = useState(0);
  const [sentenceWords, setSentenceWords] = useState<string[]>(['Once', 'upon', 'a', 'time']);
  const [turnIdx, setTurnIdx] = useState(0);
  const [inputWord, setInputWord] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const currentPrompt = STORY_PROMPTS[promptIdx] || STORY_PROMPTS[0];
  const currentTurnPlayer = players[turnIdx] || players[0];
  const isMyTurn = currentTurnPlayer.id === myPlayerId;

  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({ type: 'SYNC_PROMPT', promptIdx: 0 });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_PROMPT') {
        setPromptIdx(action.promptIdx);
        setSentenceWords(['Once', 'upon', 'a', 'time']);
        setTurnIdx(0);
      } else if (action.type === 'WORD_ADDED') {
        setSentenceWords(prev => [...prev, action.word]);
        setTurnIdx(action.nextTurn);
        sound.play('move');
        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, score: p.score + 10 } : p))
        );
      } else if (action.type === 'REMATCH') {
        setPromptIdx(action.promptIdx);
        setSentenceWords(['Once', 'upon', 'a', 'time']);
        setTurnIdx(0);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  // Bot Turn Simulation
  useEffect(() => {
    if (gameOver || !currentTurnPlayer.isBot) return;

    const botDelay = (botDifficulty === 'hard' ? 1.5 : botDifficulty === 'medium' ? 2.5 : 4) * 1000;
    const botTimer = setTimeout(() => {
      const botPick = BOT_WORDS_POOL[Math.floor(Math.random() * BOT_WORDS_POOL.length)];
      addWord(botPick, currentTurnPlayer.id);
    }, botDelay);

    return () => clearTimeout(botTimer);
  }, [turnIdx, gameOver, currentTurnPlayer, botDifficulty]);

  const addWord = (word: string, playerId: string) => {
    const clean = word.trim().split(' ')[0]; // strictly 1 word
    if (!clean) return;

    sound.play('move');
    setInputWord('');

    const nextWords = [...sentenceWords, clean];
    setSentenceWords(nextWords);

    const next = (turnIdx + 1) % players.length;
    setTurnIdx(next);

    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, score: p.score + 10 } : p))
    );

    if (isMultiplayer) {
      sendAction({
        type: 'WORD_ADDED',
        word: clean,
        playerId,
        nextTurn: next
      });
    }

    if (nextWords.length >= 18 || clean.includes('.') || clean.includes('!')) {
      setGameOver(true);
      sound.play('win');
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || gameOver || !inputWord.trim()) return;
    addWord(inputWord, myPlayerId);
  };

  const handleRematch = () => {
    const nextIdx = (promptIdx + 1) % STORY_PROMPTS.length;
    setPromptIdx(nextIdx);
    setSentenceWords(['Once', 'upon', 'a', 'time']);
    setTurnIdx(0);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', promptIdx: nextIdx });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
              Sentence Building Challenge ({sentenceWords.length}/18 Words)
            </span>
          </div>
          <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
            Turn: {currentTurnPlayer.name} {isMyTurn && '(YOU)'}
          </div>
        </div>

        {/* Players Standings */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p, idx) => {
            const isTurn = idx === turnIdx;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                  isTurn ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-400 shadow-md' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-emerald-400">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        {/* Prompt Card */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center gap-3">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Story Mission Theme:
          </div>
          <div className="text-sm sm:text-base font-bold text-emerald-300 italic">
            "{currentPrompt}"
          </div>

          {/* Constructed Story Narrative Area */}
          <div className="w-full min-h-24 p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl text-left font-serif text-base sm:text-lg text-slate-200 leading-relaxed shadow-inner">
            {sentenceWords.map((w, idx) => (
              <span
                key={idx}
                className={`inline-block mr-1.5 px-1 rounded transition-all ${
                  idx === sentenceWords.length - 1 ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : ''
                }`}
              >
                {w}
              </span>
            ))}
            <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse align-middle ml-1" />
          </div>

          {/* One-Word Input */}
          {!gameOver && (
            <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2 mt-2">
              <input
                type="text"
                disabled={!isMyTurn}
                value={inputWord}
                onChange={e => setInputWord(e.target.value)}
                placeholder={isMyTurn ? 'Type ONE word to advance the story...' : `Waiting for ${currentTurnPlayer.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isMyTurn || !inputWord.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Story Completed!</h2>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs italic text-slate-300 font-serif leading-relaxed">
              "{sentenceWords.join(' ')}"
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="emerald"
            />
          </div>
        </div>
      )}
    </div>
  );
};
