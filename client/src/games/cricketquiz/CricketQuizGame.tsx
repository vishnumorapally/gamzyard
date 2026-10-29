// client/src/games/cricketquiz/CricketQuizGame.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  Activity,
  RotateCcw,
  Volume2,
  Users,
  Bot,
  HelpCircle,
  Timer,
  ChevronRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { CricketQuestion, getRandomQuestions } from './questions';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface CricketQuizGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const CricketQuizGame: React.FC<CricketQuizGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [questions, setQuestions] = useState<CricketQuestion[]>(() => getRandomQuestions(10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scoreP1, setScoreP1] = useState(0);
  const [wicketsP1, setWicketsP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [wicketsP2, setWicketsP2] = useState(0);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [lastShotOutcome, setLastShotOutcome] = useState<string | null>(null);
  const [commentaryLog, setCommentaryLog] = useState<string[]>([
    'Welcome to the Grand Indian Cricket Arena! Under floodlights at Wankhede!'
  ]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'p1' | 'p2' | 'tie' | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerRole: 'p1' | 'p2' = useMemo(() => {
    if (!isMultiplayer) return 'p1';
    return multiplayerData?.yourRole === 'player2' ? 'p2' : 'p1';
  }, [isMultiplayer, multiplayerData]);

  const currentQ = questions[currentIndex] || questions[0];

  // Helper to calculate runs based on time left
  const getRunsForTime = useCallback((secs: number) => {
    if (secs >= 11) return 6; // Quick blast = 6 runs
    if (secs >= 7) return 4;  // Sharp drive = 4 runs
    if (secs >= 3) return 2;  // Quick double = 2 runs
    return 1;                 // Scrambled single = 1 run
  }, []);

  // Timer tick
  useEffect(() => {
    if (gameOver || isAnswerLocked) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Timed out = Dot ball / Wicket risk
          handleAnswer(-1, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, isAnswerLocked, currentIndex]);

  // Bot response simulation in vs Bot mode
  useEffect(() => {
    if (mode !== 'bot' || gameOver || isAnswerLocked) return;

    // Determine accuracy based on bot difficulty
    const botAccuracy = botDifficulty === 'hard' ? 0.90 : botDifficulty === 'medium' ? 0.72 : 0.50;
    const isBotCorrect = Math.random() < botAccuracy;
    const delay = (botDifficulty === 'hard' ? 2 : botDifficulty === 'medium' ? 4 : 7) * 1000 + Math.random() * 2000;

    const botTimer = setTimeout(() => {
      if (gameOver) return;
      if (isBotCorrect) {
        const botRuns = Math.random() > 0.4 ? 6 : 4;
        setScoreP2(prev => prev + botRuns);
        setCommentaryLog(prev => [
          `🤖 Bot Captain connects cleanly! Scores +${botRuns} runs!`,
          ...prev.slice(0, 4)
        ]);
      } else {
        setWicketsP2(prev => Math.min(10, prev + 1));
        setCommentaryLog(prev => [
          `💥 Bowled him! Bot Captain misjudges the delivery and loses a wicket!`,
          ...prev.slice(0, 4)
        ]);
      }
    }, delay);

    return () => clearTimeout(botTimer);
  }, [mode, botDifficulty, currentIndex, isAnswerLocked, gameOver]);

  // Answer handler
  const handleAnswer = (optionIdx: number, isTimeout: boolean = false) => {
    if (isAnswerLocked || gameOver) return;
    setIsAnswerLocked(true);
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === currentQ.correctIndex;
    let earnedRuns = 0;
    let outcomeText = '';

    if (isTimeout) {
      outcomeText = '⏰ TIMED OUT! Dot ball! Umpire signals no run.';
      sound.play('loss');
    } else if (isCorrect) {
      earnedRuns = getRunsForTime(timeLeft);
      if (earnedRuns === 6) {
        outcomeText = '🚀 MAXIMUM! That is OUT OF THE STADIUM! 6 RUNS!';
        sound.play('win');
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      } else if (earnedRuns === 4) {
        outcomeText = '🏏 FOUR! Pierces the cover field with surgical precision!';
        sound.play('move');
      } else {
        outcomeText = `🏃 Quick running between the wickets! +${earnedRuns} runs!`;
        sound.play('move');
      }

      if (myPlayerRole === 'p1') {
        setScoreP1(prev => prev + earnedRuns);
      } else {
        setScoreP2(prev => prev + earnedRuns);
      }
    } else {
      outcomeText = '💥 WICKET! Clean bowled! Off stump is uprooted!';
      sound.play('loss');
      if (myPlayerRole === 'p1') {
        setWicketsP1(prev => Math.min(10, prev + 1));
      } else {
        setWicketsP2(prev => Math.min(10, prev + 1));
      }
    }

    setLastShotOutcome(outcomeText);
    setBallsBowled(prev => prev + 1);
    setCommentaryLog(prev => [outcomeText, ...prev.slice(0, 4)]);

    // Emit socket action if multiplayer
    if (isMultiplayer && multiplayerData?.roomId) {
      const socket = getSocket();
      socket.emit('game_action', {
        roomId: multiplayerData.roomId,
        action: 'quiz_answer',
        optionIdx,
        isCorrect,
        earnedRuns,
        role: myPlayerRole
      });
    }

    // Advance to next ball after brief celebration delay
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        finishMatch();
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswerLocked(false);
        setTimeLeft(15);
        setLastShotOutcome(null);
      }
    }, 2800);
  };

  // Multiplayer socket listener
  useEffect(() => {
    if (!isMultiplayer || !multiplayerData?.roomId) return;
    const socket = getSocket();

    const handleGameAction = (data: any) => {
      if (data.action === 'quiz_answer' && data.role !== myPlayerRole) {
        if (data.role === 'p1') {
          if (data.isCorrect) setScoreP1(prev => prev + data.earnedRuns);
          else setWicketsP1(prev => Math.min(10, prev + 1));
        } else {
          if (data.isCorrect) setScoreP2(prev => prev + data.earnedRuns);
          else setWicketsP2(prev => Math.min(10, prev + 1));
        }
        setCommentaryLog(prev => [
          `Opponent played: ${data.isCorrect ? `+${data.earnedRuns} runs!` : 'WICKET!'}`,
          ...prev.slice(0, 4)
        ]);
      }
    };

    const handleOpponentLeft = () => {
      setOpponentLeft(true);
      setGameOver(true);
      setWinner(myPlayerRole);
    };

    socket.on('game_action', handleGameAction);
    socket.on('opponent_left', handleOpponentLeft);

    return () => {
      socket.off('game_action', handleGameAction);
      socket.off('opponent_left', handleOpponentLeft);
    };
  }, [isMultiplayer, multiplayerData, myPlayerRole]);

  // Finish match logic
  const finishMatch = useCallback(() => {
    setGameOver(true);
    let finalWinner: 'p1' | 'p2' | 'tie' = 'tie';

    if (scoreP1 > scoreP2) finalWinner = 'p1';
    else if (scoreP2 > scoreP1) finalWinner = 'p2';
    else finalWinner = 'tie';

    setWinner(finalWinner);

    const isMyWin = finalWinner === myPlayerRole;
    if (isMyWin) {
      sound.play('win');
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 } });
    }

    recordGameResult(isMyWin ? 'win' : finalWinner === 'tie' ? 'draw' : 'loss');
  }, [scoreP1, scoreP2, myPlayerRole]);

  // Restart match
  const handleRematch = () => {
    setQuestions(getRandomQuestions(10));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setTimeLeft(15);
    setScoreP1(0);
    setWicketsP1(0);
    setScoreP2(0);
    setWicketsP2(0);
    setBallsBowled(0);
    setLastShotOutcome(null);
    setCommentaryLog(['New Innings! Pitch is hard and true! Play on!']);
    setGameOver(false);
    setWinner(null);
  };

  const p1Name = isMultiplayer ? (myPlayerRole === 'p1' ? 'You' : multiplayerData?.opponent?.name || 'Player 1') : 'You (Team India)';
  const p2Name = isMultiplayer ? (myPlayerRole === 'p2' ? 'You' : multiplayerData?.opponent?.name || 'Player 2') : `Bot (${botDifficulty})`;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      {/* Stadium Floodlight Ambient Header */}
      <div className="w-full flex flex-col items-center mb-3">
        {/* Stadium LED Scoreboard */}
        <div className="w-full bg-slate-950/95 border-2 border-emerald-500/40 rounded-2xl p-3 sm:p-4 shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black tracking-wider text-emerald-400 uppercase">
                Wankhede Stadium · Live Chase
              </span>
            </div>
            <div className="text-xs font-bold text-slate-400">
              Ball <span className="text-amber-400 font-mono font-bold text-sm">{currentIndex + 1}</span> of 10
            </div>
          </div>

          {/* Scores Clash */}
          <div className="grid grid-cols-2 gap-3 items-center">
            {/* Team 1 */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center transition-all ${
              myPlayerRole === 'p1' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                {myPlayerRole === 'p1' ? <Sparkles className="w-3 h-3 text-amber-400" /> : <Users className="w-3 h-3 text-slate-400" />}
                {p1Name}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {scoreP1}<span className="text-sm font-normal text-slate-400">/{wicketsP1}</span>
              </div>
            </div>

            {/* Team 2 */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center transition-all ${
              myPlayerRole === 'p2' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                {mode === 'bot' ? <Bot className="w-3 h-3 text-cyan-400" /> : <Users className="w-3 h-3 text-slate-400" />}
                {p2Name}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                {scoreP2}<span className="text-sm font-normal text-slate-400">/{wicketsP2}</span>
              </div>
            </div>
          </div>

          {/* Shot clock indicator */}
          <div className="w-full flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-amber-400" /> Shot Clock
              </span>
              <span className={`font-mono text-sm font-black ${
                timeLeft > 7 ? 'text-emerald-400' : timeLeft > 3 ? 'text-amber-400' : 'text-rose-400 animate-pulse'
              }`}>
                {timeLeft}s ({timeLeft >= 11 ? '🚀 6 Runs' : timeLeft >= 7 ? '🏏 4 Runs' : '🏃 2-1 Runs'})
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft > 7 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : timeLeft > 3 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Arena Card */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        {/* Category Pill */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold tracking-wide uppercase">
            🏏 {currentQ.category}
          </span>
          <span className="text-xs text-slate-400 capitalize">
            Level: <strong className="text-white">{currentQ.difficulty}</strong>
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-5">
          {currentQ.question}
        </h2>

        {/* 4 Interactive Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;
            let btnClass = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80';

            if (isAnswerLocked) {
              if (isCorrect) {
                btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
              } else if (isSelected && !isCorrect) {
                btnClass = 'bg-rose-950/80 border-rose-500 text-rose-200';
              } else {
                btnClass = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswerLocked}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-3.5 rounded-xl border text-left font-medium text-sm transition-all duration-200 flex items-center justify-between ${btnClass}`}
              >
                <span>{option}</span>
                {isAnswerLocked && isCorrect && <span className="text-emerald-400 font-bold text-xs">✓ SIX!</span>}
                {isAnswerLocked && isSelected && !isCorrect && <span className="text-rose-400 font-bold text-xs">✗ OUT</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation & Shot Outcome Banner */}
        {isAnswerLocked && (
          <div className="w-full bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 sm:p-4 mt-2 animate-fadeIn flex flex-col gap-1.5">
            <div className="text-xs font-black text-amber-400 tracking-wide uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {lastShotOutcome}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Live Commentary Feed */}
      <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 mt-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-400" /> Live Match Commentary
        </div>
        <div className="flex flex-col gap-1 text-xs font-mono text-slate-300">
          {commentaryLog.slice(0, 3).map((log, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-emerald-500 font-black">▶</span>
              <span className={index === 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Match Result Overlay Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-emerald-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {winner === myPlayerRole ? '🏆 MATCH VICTORY!' : winner === 'tie' ? '🤝 THRILLING TIE!' : 'MATCH CONCLUDED'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {winner === myPlayerRole
                  ? 'Incredible batting masterclass under the lights!'
                  : winner === 'tie'
                  ? 'A classic tied finish worthy of the history books!'
                  : 'Well fought out there in the middle! Great tournament spirit!'}
              </p>
            </div>

            {/* Final Match Stats */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-[11px] text-slate-400">{p1Name}</div>
                <div className="text-xl font-black text-emerald-400">{scoreP1}/{wicketsP1}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">{p2Name}</div>
                <div className="text-xl font-black text-cyan-400">{scoreP2}/{wicketsP2}</div>
              </div>
            </div>

            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              opponentLeft={opponentLeft}
              themeColor="emerald"
            />
          </div>
        </div>
      )}
    </div>
  );
};
