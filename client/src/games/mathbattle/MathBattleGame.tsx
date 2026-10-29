// client/src/games/mathbattle/MathBattleGame.tsx
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Calculator, Zap, Award, Flame, Trophy, Bot, CheckCircle2, XCircle } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

const generateProblem = (level: number = 1): MathProblem => {
  const ops = ['+', '-', '×'];
  if (level > 2) ops.push('÷');
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 0;
  let b = 0;
  let ans = 0;

  if (op === '+') {
    a = Math.floor(Math.random() * (20 * level)) + 5;
    b = Math.floor(Math.random() * (20 * level)) + 5;
    ans = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * (25 * level)) + 15;
    b = Math.floor(Math.random() * (a - 5)) + 3;
    ans = a - b;
  } else if (op === '×') {
    a = Math.floor(Math.random() * (10 + level * 2)) + 3;
    b = Math.floor(Math.random() * 9) + 2;
    ans = a * b;
  } else {
    b = Math.floor(Math.random() * 9) + 2;
    ans = Math.floor(Math.random() * 12) + 2;
    a = b * ans;
  }

  const optionsSet = new Set<number>([ans]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = ans + delta;
    if (candidate >= 0 && candidate !== ans) {
      optionsSet.add(candidate);
    }
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
  return {
    question: `${a} ${op} ${b}`,
    answer: ans,
    options
  };
};

