// client/src/games/truthordare/TruthOrDareGame.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCw,
  Trophy,
  Users,
  Bot,
  HelpCircle,
  Flame,
  Check,
  X,
  Timer,
  Film
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { PromptItem, getRandomPrompt } from './prompts';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface PartyPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
}

interface TruthOrDareGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const TruthOrDareGame: React.FC<TruthOrDareGameProps> = ({
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

  const initialPlayers: PartyPlayer[] = useMemo(() => {
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
    const list: PartyPlayer[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', isBot: false, score: 0 }
    ];

    const botNames = ['Bramhi Bot', 'Bunny AI', 'Mahesh AI', 'Pooja AI', 'Samantha AI', 'Prabhas AI', 'Nani Bot'];
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

  const [players, setPlayers] = useState<PartyPlayer[]>(initialPlayers);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bottleAngle, setBottleAngle] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [history, setHistory] = useState<string[]>([
    'Welcome to Truth or Dare Tollywood Edition! Spin the bottle to begin!'
  ]);

  const bottleAngleRef = useRef(bottleAngle);
  bottleAngleRef.current = bottleAngle;

  const activePlayer = selectedPlayerIdx !== null ? players[selectedPlayerIdx] : null;
  const isMyTurn = activePlayer && !activePlayer.isBot && (mode === 'bot' || activePlayer.id === myPlayerId);

  // Broadcast game actions in room mode
  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  // Listen for multiplayer actions
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SPIN_BOTTLE') {
        executeSpin(action.targetIdx, action.finalAngle, false);
      } else if (action.type === 'PICK_CHOICE') {
        setCurrentPrompt(action.prompt);
        sound.play('move');
        setHistory(prev => [
          `🎯 ${players[action.playerIdx]?.name || 'Player'} picked ${action.choiceType.toUpperCase()}!`,
          ...prev.slice(0, 4)
        ]);
      } else if (action.type === 'COMPLETE_PROMPT') {
        applyCompletePrompt(action.completed, action.targetIdx, false);
      } else if (action.type === 'REMATCH') {
        setPlayers(initialPlayers);
        setSelectedPlayerIdx(null);
        setCurrentPrompt(null);
        setRoundNumber(1);
        setGameOver(false);
        setBottleAngle(0);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, players, initialPlayers]);

  // Execute spin animation
  const executeSpin = (targetIdx: number, finalAngle: number, broadcast: boolean) => {
    setIsSpinning(true);
    setCurrentPrompt(null);
    sound.play('click');
    setBottleAngle(finalAngle);

    if (broadcast) {
      sendAction({ type: 'SPIN_BOTTLE', targetIdx, finalAngle });
    }

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPlayerIdx(targetIdx);
      sound.play('win');

      const chosen = players[targetIdx];
      setHistory(prev => [`🍾 Bottle landed on ${chosen.name}! Pick Truth or Dare!`, ...prev.slice(0, 4)]);

      // If bot chosen, automatically pick after brief delay
      if (chosen.isBot) {
        setTimeout(() => {
          const type = Math.random() > 0.5 ? 'truth' : 'dare';
          handlePickChoice(type, targetIdx);
        }, 1500);
      }
    }, 2800);
  };

  // Spin bottle trigger
  const spinBottle = () => {
    if (isSpinning || currentPrompt) return;

    const totalSpins = 4 + Math.floor(Math.random() * 3);
    const targetIdx = Math.floor(Math.random() * players.length);
    const sliceAngle = 360 / players.length;
    const targetDegrees = targetIdx * sliceAngle;

    // Exact modulo arithmetic so bottle tip lands PRECISELY on target player
    const currentMod = ((bottleAngleRef.current % 360) + 360) % 360;
    let diff = (targetDegrees - currentMod) % 360;
    if (diff < 0) diff += 360;
    const finalAngle = bottleAngleRef.current + totalSpins * 360 + diff;

    executeSpin(targetIdx, finalAngle, true);
  };

  // Choice pick
  const handlePickChoice = (type: 'truth' | 'dare', playerIdx: number) => {
    const prompt = getRandomPrompt(type);
    setCurrentPrompt(prompt);
    sound.play('move');

    const pName = players[playerIdx]?.name || 'Player';
    setHistory(prev => [
      `🎯 ${pName} picked ${type.toUpperCase()}!`,
      ...prev.slice(0, 4)
    ]);

    sendAction({ type: 'PICK_CHOICE', prompt, choiceType: type, playerIdx });

    // If bot, auto complete
    if (players[playerIdx]?.isBot) {
      setTimeout(() => {
        handleCompletePrompt(true, playerIdx);
      }, 3500);
    }
  };

  const applyCompletePrompt = (completed: boolean, targetIdx: number, broadcast: boolean) => {
    if (completed) {
      sound.play('win');
      confetti({ particleCount: 40, spread: 60 });
      setPlayers(prev =>
        prev.map((p, idx) => (idx === targetIdx ? { ...p, score: p.score + 10 } : p))
      );
      setHistory(prev => [
        `✅ ${players[targetIdx]?.name || 'Player'} completed the challenge! (+10 pts)`,
        ...prev.slice(0, 4)
      ]);
    } else {
      sound.play('loss');
      setHistory(prev => [
        `❌ ${players[targetIdx]?.name || 'Player'} chickened out!`,
        ...prev.slice(0, 4)
      ]);
    }

    if (broadcast) {
      sendAction({ type: 'COMPLETE_PROMPT', completed, targetIdx });
    }

    if (roundNumber >= 6) {
      setGameOver(true);
      recordGameResult('win');
    } else {
      setRoundNumber(prev => prev + 1);
      setCurrentPrompt(null);
      setSelectedPlayerIdx(null);
    }
  };

  // Complete or pass prompt
  const handleCompletePrompt = (completed: boolean, pIdx?: number) => {
    const targetIdx = pIdx !== undefined ? pIdx : selectedPlayerIdx;
    if (targetIdx === null) return;
    applyCompletePrompt(completed, targetIdx, true);
  };

  const handleRematch = () => {
    setPlayers(initialPlayers);
    setSelectedPlayerIdx(null);
    setCurrentPrompt(null);
    setRoundNumber(1);
    setGameOver(false);
    setBottleAngle(0);
    sendAction({ type: 'REMATCH' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      {/* Top Banner */}
      <div className="w-full bg-slate-950/95 border-2 border-pink-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(236,72,153,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-black tracking-wider text-pink-400 uppercase">
              Truth or Dare · Tollywood Edition (Round {roundNumber}/6)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {players.length} Players {isMultiplayer && '· Live Room'}
          </span>
        </div>

        {/* Circular Player Ring */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-800/80 pointer-events-none" />

          {/* Player avatars positioned in circular ring */}
          {players.map((p, idx) => {
            const angle = (idx * (360 / players.length) - 90) * (Math.PI / 180);
            const radius = 120; // px
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isSelected = selectedPlayerIdx === idx;

            return (
              <div
                key={p.id}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                className={`absolute p-1.5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center shadow-lg ${
                  isSelected
                    ? 'bg-pink-950/90 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.8)] scale-110 z-20 ring-2 ring-pink-400'
                    : 'bg-slate-900/80 border-slate-800 z-10'
                }`}
              >
                <div className="text-[10px] font-bold text-white truncate max-w-[70px] flex items-center gap-1">
                  {p.isBot ? <Bot className="w-2.5 h-2.5 text-cyan-400" /> : <Users className="w-2.5 h-2.5 text-amber-400" />}
                  {p.name}
                </div>
                <div className="text-[9px] font-mono font-bold text-pink-400">
                  {p.score} pts
                </div>
              </div>
            );
          })}

          {/* 3D Glass Spinning Bottle SVG with glowing tip pointer */}
          <div
            className="w-16 h-36 flex items-center justify-center transition-transform duration-[2800ms] ease-out pointer-events-none"
            style={{ transform: `rotate(${bottleAngle}deg)` }}
          >
            <svg viewBox="0 0 60 140" className="w-full h-full drop-shadow-[0_0_15px_rgba(236,72,153,0.7)]">
              {/* Arrow pointer at bottle cap */}
              <polygon points="30,0 23,8 37,8" fill="#f43f5e" />
              {/* Bottle Neck & Cap */}
              <rect x="25" y="8" width="10" height="15" rx="3" fill="#ec4899" />
              {/* Bottle Body */}
              <path d="M 25 23 Q 20 40 12 55 L 12 125 Q 12 135 30 135 Q 48 135 48 125 L 48 55 Q 40 40 35 23 Z" fill="#064e3b" stroke="#34d399" strokeWidth="2" opacity="0.9" />
              {/* Bottle Highlights */}
              <path d="M 16 58 L 16 120" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              {/* Label */}
              <rect x="15" y="65" width="30" height="40" rx="4" fill="#facc15" />
              <text x="30" y="88" fill="#713f12" fontSize="9" fontWeight="900" textAnchor="middle">SPIN</text>
            </svg>
          </div>
        </div>

        {/* Spin / Pick Controls */}
        <div className="w-full flex flex-col items-center gap-3">
          {!currentPrompt && (
            <button
              disabled={isSpinning}
              onClick={spinBottle}
              className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-200 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-[0_0_25px_rgba(236,72,153,0.5)] active:scale-95'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Spinning...' : 'Spin the Bottle 🍾'}
            </button>
          )}

          {/* Active Player Choice Buttons */}
          {selectedPlayerIdx !== null && !currentPrompt && (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <span className="text-xs text-slate-300 font-bold">
                {activePlayer?.name}'s Turn to Choose:
              </span>
              <div className="flex items-center gap-3">
                <button
                  disabled={!isMyTurn && !activePlayer?.isBot}
                  onClick={() => handlePickChoice('truth', selectedPlayerIdx)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95 disabled:opacity-50"
                >
                  TRUTH 💡
                </button>
                <button
                  disabled={!isMyTurn && !activePlayer?.isBot}
                  onClick={() => handlePickChoice('dare', selectedPlayerIdx)}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95 disabled:opacity-50"
                >
                  DARE 🔥
                </button>
              </div>
            </div>
          )}

          {/* Active Prompt Card */}
          {currentPrompt && (
            <div className="w-full max-w-lg bg-slate-900/90 border border-pink-500/50 rounded-2xl p-4 flex flex-col items-center text-center gap-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-pink-400">
                <Flame className="w-3.5 h-3.5" />
                {currentPrompt.type.toUpperCase()} · {currentPrompt.category}
              </div>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                "{currentPrompt.text}"
              </p>
              {currentPrompt.teluguMovieReference && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-full text-[11px] font-semibold text-pink-300">
                  <Film className="w-3 h-3" />
                  Tollywood Ref: {currentPrompt.teluguMovieReference}
                </div>
              )}

              {/* Action Resolution Buttons */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleCompletePrompt(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4" /> Completed (+10 pts)
                </button>
                <button
                  onClick={() => handleCompletePrompt(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 active:scale-95"
                >
                  <X className="w-4 h-4" /> Forfeit / Chickened Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Game Feed */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-1.5 mt-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Game Feed:
          </div>
          {history.map((msg, i) => (
            <div key={i} className="text-xs text-slate-300">
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Rematch Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-pink-500/60 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-pink-400 animate-bounce" />
            <h2 className="text-xl font-black text-white">Party Over!</h2>
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
