// client/src/games/handcricket/HandCricketGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, User, Bot, AlertCircle, Shield, Award } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { getHandCricketBotChoice } from './bot';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

const MAX_BALLS = 12; // 2 overs

interface HandCricketGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const HandCricketGame: React.FC<HandCricketGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  // Game phases: 'toss' | 'play'
  const [phase, setPhase] = useState<'toss' | 'play'>('toss');
  const [playerRole, setPlayerRole] = useState<'bat' | 'bowl'>('bat'); // Innings 1 role for user
  const [innings, setInnings] = useState<1 | 2>(1);

  // Score states
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [ballsBowled, setBallsBowled] = useState<number>(0);
  const [target, setTarget] = useState<number | null>(null);

  // Turn selections
  const [playerChoice, setPlayerChoice] = useState<number | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [lastEventText, setLastEventText] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  // Game over state
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const [playerHistory, setPlayerHistory] = useState<number[]>([]);
  const [botHistory, setBotHistory] = useState<number[]>([]);

  const myRole = multiplayerData?.yourRole || 'player1';

  // Current batter and bowler
  const isPlayerBatting = innings === 1 ? playerRole === 'bat' : playerRole === 'bowl';

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // Turn Timer Hook (15s per ball)
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && phase === 'play' && !isRevealed,
    isMyTurn: playerChoice === null,
    turnKey: `hc-${innings}-${ballsBowled}`,
    initialTime: 15,
    onTimeout: () => {
      if (!isRevealed && !gameOver && phase === 'play') {
        const randomNum = Math.floor(Math.random() * 6) + 1;
        handlePickNumber(randomNum);
      }
    }
  });

  const handleChooseToss = (chosenRole: 'bat' | 'bowl') => {
    sound.play('click');
    setPlayerRole(chosenRole);
    setPhase('play');

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { type: 'toss_choice', chosenRole },
        nextTurnState: {}
      });
    }
  };

  const handlePickNumber = useCallback((num: number) => {
    if (playerChoice !== null || isRevealed || gameOver || phase !== 'play') return;
    sound.play('click');
    setPlayerChoice(num);

    if (mode === 'bot') {
      setIsBotThinking(true);
      setTimeout(() => {
        setIsBotThinking(false);
        const botRole = isPlayerBatting ? 'bowl' : 'bat';
        const currentBatScore = isPlayerBatting ? p1Score : p2Score;
        const botPick = getHandCricketBotChoice(botRole, playerHistory, botHistory, currentBatScore, target, botDifficulty);
        setOpponentChoice(botPick);
        executeBall(num, botPick);
      }, 700);
    } else if (multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { type: 'ball_pick', ballIndex: ballsBowled, num },
        nextTurnState: {}
      });

      if (opponentChoice !== null) {
        executeBall(num, opponentChoice);
      }
    }
  }, [playerChoice, isRevealed, gameOver, phase, mode, isPlayerBatting, p1Score, p2Score, target, botDifficulty, playerHistory, botHistory, multiplayerData, ballsBowled, opponentChoice]);

  const executeBall = (pNum: number, oppNum: number) => {
    setIsRevealed(true);
    setPlayerHistory(prev => [...prev, pNum]);
    setBotHistory(prev => [...prev, oppNum]);

    const batterNum = isPlayerBatting ? pNum : oppNum;
    const bowlerNum = isPlayerBatting ? oppNum : pNum;
    const isOut = batterNum === bowlerNum;
    const nextBalls = ballsBowled + 1;
    setBallsBowled(nextBalls);

    let updatedP1 = p1Score;
    let updatedP2 = p2Score;

    if (isOut) {
      sound.play('capture');
      setLastEventText(`🎯 OUT! Wicket Falls on ${batterNum}!`);
    } else {
      sound.play('move');
      if (batterNum === 6) {
        setLastEventText(`🚀 MAXIMUM SIX! +6 Runs`);
      } else if (batterNum === 4) {
        setLastEventText(`💥 CRACKING FOUR! +4 Runs`);
      } else {
        setLastEventText(`🏏 +${batterNum} Run${batterNum > 1 ? 's' : ''}`);
      }

      if (isPlayerBatting) {
        updatedP1 = p1Score + batterNum;
        setP1Score(updatedP1);
      } else {
        updatedP2 = p2Score + batterNum;
        setP2Score(updatedP2);
      }
    }

    setTimeout(() => {
      // Innings 1 Completion Check
      if (innings === 1) {
        if (isOut || nextBalls >= MAX_BALLS) {
          // Switch to Innings 2
          const targetScore = (isPlayerBatting ? updatedP1 : updatedP2) + 1;
          setTarget(targetScore);
          setInnings(2);
          setBallsBowled(0);
          setPlayerChoice(null);
          setOpponentChoice(null);
          setIsRevealed(false);
          setLastEventText(`🏁 Innings 1 Closed! Target: ${targetScore} runs.`);
          return;
        }
      } else {
        // Innings 2 Match Finish Checks
        const chasingScore = isPlayerBatting ? updatedP1 : updatedP2;
        const defendedScore = isPlayerBatting ? updatedP2 : updatedP1;

        if (target !== null && chasingScore >= target) {
          // Chasing team won!
          setGameOver(true);
          const didIWin = isPlayerBatting;
          setWinner(didIWin ? 'player' : 'opponent');
          setEndMessage(didIWin ? `🏆 Victory! You chased down ${target} runs!` : `💀 Defeat! Opponent chased target!`);
          if (didIWin) { sound.play('win'); triggerConfetti(); recordGameResult('win'); }
          else { sound.play('loss'); recordGameResult('loss'); }
          return;
        }

        if (isOut || nextBalls >= MAX_BALLS) {
          // Innings 2 Ended
          setGameOver(true);
          if (updatedP1 > updatedP2) {
            setWinner('player');
            setEndMessage(`🏆 Victory! You won by ${updatedP1 - updatedP2} runs!`);
            sound.play('win'); triggerConfetti(); recordGameResult('win');
          } else if (updatedP2 > updatedP1) {
            setWinner('opponent');
            setEndMessage(`💀 Defeat! Opponent won by ${updatedP2 - updatedP1} runs!`);
            sound.play('loss'); recordGameResult('loss');
          } else {
            setWinner('draw');
            setEndMessage(`🤝 Tie Match! Both teams scored ${updatedP1} runs!`);
            recordGameResult('draw');
          }
          return;
        }
      }

      // Next ball in same innings
      setPlayerChoice(null);
      setOpponentChoice(null);
      setIsRevealed(false);
      setLastEventText(null);
    }, 2200);
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: any }) => {
      if (data.move.type === 'toss_choice') {
        // Opponent chose role, set inverse
        setPlayerRole(data.move.chosenRole === 'bat' ? 'bowl' : 'bat');
        setPhase('play');
      } else if (data.move.type === 'ball_pick') {
        setOpponentChoice(data.move.num);
        if (playerChoice !== null && !isRevealed) {
          executeBall(playerChoice, data.move.num);
        }
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner('player');
      setEndMessage(data.message || '🏆 Opponent left! You win by forfeit!');
      sound.play('win');
      triggerConfetti();
      recordGameResult('win');
    };

    const handleRematchStarted = () => {
      resetGame();
      sound.play('match');
    };

    socket.on('opponent_move', handleOpponentMove);
    socket.on('opponent_left', handleOpponentLeft);
    socket.on('rematch_started', handleRematchStarted);

    return () => {
      socket.off('opponent_move', handleOpponentMove);
      socket.off('opponent_left', handleOpponentLeft);
      socket.off('rematch_started', handleRematchStarted);
    };
  }, [mode, multiplayerData, playerChoice, isRevealed]);

  const resetGame = () => {
    setPhase('toss');
    setPlayerRole('bat');
    setInnings(1);
    setP1Score(0);
    setP2Score(0);
    setBallsBowled(0);
    setTarget(null);
    setPlayerChoice(null);
    setOpponentChoice(null);
    setIsRevealed(false);
    setLastEventText(null);
    setIsBotThinking(false);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
    setPlayerHistory([]);
    setBotHistory([]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={playerChoice === null && phase === 'play'}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Innings ${innings}/2 · ${isPlayerBatting ? 'You Batting 🏏' : 'You Bowling 🎯'}`}
      />

      {/* Cricket Stadium Scoreboard */}
      <div className="w-full max-w-[380px] mb-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-gray-950 via-[#0e172a] to-gray-950 border border-emerald-500/30 shadow-lg">
        {/* You Score */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              You {isPlayerBatting ? '🏏' : '🎯'}
            </div>
            <div className="text-xl font-black text-emerald-200 drop-shadow">
              {p1Score} <span className="text-[10px] font-bold text-gray-500">runs</span>
            </div>
          </div>
        </div>

        {/* Center Target & Overs */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300">
            {target !== null ? `TARGET: ${target}` : '1ST INNINGS'}
          </span>
          <div className="text-xs font-black text-white mt-0.5">
            Overs: {Math.floor(ballsBowled / 6)}.{ballsBowled % 6} / 2.0
          </div>
        </div>

        {/* Opponent Score */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              {mode === 'bot' ? 'Bot' : 'Opp'} {!isPlayerBatting ? '🏏' : '🎯'}
            </div>
            <div className="text-xl font-black text-cyan-200 drop-shadow">
              {p2Score} <span className="text-[10px] font-bold text-gray-500">runs</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            {mode === 'bot' ? <Bot className="w-4 h-4 text-cyan-300" /> : <User className="w-4 h-4 text-cyan-300" />}
          </div>
        </div>
      </div>

      {/* Toss Modal Screen */}
      {phase === 'toss' && !gameOver && (
        <div className="w-full max-w-[380px] p-5 rounded-3xl bg-gradient-to-b from-[#11241a] to-[#08120d] border-2 border-emerald-500/50 shadow-2xl flex flex-col items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-2xl animate-bounce">
            🏏
          </div>
          <div className="text-center">
            <h3 className="text-base font-black text-white">Toss Time!</h3>
            <p className="text-xs text-emerald-300/80">Choose your match strategy:</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => handleChooseToss('bat')}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm border border-emerald-400 shadow-neon-emerald active:scale-95 transition-all"
            >
              🏏 Bat First
            </button>
            <button
              onClick={() => handleChooseToss('bowl')}
              className="py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm border border-cyan-400 shadow-neon-cyan active:scale-95 transition-all"
            >
              🎯 Bowl First
            </button>
          </div>
        </div>
      )}

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[380px] p-2.5 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : winner === 'draw'
            ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Pitch Ball Arena */}
      {phase === 'play' && (
        <div className="w-full max-w-[380px] h-44 rounded-3xl bg-gradient-to-b from-[#0c1a14] via-[#08120d] to-[#040906] border-2 border-emerald-500/40 p-3 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl mb-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_75%)] pointer-events-none" />

          {/* Arena Header */}
          <div className="text-[9px] font-black tracking-widest uppercase text-emerald-400/80 z-10 flex items-center gap-1.5">
            <span>STADIUM PITCH</span>
            <span className="text-gray-500">•</span>
            <span>BALL {ballsBowled + 1} OF {MAX_BALLS}</span>
          </div>

          {/* The Two Numbers Faceoff */}
          <div className="flex items-center justify-center gap-8 w-full z-10">
            {/* You Number */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-lg transition-transform duration-300 ${
                isRevealed && playerChoice
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 scale-105 shadow-neon-emerald'
                  : playerChoice
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 animate-pulse'
                  : 'bg-gray-900/60 border-gray-800 text-gray-600'
              }`}>
                {isRevealed && playerChoice ? playerChoice : playerChoice ? '🔒' : '?'}
              </div>
              <span className="text-[10px] font-black text-emerald-300 uppercase">
                You ({isPlayerBatting ? 'Bat' : 'Bowl'})
              </span>
            </div>

            {/* VS Icon */}
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center shadow-lg">
              <span className="text-xs font-black text-emerald-300">VS</span>
            </div>

            {/* Opponent Number */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-lg transition-transform duration-300 ${
                isRevealed && opponentChoice
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 scale-105 shadow-neon-cyan'
                  : opponentChoice
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-gray-900/60 border-gray-800 text-gray-600'
              }`}>
                {isRevealed && opponentChoice ? opponentChoice : opponentChoice ? '🔒' : '?'}
              </div>
              <span className="text-[10px] font-black text-cyan-300 uppercase">
                {mode === 'bot' ? 'Bot' : 'Opp'} ({!isPlayerBatting ? 'Bat' : 'Bowl'})
              </span>
            </div>
          </div>

          {/* Event Result Toast */}
          <div className="z-10 min-h-[22px] text-center">
            {lastEventText ? (
              <span className="text-xs font-black text-amber-300 drop-shadow animate-bounce">
                {lastEventText}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-gray-400">
                {playerChoice ? 'Number Locked · Awaiting Opponent...' : 'Pick your score shot (1 - 6) below!'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 6 Interactive Number Keypad Buttons */}
      {phase === 'play' && (
        <div className="w-full max-w-[380px] grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map(num => {
            const isSelected = playerChoice === num;
            return (
              <button
                key={num}
                onClick={() => handlePickNumber(num)}
                disabled={playerChoice !== null || isRevealed || gameOver}
                className={`aspect-square rounded-2xl border-2 text-lg sm:text-xl font-black transition-all duration-200 active:scale-90 flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-300 text-black scale-105 shadow-[0_0_15px_rgba(16,185,129,0.8)] ring-2 ring-emerald-300'
                    : 'bg-gray-900/80 border-gray-800 text-gray-200 hover:border-emerald-400/80 hover:bg-emerald-950/40 cursor-pointer'
                }`}
              >
                <span>{num}</span>
                <span className="text-[9px] text-gray-400 font-bold -mt-1">
                  {num === 6 ? 'SIX' : num === 4 ? 'FOUR' : 'RUN'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Rematch Actions */}
      <RematchActions
        gameOver={gameOver}
        mode={mode}
        multiplayerData={multiplayerData}
        onReset={resetGame}
        onExit={onExit}
        themeColor="emerald"
        maxWidthClass="max-w-[380px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