interface MathBattleGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const MathBattleGame: React.FC<MathBattleGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateProblem(1));
  const [round, setRound] = useState<number>(1);
  const maxRounds = 10;
  const [timeLeft, setTimeLeft] = useState<number>(7);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [botScore, setBotScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const socket = getSocket();
  const roomId = multiplayerData?.roomId;
  const isMultiplayer = Boolean(roomId && mode !== 'bot');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameOver || isMultiplayer) return;
    const botDelay = Math.random() * 2500 + 1500;
    const botTimeout = setTimeout(() => {
      const isBotCorrect = Math.random() < 0.82;
      if (isBotCorrect) {
        setBotScore(prev => prev + 100);
      }
    }, botDelay);

    return () => clearTimeout(botTimeout);
  }, [round, gameOver, isMultiplayer]);

  useEffect(() => {
    if (gameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeOut();
          return 7;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [round, gameOver]);

  // Multiplayer sync listener
  useEffect(() => {
    if (!socket || !roomId) return;
    const handleAction = (data: any) => {
      if (data.type === 'MATH_NEW_ROUND') {
        setCurrentProblem(data.problem);
        setRound(data.round);
        setTimeLeft(7);
        setSelectedAns(null);
        setFeedback(null);
      } else if (data.type === 'MATH_SCORE_UPDATE') {
        if (data.sender !== (multiplayerData?.you?.name || 'You')) {
          setBotScore(data.score);
        }
      }
    };

    socket.on('game_action', handleAction);
    return () => {
      socket.off('game_action', handleAction);
    };
  }, [socket, roomId]);

  const handleTimeOut = () => {
    sound.play('loss');
    setStreak(0);
    advanceRound();
  };

  const advanceRound = () => {
    if (round >= maxRounds) {
      setGameOver(true);
      sound.play('win');
      confetti({ particleCount: 80, spread: 70 });
      recordGameResult(playerScore >= botScore ? 'win' : 'loss');
      return;
    }

    const nextRound = round + 1;
    const nextProb = generateProblem(Math.min(4, Math.floor(nextRound / 3) + 1));
    setRound(nextRound);
    setCurrentProblem(nextProb);
    setTimeLeft(7);
    setSelectedAns(null);
    setFeedback(null);

    if (isMultiplayer && socket && roomId && multiplayerData?.you?.role === 'player1') {
      socket.emit('game_action', {
        roomId,
        type: 'MATH_NEW_ROUND',
        round: nextRound,
        problem: nextProb
      });
    }
  };

  const handleSelect = (option: number) => {
    if (selectedAns !== null || gameOver) return;
    setSelectedAns(option);

    const isCorrect = option === currentProblem.answer;
    if (isCorrect) {
      sound.play('win');
      setFeedback('correct');
      const roundPoints = 100 + streak * 25 + timeLeft * 10;
      const newScore = playerScore + roundPoints;
      setPlayerScore(newScore);
      setStreak(prev => prev + 1);

      if (isMultiplayer && socket && roomId) {
        socket.emit('game_action', {
          roomId,
          type: 'MATH_SCORE_UPDATE',
          sender: multiplayerData?.you?.name || 'Player',
          score: newScore
        });
      }
    } else {
      sound.play('loss');
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      advanceRound();
    }, 900);
  };

  const restartGame = () => {
    setRound(1);
    setPlayerScore(0);
    setBotScore(0);
    setStreak(0);
    setGameOver(false);
    setTimeLeft(7);
    setSelectedAns(null);
    setFeedback(null);
    const prob = generateProblem(1);
    setCurrentProblem(prob);

    if (isMultiplayer && socket && roomId && multiplayerData?.you?.role === 'player1') {
      socket.emit('game_action', {
        roomId,
        type: 'MATH_NEW_ROUND',
        round: 1,
        problem: prob
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] p-4 text-white max-w-xl mx-auto select-none">
      {/* Header bar */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900/90 p-4 rounded-3xl border border-rose-500/30 backdrop-blur-md shadow-xl shadow-rose-950/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl">
            <Calculator className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300">
              Math Battle
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Round {round} / {maxRounds}</span>
              {streak > 1 && (
                <span className="flex items-center text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded-full text-[10px]">
                  <Flame className="w-3 h-3 mr-0.5 fill-amber-400" /> {streak}x Combo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Scores */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">You</span>
            <span className="text-xl font-black text-rose-400">{playerScore}</span>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider flex items-center gap-1">
              <Bot className="w-3 h-3 text-cyan-400" /> Rival
            </span>
            <span className="text-xl font-black text-cyan-400">{botScore}</span>
          </div>
        </div>
      </div>

      {/* Main Play Arena */}
      <div className="w-full relative bg-slate-950/90 rounded-3xl border border-rose-500/30 p-6 flex flex-col items-center shadow-2xl backdrop-blur-xl">
        {/* Timer Bar */}
        <div className="w-full bg-slate-900 rounded-full h-3 mb-6 overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft <= 2
                ? 'bg-red-500 animate-pulse'
                : timeLeft <= 4
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
            }`}
            style={{ width: `${(timeLeft / 7) * 100}%` }}
          />
        </div>

        {/* Problem Display */}
        <div className="py-8 px-12 bg-slate-900/90 rounded-3xl border border-slate-800/80 mb-8 w-full text-center shadow-inner relative overflow-hidden">
          <div className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Solve Fast!</div>
          <div className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            {currentProblem.question} = <span className="text-rose-400">?</span>
          </div>

          {feedback && (
            <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center gap-2 animate-fade-in backdrop-blur-sm">
              {feedback === 'correct' ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                  <span className="text-2xl font-black text-emerald-400">CORRECT!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-rose-500 animate-shake" />
                  <span className="text-2xl font-black text-rose-500">
                    WRONG! ({currentProblem.answer})
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 4 Multi-choice options */}
        <div className="grid grid-cols-2 gap-3.5 w-full">
          {currentProblem.options.map((opt, idx) => {
            let btnStyle = 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-800 hover:border-slate-700';
            if (selectedAns !== null) {
              if (opt === currentProblem.answer) {
                btnStyle = 'bg-emerald-600/90 text-white border-emerald-400 shadow-lg shadow-emerald-500/30';
              } else if (opt === selectedAns) {
                btnStyle = 'bg-rose-600/90 text-white border-rose-400 shadow-lg shadow-rose-500/30';
              } else {
                btnStyle = 'bg-slate-900/40 text-slate-600 border-slate-900';
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedAns !== null || gameOver}
                onClick={() => handleSelect(opt)}
                className={`py-5 px-6 rounded-2xl text-2xl font-black transition-all border-2 transform active:scale-95 shadow-md flex items-center justify-center ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/40 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-1">
              {playerScore >= botScore ? 'VICTORY!' : 'NICE TRY!'}
            </h3>
            <p className="text-slate-400 text-xs mb-4">Mental arithmetic showdown concluded</p>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6 flex justify-around">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Your Score</span>
                <span className="text-2xl font-black text-rose-400">{playerScore}</span>
              </div>
              <div className="w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Rival Score</span>
                <span className="text-2xl font-black text-cyan-400">{botScore}</span>
              </div>
            </div>

            <button
              onClick={restartGame}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 font-bold rounded-2xl shadow-lg shadow-rose-500/30 text-white transition-all active:scale-95 text-sm"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default MathBattleGame;
