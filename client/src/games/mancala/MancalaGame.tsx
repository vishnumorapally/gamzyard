// client/src/games/mancala/MancalaGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Crown, Bot, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  MancalaBoard,
  P1_STORE,
  P2_STORE,
  P1_PITS,
  P2_PITS,
  createInitialMancalaBoard,
  sowMancalaStones,
  isMancalaGameOver,
  collectRemainingStones,
  getMancalaBotMove
} from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

// 6 gem color styles with 3D specular light & rich depth
const GEM_PALETTES = [
  {
    // Ruby
    bg: 'radial-gradient(circle at 35% 30%, #ff5c8a 0%, #e11d48 50%, #881337 100%)',
    border: '#fecdd3',
    shadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.6)'
  },
  {
    // Sapphire
    bg: 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 50%, #0c4a6e 100%)',
    border: '#bae6fd',
    shadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.6)'
  },
  {
    // Emerald
    bg: 'radial-gradient(circle at 35% 30%, #4ade80 0%, #16a34a 50%, #052e16 100%)',
    border: '#bbf7d0',
    shadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.6)'
  },
  {
    // Amethyst
    bg: 'radial-gradient(circle at 35% 30%, #c084fc 0%, #9333ea 50%, #3b0764 100%)',
    border: '#e9d5ff',
    shadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.6)'
  },
  {
    // Topaz / Amber
    bg: 'radial-gradient(circle at 35% 30%, #fde047 0%, #d97706 50%, #78350f 100%)',
    border: '#fef08a',
    shadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.6)'
  },
  {
    // Aquamarine
    bg: 'radial-gradient(circle at 35% 30%, #67e8f9 0%, #0891b2 50%, #164e63 100%)',
    border: '#a5f3fc',
    shadow: '0 2px 4px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.6)'
  }
];

