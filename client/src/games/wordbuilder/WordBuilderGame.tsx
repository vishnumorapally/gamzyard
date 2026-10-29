// client/src/games/wordbuilder/WordBuilderGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Shuffle, Send, RotateCcw, Sparkles, Delete } from 'lucide-react';
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

interface WordBuilderGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const TILE_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1,
  M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Y'];

function generateRack(): string[] {
  const rack: string[] = [];
  // Ensure at least 2 vowels
  for (let i = 0; i < 2; i++) {
    rack.push(VOWELS[Math.floor(Math.random() * VOWELS.length)]);
  }
  for (let i = 0; i < 5; i++) {
    rack.push(CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]);
  }
  return rack.sort(() => Math.random() - 0.5);
}

export const WordBuilderGame: React.FC<WordBuilderGameProps> = ({
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

    const botNames = ['Scrabble Bot', 'Lexicon AI', 'Webster Bot'];
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
  const [rack, setRack] = useState<string[]>(() => generateRack());
  const [placedTiles, setPlacedTiles] = useState<{ char: string; rackIdx: number }[]>([]);
  const [submittedWords, setSubmittedWords] = useState<{ word: string; pts: number }[]>([]);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const targetScore = 50;

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

      if (action.type === 'SYNC_RACK') {
        setRack(action.rack);
        setPlacedTiles([]);
      } else if (action.type === 'WORD_SUBMITTED') {
        setPlayers(prev =>
          prev.map(p => (p.id === action.playerId ? { ...p, score: p.score + action.pts } : p))
        );
      } else if (action.type === 'REMATCH') {
        setRack(action.rack);
        setPlacedTiles([]);
        setSubmittedWords([]);
        setRound(1);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  const handleTileClick = (char: string, rackIdx: number) => {
    sound.play('click');
    setPlacedTiles(prev => [...prev, { char, rackIdx }]);
  };

  const handleRemovePlaced = (index: number) => {
    sound.play('click');
    setPlacedTiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    sound.play('click');
    setPlacedTiles([]);
  };

  const handleShuffle = () => {
    sound.play('move');
    setRack(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const currentConstructedWord = placedTiles.map(t => t.char).join('');
  const currentConstructedPoints = placedTiles.reduce((sum, t) => sum + (TILE_VALUES[t.char] || 1), 0);

  const handleSubmitWord = () => {
    if (currentConstructedWord.length < 3) {
      sound.play('loss');
      return;
    }

    sound.play('win');
    const pts = currentConstructedPoints;
    setSubmittedWords(prev => [{ word: currentConstructedWord, pts }, ...prev]);
    setPlacedTiles([]);

    // Refresh rack with new tiles
    const newRack = generateRack();
    setRack(newRack);

    const myNewScore = (players.find(p => p.id === myPlayerId)?.score || 0) + pts;
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === myPlayerId) return { ...p, score: p.score + pts };
        if (p.isBot) {
          const botPts = Math.floor(Math.random() * 8) + 4;
          return { ...p, score: p.score + botPts };
        }
        return p;
      })
    );

    if (isMultiplayer) {
      sendAction({
        type: 'WORD_SUBMITTED',
        playerId: myPlayerId,
        word: currentConstructedWord,
        pts
      });
    }

    if (myNewScore >= targetScore || round >= 5) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    } else {
      setRound(prev => prev + 1);
    }
  };

  const handleRematch = () => {
    const newR = generateRack();
    setRack(newR);
    setPlacedTiles([]);
    setSubmittedWords([]);
    setRound(1);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', rack: newR });
    }
  };

  const usedRackIndices = placedTiles.map(t => t.rackIdx);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
              Word Builder · Target: {targetScore} Pts (Round {round}/5)
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
              <span className="text-xs font-mono font-black text-amber-400">{p.score} pts</span>
            </div>
          ))}
        </div>

        {/* Board Drop Area */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Your Constructed Word:
          </div>

          <div className="min-h-16 w-full max-w-lg bg-slate-950 border-2 border-dashed border-amber-500/40 rounded-2xl p-2 flex items-center justify-center gap-2 flex-wrap">
            {placedTiles.length === 0 ? (
              <span className="text-xs text-slate-500 italic">Click letters from your rack below to spell a word</span>
            ) : (
              placedTiles.map((tile, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemovePlaced(idx)}
                  className="w-11 h-12 rounded-xl bg-amber-500 text-slate-950 font-black font-mono text-lg flex flex-col items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white transition-all relative"
                >
                  <span>{tile.char}</span>
                  <span className="text-[9px] font-bold absolute bottom-0.5 right-1 opacity-75">
                    {TILE_VALUES[tile.char]}
                  </span>
                </button>
              ))
            )}
          </div>

          {placedTiles.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-amber-300 font-bold">
              <span>Word: <strong>{currentConstructedWord}</strong></span>
              <span>•</span>
              <span>Value: <strong>+{currentConstructedPoints} pts</strong></span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-1">
            <button
              disabled={placedTiles.length < 3}
              onClick={handleSubmitWord}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> Submit Word
            </button>
            <button
              disabled={placedTiles.length === 0}
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs active:scale-95 disabled:opacity-40"
            >
              Clear
            </button>
            <button
              onClick={handleShuffle}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5" /> Shuffle
            </button>
          </div>
        </div>

        {/* Letter Rack */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Your Scrabble Tile Rack:
          </div>
          <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-600/30 rounded-2xl shadow-inner">
            {rack.map((char, rIdx) => {
              const isUsed = usedRackIndices.includes(rIdx);
              return (
                <button
                  key={rIdx}
                  disabled={isUsed || gameOver}
                  onClick={() => handleTileClick(char, rIdx)}
                  className={`w-11 h-13 rounded-xl border-2 font-mono font-black text-lg flex flex-col items-center justify-center transition-transform shadow ${
                    isUsed
                      ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 scale-90'
                      : 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300 active:scale-95 hover:-translate-y-1'
                  } relative`}
                >
                  <span>{char}</span>
                  <span className="text-[9px] font-bold absolute bottom-0.5 right-1 opacity-70">
                    {TILE_VALUES[char]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Match Over!</h2>
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
                    <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
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
