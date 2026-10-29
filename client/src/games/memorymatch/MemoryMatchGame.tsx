// client/src/games/memorymatch/MemoryMatchGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Users, Bot, Sparkles, Timer, RotateCcw } from 'lucide-react';
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

interface MemoryMatchGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

const CARD_ICONS = ['🦸‍♂️', '🦇', '⚡', '🏹', '🛡️', '🗡️', '🍿', '🎭'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function generateDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  CARD_ICONS.forEach(icon => {
    deck.push({ id: id++, icon, isFlipped: false, isMatched: false });
    deck.push({ id: id++, icon, isFlipped: false, isMatched: false });
  });
  return deck.sort(() => Math.random() - 0.5);
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
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

    const botNames = ['Memory Bot', 'Cortex AI'];
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
  const [cards, setCards] = useState<Card[]>(() => generateDeck());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [turnIdx, setTurnIdx] = useState(0);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);

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
      sendAction({ type: 'SYNC_DECK', cards });
    }
  }, [isMultiplayer, isHost, roomId]);

  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_DECK') {
        setCards(action.cards);
      } else if (action.type === 'FLIP_CARD') {
        applyFlip(action.cardId);
      } else if (action.type === 'REMATCH') {
        setCards(action.cards);
        setFlippedCards([]);
        setTurnIdx(0);
        setMoves(0);
        setSeconds(0);
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
    if (gameOver) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Check victory
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched) && !gameOver) {
      setGameOver(true);
      sound.play('win');
      recordGameResult('win');
      confetti({ particleCount: 70, spread: 80 });
    }
  }, [cards, gameOver]);

  // Bot Turn Simulation
  useEffect(() => {
    if (gameOver || !currentTurnPlayer.isBot || flippedCards.length >= 2) return;

    const delay = (botDifficulty === 'hard' ? 1.5 : botDifficulty === 'medium' ? 2.5 : 3.5) * 1000;
    const botTimer = setTimeout(() => {
      const unrevealed = cards.filter(c => !c.isMatched && !c.isFlipped);
      if (unrevealed.length > 0) {
        const randomCard = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        applyFlip(randomCard.id);
      }
    }, delay);

    return () => clearTimeout(botTimer);
  }, [turnIdx, gameOver, currentTurnPlayer, flippedCards, cards, botDifficulty]);

  const applyFlip = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    sound.play('click');
    const newCards = cards.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        // Matched!
        setTimeout(() => {
          sound.play('win');
          setCards(prev =>
            prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c))
          );
          setFlippedCards([]);

          setPlayers(prev =>
            prev.map(p => (p.id === currentTurnPlayer.id ? { ...p, score: p.score + 10 } : p))
          );
        }, 500);
      } else {
        // Mismatch
        setTimeout(() => {
          sound.play('loss');
          setCards(prev =>
            prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
          setTurnIdx((turnIdx + 1) % players.length);
        }, 1200);
      }
    }
  };

  const handleCardClick = (cardId: number) => {
    if (!isMyTurn || flippedCards.length >= 2) return;
    applyFlip(cardId);

    if (isMultiplayer) {
      sendAction({ type: 'FLIP_CARD', cardId });
    }
  };

  const handleRematch = () => {
    const newDeck = generateDeck();
    setCards(newDeck);
    setFlippedCards([]);
    setTurnIdx(0);
    setMoves(0);
    setSeconds(0);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({ type: 'REMATCH', cards: newDeck });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black tracking-wider text-cyan-400 uppercase">
              Memory Card Match (4x4 Grid)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-mono font-bold">Moves: {moves}</span>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400">
              <Timer className="w-3.5 h-3.5" />
              {seconds}s
            </div>
            <div className="text-xs px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 font-bold">
              Turn: {currentTurnPlayer.name} {isMyTurn && '(YOU)'}
            </div>
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
                  isTurn ? 'bg-cyan-950/70 border-cyan-500 ring-1 ring-cyan-400' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {p.isBot ? <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-cyan-400">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        {/* 4x4 Cards Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner">
          {cards.map(card => {
            const isShown = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                disabled={isShown || !isMyTurn}
                onClick={() => handleCardClick(card.id)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-2xl sm:text-3xl transition-all duration-300 transform ${
                  card.isMatched
                    ? 'bg-emerald-950/80 border-emerald-500 text-white opacity-80 scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : isShown
                    ? 'bg-cyan-600 border-cyan-400 text-white scale-105 shadow-[0_0_15px_rgba(6,182,212,0.5)] rotate-y-180'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-transparent active:scale-95'
                }`}
              >
                {isShown ? card.icon : '❓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-cyan-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">All Pairs Matched!</h2>
            <div className="text-xs text-slate-300">
              Completed in <strong className="text-cyan-400 font-mono">{seconds}s</strong> ({moves} moves)
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