// Single 3D Pebble Gemstone
const GemStone: React.FC<{
  gemIndex: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ gemIndex, size = 11, className = '', style = {} }) => {
  const palette = GEM_PALETTES[gemIndex % GEM_PALETTES.length];
  return (
    <div
      className={`relative inline-block rounded-full select-none pointer-events-none transition-transform ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: palette.bg,
        border: `1px solid ${palette.border}88`,
        boxShadow: palette.shadow,
        borderRadius: `${46 + (gemIndex % 7)}% ${54 - (gemIndex % 5)}% ${50 + (gemIndex % 6)}% ${50 - (gemIndex % 4)}%`,
        ...style
      }}
    >
      {/* Specular White Gloss Glint */}
      <div className="absolute top-[18%] left-[22%] w-[28%] h-[28%] rounded-full bg-white/80 blur-[0.3px]" />
    </div>
  );
};

// Deterministic natural cluster layout for gems in a pit bowl
const GemCluster: React.FC<{ count: number; maxVisible?: number }> = ({ count, maxVisible = 8 }) => {
  if (count <= 0) return null;

  const displayCount = Math.min(count, maxVisible);
  const extraCount = count - displayCount;

  // Pre-calculated organic scatter offsets (% from center: x, y, rotation)
  const OFFSETS: [number, number, number][] = [
    [0, 0, 15],
    [-24, -20, -25],
    [24, 18, 30],
    [-20, 22, 45],
    [22, -22, -15],
    [0, -28, 60],
    [-26, 0, -40],
    [26, -4, 20]
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      {Array.from({ length: displayCount }).map((_, i) => {
        const [x, y, rot] = OFFSETS[i % OFFSETS.length];
        return (
          <div
            key={i}
            className="absolute transition-transform duration-300"
            style={{
              transform: `translate(${x}%, ${y}%) rotate(${rot}deg)`
            }}
          >
            <GemStone gemIndex={i} size={11} />
          </div>
        );
      })}
      {extraCount > 0 && (
        <div className="absolute bottom-0 right-0 px-1 py-0.2 rounded-full text-[8px] font-black bg-amber-400 text-amber-950 shadow-md">
          +{extraCount}
        </div>
      )}
    </div>
  );
};

// Store Collection Vault (Kalah) with gems accumulating
const StoreVault: React.FC<{
  title: string;
  count: number;
  isLeader: boolean;
  isOwnerActive: boolean;
  avatarIcon: React.ReactNode;
  align: 'left' | 'right';
}> = ({ title, count, isLeader, isOwnerActive, avatarIcon, align }) => {
  const visibleGems = Math.min(count, 18);

  return (
    <div
      className={`relative w-16 sm:w-20 h-52 sm:h-64 rounded-2xl flex flex-col items-center justify-between p-2 select-none border-2 transition-all duration-300 ${
        isOwnerActive
          ? 'bg-gradient-to-b from-[#2a170e] via-[#1c0d06] to-[#120703] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
          : 'bg-gradient-to-b from-[#1c0d06] via-[#140803] to-[#0c0402] border-amber-900/50 shadow-inner'
      }`}
    >
      {/* Vault Crown Header */}
      <div className="flex flex-col items-center gap-0.5 w-full">
        <div className="flex items-center gap-1">
          {avatarIcon}
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            {title}
          </span>
          {isLeader && count > 0 && (
            <Crown className="w-3 h-3 text-amber-300 fill-amber-300 animate-bounce" />
          )}
        </div>
        <span className="text-[8px] font-bold tracking-widest text-amber-600/70 uppercase">
          Kalah Vault
        </span>
      </div>

      {/* Gem Score Tally Crest */}
      <div className="my-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border border-amber-500/40 shadow-md">
        <span className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_6px_rgba(251,191,36,0.5)]">
          {count}
        </span>
      </div>

      {/* Deep Recessed Vault Chamber with Accumulating Gemstones */}
      <div
        className="w-full flex-1 rounded-xl bg-gradient-to-b from-[#0a0402] to-[#150804] border border-amber-950/80 shadow-[inset_0_4px_10px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-wrap content-end justify-center p-1.5 gap-1"
        style={{
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.95), inset 0 -2px 6px rgba(245,158,11,0.1)'
        }}
      >
        {/* Subtle vault light ray */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/5 to-transparent pointer-events-none" />

        {Array.from({ length: visibleGems }).map((_, i) => (
          <GemStone
            key={i}
            gemIndex={i}
            size={10}
            className="animate-fade-in"
            style={{
              margin: '1px'
            }}
          />
        ))}

        {count === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
        )}
      </div>

      <div className="text-[9px] font-bold text-amber-600/70 mt-1">
        {align === 'left' ? '◀ Store' : 'Store ▶'}
      </div>
    </div>
  );
};

interface MancalaGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const MancalaGame: React.FC<MancalaGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [board, setBoard] = useState<MancalaBoard>(createInitialMancalaBoard);
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw' | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [bonusTurnNotice, setBonusTurnNotice] = useState<string | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [lastMovedPit, setLastMovedPit] = useState<number | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const myRole: 'player1' | 'player2' = useMemo(() => {
    if (mode === 'bot') return 'player1';
    return multiplayerData?.yourRole || 'player1';
  }, [mode, multiplayerData]);

  const isMyTurn = mode === 'bot'
    ? currentTurn === 'player1'
    : currentTurn === myRole;

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  const handlePitClick = useCallback((pitIndex: number) => {
    // Only my pits are clickable
    const myPits = myRole === 'player1' ? P1_PITS : P2_PITS;
    if (!myPits.includes(pitIndex) || board[pitIndex] === 0 || gameOver || !isMyTurn || isBotThinking) {
      return;
    }

    sound.play('click');
    setLastMovedPit(pitIndex);
    const { nextBoard, extraTurn, capturedCount } = sowMancalaStones(board, pitIndex, currentTurn);
    setBoard(nextBoard);
    setMoveCount(prev => prev + 1);

    if (capturedCount > 0) {
      sound.play('capture');
      setCaptureNotice(`⚔️ CAPTURE! +${capturedCount} gems seized!`);
      setTimeout(() => setCaptureNotice(null), 2500);
    } else {
      sound.play('move');
    }

    if (extraTurn) {
      setBonusTurnNotice('⚡ Free Extra Turn! Landed inside Kalah.');
      setTimeout(() => setBonusTurnNotice(null), 2500);
    }

    // Check game over
    if (isMancalaGameOver(nextBoard)) {
      const finalBoard = collectRemainingStones(nextBoard);
      setBoard(finalBoard);
      setGameOver(true);
      const p1 = finalBoard[P1_STORE];
      const p2 = finalBoard[P2_STORE];

      if (p1 > p2) {
        setWinner('player1');
        const isMe = myRole === 'player1';
        setEndMessage(isMe ? `🏆 Victory! You won ${p1} - ${p2}` : `💀 Defeat! Player 1 won ${p1} - ${p2}`);
        if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
        else { sound.play('loss'); recordGameResult('loss'); }
      } else if (p2 > p1) {
        setWinner('player2');
        const isMe = myRole === 'player2';
        setEndMessage(isMe ? `🏆 Victory! You won ${p2} - ${p1}` : `💀 Defeat! Player 2 won ${p2} - ${p1}`);
        if (isMe) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
        else { sound.play('loss'); recordGameResult('loss'); }
      } else {
        setWinner('draw');
        setEndMessage(`🤝 Tie at ${p1} - ${p2}!`);
        recordGameResult('draw');
      }

      if (mode !== 'bot' && multiplayerData) {
        const socket = getSocket();
        socket.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: { pitIndex, nextBoard: finalBoard },
          nextTurnState: { currentTurn }
        });
      }
      return;
    }

    const nextTurn = extraTurn ? currentTurn : (currentTurn === 'player1' ? 'player2' : 'player1');
    setCurrentTurn(nextTurn);

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { pitIndex, nextBoard },
        nextTurnState: { currentTurn: nextTurn }
      });
    }
  }, [board, gameOver, isMyTurn, isBotThinking, myRole, currentTurn, mode, multiplayerData]);

  // Bot Turn
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'player2' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        const pit = getMancalaBotMove(board, botDifficulty);
        if (pit !== null) {
          setLastMovedPit(pit);
          const { nextBoard, extraTurn, capturedCount } = sowMancalaStones(board, pit, 'player2');
          setBoard(nextBoard);
          setMoveCount(prev => prev + 1);

          if (capturedCount > 0) {
            sound.play('capture');
            setCaptureNotice(`⚔️ Bot captured ${capturedCount} gems!`);
            setTimeout(() => setCaptureNotice(null), 2500);
          } else {
            sound.play('move');
          }

          if (isMancalaGameOver(nextBoard)) {
            const finalBoard = collectRemainingStones(nextBoard);
            setBoard(finalBoard);
            setGameOver(true);
            const p1 = finalBoard[P1_STORE];
            const p2 = finalBoard[P2_STORE];
            if (p1 > p2) {
              setWinner('player1');
              setEndMessage(`🏆 Victory! You won ${p1} - ${p2}!`);
              sound.play('win'); triggerConfetti(); recordGameResult('win');
            } else if (p2 > p1) {
              setWinner('player2');
              setEndMessage(`💀 Defeat! Bot won ${p2} - ${p1}!`);
              sound.play('loss'); recordGameResult('loss');
            } else {
              setWinner('draw');
              setEndMessage(`🤝 Tie at ${p1} - ${p2}!`);
              recordGameResult('draw');
            }
          } else {
            if (!extraTurn) {
              setCurrentTurn('player1');
            } else {
              setBonusTurnNotice('🤖 Bot earned a free turn in Kalah!');
              setTimeout(() => setBonusTurnNotice(null), 2000);
            }
          }
        }
        setIsBotThinking(false);
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [mode, currentTurn, gameOver, board, botDifficulty]);

  // Turn Timer Hook
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver,
    isMyTurn,
    turnKey: `${moveCount}-${currentTurn}`,
    initialTime: 30,
    onTimeout: (timedOutUser) => {
      if (gameOver) return;
      setGameOver(true);
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

    const handleOpponentMove = (data: { move: { pitIndex: number; nextBoard: MancalaBoard }; nextTurnState: { currentTurn: 'player1' | 'player2' } }) => {
      setBoard(data.move.nextBoard);
      setLastMovedPit(data.move.pitIndex);
      setMoveCount(prev => prev + 1);
      sound.play('move');
      setCurrentTurn(data.nextTurnState.currentTurn);
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(myRole);
      setEndMessage(data.message || '🏆 Opponent exited the room. You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOver(true);
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
    };
  }, [mode, multiplayerData, myRole]);

  const resetGame = () => {
    setBoard(createInitialMancalaBoard());
    setCurrentTurn('player1');
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setMoveCount(0);
    setEndMessage(null);
    setBonusTurnNotice(null);
    setCaptureNotice(null);
    setLastMovedPit(null);
    setIsBotThinking(false);
  };

  const p1Score = board[P1_STORE];
  const p2Score = board[P2_STORE];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-2 sm:px-4 py-2 select-none">
      {/* 30s Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`You: ${myRole === 'player1' ? 'Bottom Row (Sow Right ▶)' : 'Top Row (Sow Left ◀)'}`}
      />

      {/* Bonus / Capture Alert Banners */}
      {bonusTurnNotice && (
        <div className="w-full max-w-[460px] p-2 mb-2 rounded-xl text-center text-xs font-black bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20 animate-bounce">
          {bonusTurnNotice}
        </div>
      )}

      {captureNotice && (
        <div className="w-full max-w-[460px] p-2 mb-2 rounded-xl text-center text-xs font-black bg-gradient-to-r from-emerald-500/20 via-emerald-400/30 to-emerald-500/20 border border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20 animate-pulse">
          {captureNotice}
        </div>
      )}

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[460px] p-2.5 mb-3 rounded-xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === myRole
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Sculpted Ancient Cyber-Relic Mancala Board */}
      <div className="relative w-full max-w-[470px] bg-gradient-to-b from-[#24130a] via-[#170a04] to-[#0c0402] border-4 border-[#854d0e]/70 rounded-3xl p-2.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(217,119,6,0.2)] flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Decorative Brass Corner Rivets */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-500/60 shadow-sm" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500/60 shadow-sm" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-amber-500/60 shadow-sm" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-amber-500/60 shadow-sm" />

        {/* Left Store: Player 2 (Bot / Opponent) */}
        <StoreVault
          title={mode === 'bot' ? 'Bot' : (myRole === 'player2' ? 'You' : 'P2')}
          count={p2Score}
          isLeader={p2Score > p1Score}
          isOwnerActive={currentTurn === 'player2'}
          avatarIcon={mode === 'bot' ? <Bot className="w-3.5 h-3.5 text-rose-400" /> : <User className="w-3.5 h-3.5 text-sky-400" />}
          align="left"
        />

        {/* Center: 2 Rows of 6 Sculpted Pit Bowls */}
        <div className="flex-1 flex flex-col justify-between h-52 sm:h-64 py-1 gap-1">
          {/* Top Row Header Label */}
          <div className="flex items-center justify-between px-1 text-[9px] font-black uppercase tracking-widest text-amber-500/70">
            <span>{mode === 'bot' ? 'Bot Pits' : 'Opponent Pits'}</span>
            <span className="flex items-center gap-1 text-[8px] text-amber-500/60">
              <ArrowLeft className="w-2.5 h-2.5" /> Sow Left
            </span>
          </div>

          {/* Top Row Pits (Player 2: [12, 11, 10, 9, 8, 7]) */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2">
            {[12, 11, 10, 9, 8, 7].map(pitIdx => {
              const isP2Clickable = myRole === 'player2' && isMyTurn && !gameOver && board[pitIdx] > 0;
              const isLastMoved = lastMovedPit === pitIdx;
              const stoneCount = board[pitIdx];

              return (
                <button
                  key={pitIdx}
                  onClick={() => handlePitClick(pitIdx)}
                  disabled={!isP2Clickable}
                  title={isP2Clickable ? `Sow ${stoneCount} stones` : undefined}
                  className={`relative aspect-square rounded-full transition-all duration-200 flex flex-col items-center justify-center p-0.5 ${
                    isP2Clickable
                      ? 'bg-gradient-to-b from-[#33180b] to-[#1f0e06] border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_14px_rgba(251,191,36,0.5)] hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer'
                      : isLastMoved
                      ? 'bg-gradient-to-b from-[#24130a] to-[#130703] border-2 border-amber-600/70 shadow-[0_0_10px_rgba(217,119,6,0.3)] opacity-90 cursor-default'
                      : 'bg-gradient-to-b from-[#1b0d06] to-[#0f0502] border-2 border-amber-950/70 opacity-80 cursor-default'
                  }`}
                  style={{
                    boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.92), inset 0 -2px 4px rgba(251,191,36,0.1), 0 2px 4px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Subtle pit depth shadow */}
                  <div className="absolute inset-1 rounded-full bg-black/40 pointer-events-none" />

                  {/* Seed Count Badge in glowing golden crest */}
                  <div className={`relative z-10 -top-1 px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs font-black ${
                    stoneCount > 0 ? 'text-amber-200 bg-black/60 shadow-sm' : 'text-neutral-600'
                  }`}>
                    {stoneCount}
                  </div>

                  {/* Natural Gemstone Cluster */}
                  <div className="relative z-0 w-6 sm:w-7 h-5 sm:h-6 -mt-1">
                    <GemCluster count={stoneCount} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center Runway: Flow Direction Runway & Active Turn Indicator */}
          <div className="flex items-center justify-between px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-800/30">
            {/* Top Row Flow Left Indicator */}
            <div className="flex items-center gap-0.5 text-amber-500/60 text-[9px] font-bold">
              <ArrowLeft className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline text-[8px] tracking-wider">FLOW</span>
            </div>

            {/* Turn Status Pill */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 border border-amber-500/40">
              <span className={`w-1.5 h-1.5 rounded-full ${
                isMyTurn ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
              }`} />
              <span className="text-[9px] sm:text-[10px] font-black text-amber-200 uppercase tracking-wider">
                {gameOver
                  ? 'Game Ended'
                  : isMyTurn
                  ? 'Your Turn'
                  : mode === 'bot'
                  ? 'Bot Thinking...'
                  : 'Opponent Turn'}
              </span>
            </div>

            {/* Bottom Row Flow Right Indicator */}
            <div className="flex items-center gap-0.5 text-amber-500/60 text-[9px] font-bold">
              <span className="hidden sm:inline text-[8px] tracking-wider">FLOW</span>
              <ArrowRight className="w-3 h-3 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Bottom Row Pits (Player 1: [0, 1, 2, 3, 4, 5]) */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2">
            {[0, 1, 2, 3, 4, 5].map(pitIdx => {
              const isP1Clickable = myRole === 'player1' && isMyTurn && !gameOver && board[pitIdx] > 0;
              const isLastMoved = lastMovedPit === pitIdx;
              const stoneCount = board[pitIdx];

              return (
                <button
                  key={pitIdx}
                  onClick={() => handlePitClick(pitIdx)}
                  disabled={!isP1Clickable}
                  title={isP1Clickable ? `Sow ${stoneCount} stones` : undefined}
                  className={`relative aspect-square rounded-full transition-all duration-200 flex flex-col items-center justify-center p-0.5 ${
                    isP1Clickable
                      ? 'bg-gradient-to-b from-[#33180b] to-[#1f0e06] border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_14px_rgba(251,191,36,0.5)] hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer'
                      : isLastMoved
                      ? 'bg-gradient-to-b from-[#24130a] to-[#130703] border-2 border-amber-600/70 shadow-[0_0_10px_rgba(217,119,6,0.3)] opacity-90 cursor-default'
                      : 'bg-gradient-to-b from-[#1b0d06] to-[#0f0502] border-2 border-amber-950/70 opacity-80 cursor-default'
                  }`}
                  style={{
                    boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.92), inset 0 -2px 4px rgba(251,191,36,0.1), 0 2px 4px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Subtle pit depth shadow */}
                  <div className="absolute inset-1 rounded-full bg-black/40 pointer-events-none" />

                  {/* Seed Count Badge in glowing golden crest */}
                  <div className={`relative z-10 -top-1 px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs font-black ${
                    stoneCount > 0 ? 'text-amber-200 bg-black/60 shadow-sm' : 'text-neutral-600'
                  }`}>
                    {stoneCount}
                  </div>

                  {/* Natural Gemstone Cluster */}
                  <div className="relative z-0 w-6 sm:w-7 h-5 sm:h-6 -mt-1">
                    <GemCluster count={stoneCount} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Row Footer Label */}
          <div className="flex items-center justify-between px-1 text-[9px] font-black uppercase tracking-widest text-amber-500/70">
            <span>{mode === 'bot' ? 'Your Pits' : (myRole === 'player1' ? 'Your Pits' : 'P1 Pits')}</span>
            <span className="flex items-center gap-1 text-[8px] text-amber-500/60">
              Sow Right <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Right Store: Player 1 (You) */}
        <StoreVault
          title={mode === 'bot' ? 'You' : (myRole === 'player1' ? 'You' : 'P1')}
          count={p1Score}
          isLeader={p1Score > p2Score}
          isOwnerActive={currentTurn === 'player1'}
          avatarIcon={<User className="w-3.5 h-3.5 text-emerald-400" />}
          align="right"
        />
      </div>

      {/* Rules & Game Strategy Quick Note */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold text-amber-500/70 bg-amber-950/30 border border-amber-900/40 px-3 py-1 rounded-full max-w-[420px] text-center">
        <span>🏺 Sowing: Land last stone in Kalah for an extra turn · Land in empty pit to capture</span>
      </div>

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="amber"
        maxWidthClass="max-w-[460px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
