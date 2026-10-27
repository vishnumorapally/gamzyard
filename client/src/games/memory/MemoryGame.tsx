// client/src/games/memory/MemoryGame.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  MemoryCard,
  createShuffledMemoryCards,
  getMemoryBotPicks
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface MemoryGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [cards, setCards] = useState<MemoryCard[]>(createShuffledMemoryCards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw' | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [bonusTurnNotice, setBonusTurnNotice] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  // Refs to avoid stale closures and prevent rogue re-renders from spawning duplicate timeouts
  const cardsRef = useRef<MemoryCard[]>(cards);
  cardsRef.current = cards;

  const seenCardsRef = useRef<Record<number, string>>({});
  const isLockedRef = useRef<boolean>(false);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    activeTimersRef.current.forEach(t => clearTimeout(t));
    activeTimersRef.current = [];
  };

  const registerTimer = (t: NodeJS.Timeout) => {
    activeTimersRef.current.push(t);
  };

  const myRole: 'player1' | 'player2' = useMemo(() => {
    if (mode === 'bot') return 'player1';
    return multiplayerData?.yourRole || 'player1';
  }, [mode, multiplayerData]);

  const isMyTurn = mode === 'bot'
    ? currentTurn === 'player1'
    : currentTurn === myRole;

  const scores = useMemo(() => {
    let p1 = 0;
    let p2 = 0;
    for (const c of cards) {
      if (c.isMatched) {
        if (c.matchedBy === 'player1') p1 += 0.5;
        else if (c.matchedBy === 'player2') p2 += 0.5;
      }
    }
    return { p1: Math.floor(p1), p2: Math.floor(p2) };
  }, [cards]);

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // Evaluate 2 selected cards
  const evaluatePair = useCallback((id1: number, id2: number, actingPlayer: 'player1' | 'player2') => {
    isLockedRef.current = true;
    const currentCards = cardsRef.current;
    const isMatch = currentCards[id1].icon === currentCards[id2].icon;

    if (mode !== 'bot' && multiplayerData && actingPlayer === myRole) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { id1, id2, isMatch, player: actingPlayer },
        nextTurnState: { currentTurn: isMatch ? actingPlayer : (actingPlayer === 'player1' ? 'player2' : 'player1') }
      });
    }

    const t = setTimeout(() => {
      if (isMatch) {
        sound.play('capture');
        const nextCards: MemoryCard[] = cardsRef.current.map(c =>
          c.id === id1 || c.id === id2
            ? { ...c, isMatched: true, matchedBy: actingPlayer }
            : c
        );
        setCards(nextCards);
        setFlippedIds([]);
        isLockedRef.current = false;
        setMoveCount(prev => prev + 1);

        if (actingPlayer === myRole) {
          setBonusTurnNotice('⚡ Match! You get a free turn!');
        } else {
          setBonusTurnNotice(`🤖 Match! ${actingPlayer === 'player2' ? 'Opponent' : 'P1'} gets another turn.`);
        }
        setTimeout(() => setBonusTurnNotice(null), 2000);

        // Check if all matched
        if (nextCards.every(c => c.isMatched)) {
          setGameOver(true);
          const p1 = nextCards.filter(c => c.matchedBy === 'player1').length / 2;
          const p2 = nextCards.filter(c => c.matchedBy === 'player2').length / 2;
          if (p1 > p2) {
            setWinner('player1');
            const isMe = myRole === 'player1';
            setEndMessage(isMe ? `🏆 Victory! You collected ${p1} pairs!` : `💀 Defeat! Player 1 won ${p1} - ${p2}`);
            if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
            else { sound.play('loss'); recordGameResult('loss'); }
          } else if (p2 > p1) {
            setWinner('player2');
            const isMe = myRole === 'player2';
            setEndMessage(isMe ? `🏆 Victory! You collected ${p2} pairs!` : `💀 Defeat! Player 2 won ${p2} - ${p1}`);
            if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
            else { sound.play('loss'); recordGameResult('loss'); }
          } else {
            setWinner('draw');
            setEndMessage(`🤝 Tied Game at ${p1} - ${p2}!`);
            recordGameResult('draw');
          }
        }
      } else {
        sound.play('move');
        setFlippedIds([]);
        isLockedRef.current = false;
        setMoveCount(prev => prev + 1);
        setCurrentTurn(actingPlayer === 'player1' ? 'player2' : 'player1');
      }
    }, 900);

    registerTimer(t);
  }, [mode, multiplayerData, myRole]);

  // Handle Player Card Click
  const handleCardClick = (id: number) => {
    if (
      isLockedRef.current ||
      gameOver ||
      !isMyTurn ||
      isBotThinking ||
      cards[id].isMatched ||
      flippedIds.includes(id) ||
      flippedIds.length >= 2
    ) {
      return;
    }

    sound.play('click');
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    seenCardsRef.current[id] = cards[id].icon;

    if (newFlipped.length === 2) {
      evaluatePair(newFlipped[0], newFlipped[1], currentTurn);
    }
  };

  // Bot Turn Effect: Runs cleanly only when currentTurn becomes 'player2'
  useEffect(() => {
    if (mode !== 'bot' || currentTurn !== 'player2' || gameOver) {
      return;
    }

    setIsBotThinking(true);

    const t1 = setTimeout(() => {
      if (gameOver) return;

      const [id1, id2] = getMemoryBotPicks(cardsRef.current, seenCardsRef.current, botDifficulty);
      setFlippedIds([id1]);
      sound.play('click');
      seenCardsRef.current[id1] = cardsRef.current[id1].icon;

      const t2 = setTimeout(() => {
        if (gameOver) return;

        setFlippedIds([id1, id2]);
        sound.play('click');
        seenCardsRef.current[id2] = cardsRef.current[id2].icon;
        setIsBotThinking(false);

        evaluatePair(id1, id2, 'player2');
      }, 700);

      registerTimer(t2);
    }, 600);

    registerTimer(t1);

    return () => {
      clearAllTimers();
      setIsBotThinking(false);
    };
  }, [mode, currentTurn, gameOver, botDifficulty, evaluatePair]);

  // Turn Timer Hook
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver,
    isMyTurn,
    turnKey: `${moveCount}-${currentTurn}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (gameOver) return;
      setGameOver(true);
      clearAllTimers();
      if (timedOutUser === 'me') {
        const opp = myRole === 'player1' ? 'player2' : 'player1';
        setWinner(opp);
        setEndMessage('⏰ 30s Time Expired! You took too long to move.');
        sound.play('loss');
        recordGameResult('loss');
        if (mode !== 'bot' && multiplayerData) {
          const socket = getSocket();
          socket.emit('player_timeout', {
            roomId: multiplayerData.roomId,
            timedOutPlayerId: multiplayerData.you.socketId
          });
        }
      }
    }
  });

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: { id1: number; id2: number; isMatch: boolean; player: 'player1' | 'player2' }; nextTurnState: { currentTurn: 'player1' | 'player2' } }) => {
      const { id1, id2, isMatch, player } = data.move;
      isLockedRef.current = true;
      setFlippedIds([id1, id2]);
      sound.play('click');

      const t = setTimeout(() => {
        if (isMatch) {
          sound.play('capture');
          setCards(prev => prev.map(c =>
            c.id === id1 || c.id === id2
              ? { ...c, isMatched: true, matchedBy: (player as 'player1' | 'player2') }
              : c
          ));
        } else {
          sound.play('move');
        }
        setFlippedIds([]);
        isLockedRef.current = false;
        setMoveCount(prev => prev + 1);
        setCurrentTurn(data.nextTurnState.currentTurn);
      }, 850);

      registerTimer(t);
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      clearAllTimers();
      setOpponentLeft(true);
      setWinner(myRole);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOver(true);
      clearAllTimers();
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? myRole : (myRole === 'player1' ? 'player2' : 'player1'));
      setEndMessage(iWon ? '🏆 Opponent ran out of 30s turn limit! You Win!' : '⏰ Time expired! 30s limit reached.');
      if (iWon) {
        sound.play('win');
        triggerConfetti();
        recordGameResult('win');
      } else {
        sound.play('loss');
        recordGameResult('loss');
      }
    };

    const handleRematchStarted = () => {
      resetGame();
      sound.play('match');
    };

    socket.on('opponent_move', handleOpponentMove);
    socket.on('opponent_left', handleOpponentLeft);
    socket.on('player_timed_out', handlePlayerTimedOut);
    socket.on('rematch_started', handleRematchStarted);

    return () => {
      socket.off('opponent_move', handleOpponentMove);
      socket.off('opponent_left', handleOpponentLeft);
      socket.off('player_timed_out', handlePlayerTimedOut);
      socket.off('rematch_started', handleRematchStarted);
      clearAllTimers();
    };
  }, [mode, multiplayerData, myRole]);

  const resetGame = () => {
    clearAllTimers();
    setCards(createShuffledMemoryCards());
    setFlippedIds([]);
    seenCardsRef.current = {};
    setCurrentTurn('player1');
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setMoveCount(0);
    setEndMessage(null);
    setBonusTurnNotice(null);
    setIsBotThinking(false);
    isLockedRef.current = false;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* 30s Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`You: ${myRole === 'player1' ? 'Pink' : 'Cyan'}`}
      />

      {/* Bonus / Extra Turn Banner */}
      {bonusTurnNotice && (
        <div className="w-full max-w-[340px] p-2 mb-2 rounded-xl text-center text-xs font-black bg-purple-500/20 border border-purple-400/50 text-purple-200 animate-bounce">
          {bonusTurnNotice}
        </div>
      )}

      {/* Score HUD */}
      <div className="flex items-center justify-between w-full max-w-[340px] px-4 py-2 mb-3 rounded-xl bg-gray-950/80 border border-gray-800 shadow-md">
        <div className={`flex items-center space-x-2 ${currentTurn === 'player1' && !gameOver ? 'text-pink-400 font-extrabold' : 'text-gray-400'}`}>
          <div className="w-3.5 h-3.5 rounded-sm bg-pink-500 shadow-[0_0_8px_#ec4899]" />
          <span className="text-xs">{mode === 'bot' ? 'You' : 'P1'}: {scores.p1} Pairs</span>
        </div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">CYBER PAIRS</div>
        <div className={`flex items-center space-x-2 ${currentTurn === 'player2' && !gameOver ? 'text-cyan-400 font-extrabold' : 'text-gray-400'}`}>
          <span className="text-xs">{mode === 'bot' ? 'Bot' : 'P2'}: {scores.p2} Pairs</span>
          <div className="w-3.5 h-3.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        </div>
      </div>

      {/* Banner */}
      {endMessage && (
        <div className={`w-full max-w-[340px] p-2.5 mb-3 rounded-xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === myRole
            ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/80 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* 4x4 Card Grid with 3D Hologram Cards */}
      <div className="relative w-full aspect-square max-w-[340px] bg-gray-950/95 rounded-2xl p-3 border-2 border-pink-500/30 shadow-2xl shadow-pink-950/50 grid grid-cols-4 grid-rows-4 gap-2.5">
        {cards.map(card => {
          const isFlipped = flippedIds.includes(card.id) || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || !isMyTurn || isBotThinking || gameOver || isLockedRef.current}
              className={`relative rounded-xl flex items-center justify-center transition-all duration-300 text-2xl sm:text-3xl select-none ${
                card.isMatched
                  ? card.matchedBy === 'player1'
                    ? 'bg-pink-950/30 border border-pink-500/40 opacity-60 cursor-default scale-95'
                    : 'bg-cyan-950/30 border border-cyan-400/40 opacity-60 cursor-default scale-95'
                  : isFlipped
                  ? 'bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-950 border-2 border-pink-400 shadow-neon-pink scale-95 cursor-default'
                  : isMyTurn && !gameOver && !isLockedRef.current
                  ? 'bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 hover:border-pink-500/60 cursor-pointer active:scale-90 hover:shadow-lg'
                  : 'bg-gray-900/60 border border-gray-800 cursor-not-allowed opacity-75'
              }`}
              style={{
                perspective: '1000px'
              }}
            >
              {isFlipped ? (
                <span className="animate-scale-in drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
                  {card.icon}
                </span>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-pink-400/60 font-black text-xs select-none">✦</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500/40 mt-0.5" />
                </div>
              )}

              {/* Matched Owner Tag */}
              {card.isMatched && (
                <div className={`absolute bottom-1 px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-tighter ${
                  card.matchedBy === 'player1' ? 'bg-pink-900/80 text-pink-300' : 'bg-cyan-900/80 text-cyan-300'
                }`}>
                  {card.matchedBy === myRole ? 'YOU' : 'OPP'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="purple"
        maxWidthClass="max-w-[340px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
