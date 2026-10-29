// client/src/games/whoknowsmebest/WhoKnowsMeBestGame.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Bot,
  Crown,
  Sparkles,
  Check,
  X,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { VIPQuestion, getRandomVIPQuestions } from './questions';
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

interface WhoKnowsMeBestGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const WhoKnowsMeBestGame: React.FC<WhoKnowsMeBestGameProps> = ({
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

    const botNames = ['Bramhi AI', 'Nani Bot', 'Anupama AI', 'Vijay Bot', 'Keerthy AI', 'Samantha Bot'];
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

  const [questions, setQuestions] = useState<VIPQuestion[]>(() => getRandomVIPQuestions(5));
  const [roundIdx, setRoundIdx] = useState(0);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [vipPlayerIdx, setVipPlayerIdx] = useState(0);
  const [vipAnswerIdx, setVipAnswerIdx] = useState<number | null>(null);
  const [playerGuesses, setPlayerGuesses] = useState<Record<string, number>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWaitingBots, setIsWaitingBots] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = questions[roundIdx] || questions[0];
  const vipPlayer = players[vipPlayerIdx] || players[0];
  const isVipMe = vipPlayer.id === myPlayerId;

  // Broadcast action helper
  const sendAction = (action: any) => {
    if (isMultiplayer && roomId) {
      const socket = getSocket();
      socket.emit('game_action', { roomId, action });
    }
  };

  // Host sync questions on mount in room mode
  useEffect(() => {
    if (isMultiplayer && isHost && roomId) {
      sendAction({
        type: 'SYNC_QUESTIONS',
        questions,
        roundIdx: 0,
        vipPlayerIdx: 0
      });
    }
  }, [isMultiplayer, isHost, roomId]);

  // Multiplayer action receiver
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();

    const handleAction = (payload: any) => {
      const action = payload?.action;
      if (!action) return;

      if (action.type === 'SYNC_QUESTIONS') {
        if (action.questions) setQuestions(action.questions);
        if (action.roundIdx !== undefined) setRoundIdx(action.roundIdx);
        if (action.vipPlayerIdx !== undefined) setVipPlayerIdx(action.vipPlayerIdx);
      } else if (action.type === 'VIP_LOCKED') {
        // VIP locked secret answer
        setVipAnswerIdx(action.secretIdx ?? null);
      } else if (action.type === 'SUBMIT_GUESS') {
        setPlayerGuesses(prev => ({ ...prev, [action.playerId]: action.guessIdx }));
      } else if (action.type === 'REVEAL_RESULTS') {
        setVipAnswerIdx(action.vipAnswerIdx);
        if (action.playerGuesses) setPlayerGuesses(action.playerGuesses);
        setIsRevealed(true);
        sound.play('win');

        // Apply scores
        setPlayers(prev =>
          prev.map(p => {
            const guess = action.playerGuesses?.[p.id];
            if (p.id !== action.vipPlayerId && guess === action.vipAnswerIdx) {
              return { ...p, score: p.score + 10 };
            }
            return p;
          })
        );
      } else if (action.type === 'NEXT_ROUND') {
        setRoundIdx(action.nextRoundIdx);
        setVipPlayerIdx(action.nextVipIdx);
        setVipAnswerIdx(null);
        setPlayerGuesses({});
        setIsRevealed(false);
      } else if (action.type === 'REMATCH') {
        setQuestions(action.questions || getRandomVIPQuestions(5));
        setRoundIdx(0);
        setVipPlayerIdx(0);
        setVipAnswerIdx(null);
        setPlayerGuesses({});
        setIsRevealed(false);
        setGameOver(false);
        setPlayers(initialPlayers);
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [isMultiplayer, initialPlayers]);

  // If VIP is a Bot, bot secretly locks in answer immediately
  useEffect(() => {
    if (vipPlayer.isBot && vipAnswerIdx === null && !gameOver) {
      const randomAns = Math.floor(Math.random() * currentQ.options.length);
      setVipAnswerIdx(randomAns);
    }
  }, [vipPlayer, vipAnswerIdx, currentQ, gameOver]);

  // VIP locks in secret answer
  const handleVipSelect = (optIdx: number) => {
    setVipAnswerIdx(optIdx);
    sound.play('click');

    if (isMultiplayer) {
      // In multiplayer, send VIP_LOCKED without revealing index to peers
      sendAction({ type: 'VIP_LOCKED', secretIdx: null });
    }

    // In bot mode: simulate other bots' guesses automatically!
    if (!isMultiplayer) {
      setIsWaitingBots(true);
      setTimeout(() => {
        const guesses: Record<string, number> = {};
        players.forEach(p => {
          if (p.id !== vipPlayer.id) {
            // 50% chance bot knows VIP best
            const guess = Math.random() > 0.4 ? optIdx : Math.floor(Math.random() * currentQ.options.length);
            guesses[p.id] = guess;
          }
        });
        setPlayerGuesses(guesses);
        setIsWaitingBots(false);
        setIsRevealed(true);
        sound.play('win');

        // Update scores
        setPlayers(prev =>
          prev.map(p => {
            if (p.id !== vipPlayer.id && guesses[p.id] === optIdx) {
              return { ...p, score: p.score + 10 };
            }
            return p;
          })
        );
      }, 1500);
    }
  };

  // Other players submit their guesses
  const handleGuessSelect = (optIdx: number) => {
    const updatedGuesses = { ...playerGuesses, [myPlayerId]: optIdx };
    setPlayerGuesses(updatedGuesses);
    sound.play('click');

    if (isMultiplayer) {
      sendAction({ type: 'SUBMIT_GUESS', playerId: myPlayerId, guessIdx: optIdx });
      return;
    }

    // Solo / Bot mode: simulate other bots' guesses
    players.forEach(p => {
      if (p.id !== vipPlayer.id && p.id !== myPlayerId && p.isBot) {
        const guess = Math.random() > 0.4 && vipAnswerIdx !== null
          ? vipAnswerIdx
          : Math.floor(Math.random() * currentQ.options.length);
        updatedGuesses[p.id] = guess;
      }
    });
    setPlayerGuesses(updatedGuesses);

    // Reveal after 1.2s
    setTimeout(() => {
      setIsRevealed(true);
      sound.play('win');

      setPlayers(prev =>
        prev.map(p => {
          if (p.id !== vipPlayer.id && updatedGuesses[p.id] === vipAnswerIdx) {
            return { ...p, score: p.score + 10 };
          }
          return p;
        })
      );
    }, 1200);
  };

  // Multiplayer VIP manual reveal trigger
  const handleMultiplayerReveal = () => {
    if (!isVipMe || vipAnswerIdx === null) return;
    setIsRevealed(true);
    sound.play('win');

    sendAction({
      type: 'REVEAL_RESULTS',
      vipAnswerIdx,
      vipPlayerId: myPlayerId,
      playerGuesses
    });

    setPlayers(prev =>
      prev.map(p => {
        if (p.id !== myPlayerId && playerGuesses[p.id] === vipAnswerIdx) {
          return { ...p, score: p.score + 10 };
        }
        return p;
      })
    );
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= questions.length) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 80, spread: 90 });
    } else {
      const nextRound = roundIdx + 1;
      const nextVip = (vipPlayerIdx + 1) % players.length;
      setRoundIdx(nextRound);
      setVipPlayerIdx(nextVip);
      setVipAnswerIdx(null);
      setPlayerGuesses({});
      setIsRevealed(false);

      if (isMultiplayer) {
        sendAction({
          type: 'NEXT_ROUND',
          nextRoundIdx: nextRound,
          nextVipIdx: nextVip
        });
      }
    }
  };

  const handleRematch = () => {
    const newQs = getRandomVIPQuestions(5);
    setQuestions(newQs);
    setRoundIdx(0);
    setVipPlayerIdx(0);
    setVipAnswerIdx(null);
    setPlayerGuesses({});
    setIsRevealed(false);
    setGameOver(false);
    setPlayers(initialPlayers);

    if (isMultiplayer) {
      sendAction({
        type: 'REMATCH',
        questions: newQs
      });
    }
  };

  const nonVipPlayers = players.filter(p => p.id !== vipPlayer.id);
  const totalGuessesCount = Object.keys(playerGuesses).length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wider text-amber-400 uppercase">
              Who Knows Me Best? · Round {roundIdx + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-black text-amber-300">
            VIP Star: {vipPlayer.name} {isVipMe && '(YOU)'}
          </div>
        </div>

        {/* Players Scoreboard */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p, idx) => {
            const isVIP = idx === vipPlayerIdx;
            const hasGuessed = playerGuesses[p.id] !== undefined;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                  isVIP
                    ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-400'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isVIP ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : hasGuessed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-white truncate">{p.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-amber-400">{p.score} pts</span>
              </div>
            );
          })}
        </div>

        {/* Question Area */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isVipMe ? 'You are the VIP! Secretly lock in your authentic choice:' : `Guess what ${vipPlayer.name} would choose:`}
          </div>
          <h2 className="text-base sm:text-xl font-bold text-white max-w-xl leading-relaxed">
            "{currentQ.question.replace('the VIP', vipPlayer.name)}"
          </h2>

          {/* Options */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {currentQ.options.map((opt, idx) => {
              const isVipPick = isRevealed && vipAnswerIdx === idx;
              const isMyGuess = playerGuesses[myPlayerId] === idx;

              let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-amber-500/50';
              if (isVipMe) {
                if (vipAnswerIdx === idx) {
                  btnStyle = 'bg-amber-950/90 border-amber-500 text-amber-200 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]';
                }
              } else {
                if (isRevealed) {
                  if (isVipPick) {
                    btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                  } else if (isMyGuess && !isVipPick) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                  }
                } else if (isMyGuess) {
                  btnStyle = 'bg-cyan-950/90 border-cyan-500 text-cyan-200 font-bold';
                }
              }

              const isButtonDisabled =
                isRevealed ||
                (isVipMe && vipAnswerIdx !== null) ||
                (!isVipMe && playerGuesses[myPlayerId] !== undefined);

              return (
                <button
                  key={idx}
                  disabled={isButtonDisabled}
                  onClick={() => (isVipMe ? handleVipSelect(idx) : handleGuessSelect(idx))}
                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between ${btnStyle} disabled:cursor-not-allowed`}
                >
                  <span>{opt}</span>
                  {isRevealed && isVipPick && (
                    <span className="text-emerald-400 font-black text-xs">✓ VIP Picked!</span>
                  )}
                  {isRevealed && isMyGuess && !isVipPick && (
                    <span className="text-rose-400 font-black text-xs">✗ Wrong</span>
                  )}
                  {isVipMe && vipAnswerIdx === idx && !isRevealed && (
                    <span className="text-amber-400 font-bold text-xs">🔒 Locked</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Waiting for friends status / Reveal Button */}
          {isWaitingBots && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 animate-pulse mt-2">
              <Clock className="w-4 h-4 animate-spin" />
              Friends are submitting their guesses...
            </div>
          )}

          {isMultiplayer && isVipMe && vipAnswerIdx !== null && !isRevealed && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <span className="text-xs text-slate-300">
                Guesses: {totalGuessesCount} / {nonVipPlayers.length} friends submitted
              </span>
              <button
                onClick={handleMultiplayerReveal}
                className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
              >
                Reveal VIP Secret 🔓
              </button>
            </div>
          )}

          {/* Next round button */}
          {isRevealed && (
            <button
              onClick={handleNextRound}
              className="mt-3 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
            >
              Next Round ▶
            </button>
          )}
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
