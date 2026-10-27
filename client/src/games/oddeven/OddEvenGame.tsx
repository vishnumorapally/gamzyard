// client/src/games/oddeven/OddEvenGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { User, Bot, Trophy, Sparkles } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

type Parity = 'odd' | 'even';
const WIN_TARGET = 3;

interface OddEvenGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const OddEvenGame: React.FC<OddEvenGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [phase, setPhase] = useState<'call' | 'clash'>('call');
  const [myCall, setMyCall] = useState<Parity>('odd');
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [playerNum, setPlayerNum] = useState<number | null>(null);
  const [opponentNum, setOpponentNum] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [clashResultText, setClashResultText] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const myRole = multiplayerData?.yourRole || 'player1';
  const oppCall: Parity = myCall === 'odd' ? 'even' : 'odd';

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // 12s per round timer
  const { timeLeft, percent } = useTurnTimer({
    isActive: !gameOver && phase === 'clash' && !isRevealed,
    isMyTurn: playerNum === null,
    turnKey: `oddeven-round-${roundNumber}`,
    initialTime: 12,
    onTimeout: () => {
      if (phase === 'clash' && !isRevealed && !gameOver) {
        handlePickNumber(Math.floor(Math.random() * 5) + 1);
      }
    }
  });

  const handleSelectCall = (call: Parity) => {
    sound.play('click');
    setMyCall(call);
    setPhase('clash');

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { type: 'choose_call', call },
        nextTurnState: {}
      });
    }
  };

  const handlePickNumber = useCallback((num: number) => {
    if (playerNum !== null || isRevealed || gameOver || phase !== 'clash') return;
    sound.play('click');
    setPlayerNum(num);

    if (mode === 'bot') {
      setIsBotThinking(true);
      setTimeout(() => {
        setIsBotThinking(false);
        const botNum = Math.floor(Math.random() * 5) + 1;
        setOpponentNum(botNum);
        executeClash(num, botNum);
      }, 700);
    } else if (multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { type: 'throw_num', round: roundNumber, num },
        nextTurnState: {}
      });

      if (opponentNum !== null) {
        executeClash(num, opponentNum);
      }
    }
  }, [playerNum, isRevealed, gameOver, phase, mode, multiplayerData, roundNumber, opponentNum]);

  const executeClash = (pNum: number, oppNum: number) => {
    setIsRevealed(true);
    const sum = pNum + oppNum;
    const isSumOdd = sum % 2 === 1;
    const outcomeParity: Parity = isSumOdd ? 'odd' : 'even';

    const pWon = outcomeParity === myCall;

    let newP = playerScore;
    let newO = opponentScore;

    if (pWon) {
      newP = playerScore + 1;
      setPlayerScore(newP);
      sound.play('capture');
      setClashResultText(`✨ ${pNum} + ${oppNum} = ${sum} (${outcomeParity.toUpperCase()})! You Scored!`);
    } else {
      newO = opponentScore + 1;
      setOpponentScore(newO);
      sound.play('move');
      setClashResultText(`💀 ${pNum} + ${oppNum} = ${sum} (${outcomeParity.toUpperCase()})! Opponent Scored!`);
    }

    setTimeout(() => {
      if (newP >= WIN_TARGET) {
        setGameOver(true);
        setWinner('player');
        setEndMessage(`🏆 VICTORY! First to 3 Points (${newP} - ${newO})`);
        sound.play('win'); triggerConfetti(); recordGameResult('win');
      } else if (newO >= WIN_TARGET) {
        setGameOver(true);
        setWinner('opponent');
        setEndMessage(`💀 DEFEAT! Opponent reached 3 Points (${newO} - ${newP})`);
        sound.play('loss'); recordGameResult('loss');
      } else {
        setRoundNumber(prev => prev + 1);
        setPlayerNum(null);
        setOpponentNum(null);
        setIsRevealed(false);
        setClashResultText(null);
      }
    }, 2400);
  };

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: any }) => {
      if (data.move.type === 'choose_call') {
        setMyCall(data.move.call === 'odd' ? 'even' : 'odd');
        setPhase('clash');
      } else if (data.move.type === 'throw_num') {
        setOpponentNum(data.move.num);
        if (playerNum !== null && !isRevealed) {
          executeClash(playerNum, data.move.num);
        }
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner('player');
      setEndMessage(data.message || '🏆 Opponent left! You win by forfeit!');
      sound.play('win'); triggerConfetti(); recordGameResult('win');
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
  }, [mode, multiplayerData, playerNum, isRevealed]);

  const resetGame = () => {
    setPhase('call');
    setMyCall('odd');
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundNumber(1);
    setPlayerNum(null);
    setOpponentNum(null);
    setIsRevealed(false);
    setClashResultText(null);
    setIsBotThinking(false);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={playerNum === null && phase === 'clash'}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Round ${roundNumber} · You are ${myCall.toUpperCase()} · First to 3`}
      />

      {/* Cyber Score Crest */}
      <div className="w-full max-w-[360px] mb-3 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-950 via-[#10142b] to-gray-950 border border-cyan-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              You ({myCall.toUpperCase()})
            </div>
            <div className="text-xl font-black text-cyan-200 drop-shadow">{playerScore} <span className="text-[10px] text-gray-500">/ 3</span></div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
            PARITY DUEL
          </span>
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < playerScore ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-gray-800'
                }`}
              />
            ))}
            <span className="text-gray-600 text-[10px]">•</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < opponentScore ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">
              {mode === 'bot' ? 'Bot' : 'Opp'} ({oppCall.toUpperCase()})
            </div>
            <div className="text-xl font-black text-purple-200 drop-shadow">{opponentScore} <span className="text-[10px] text-gray-500">/ 3</span></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center">
            {mode === 'bot' ? <Bot className="w-4 h-4 text-purple-300" /> : <User className="w-4 h-4 text-purple-300" />}
          </div>
        </div>
      </div>

      {/* Parity Call Choice Modal */}
      {phase === 'call' && !gameOver && (
        <div className="w-full max-w-[360px] p-5 rounded-3xl bg-gradient-to-b from-[#10142b] to-[#070918] border-2 border-cyan-500/50 shadow-2xl flex flex-col items-center gap-4 mb-3">
          <div className="text-center">
            <h3 className="text-base font-black text-white">Choose Your Parity</h3>
            <p className="text-xs text-cyan-300/80">Sum of both hands decides the winner:</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => handleSelectCall('odd')}
              className="py-3.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm border border-cyan-400 shadow-neon-cyan active:scale-95 transition-all"
            >
              ⚡ Call ODD
            </button>
            <button
              onClick={() => handleSelectCall('even')}
              className="py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm border border-purple-400 shadow-neon-purple active:scale-95 transition-all"
            >
              🔮 Call EVEN
            </button>
          </div>
        </div>
      )}

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[360px] p-2.5 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === 'player'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Clash Arena */}
      {phase === 'clash' && (
        <div className="w-full max-w-[360px] h-44 rounded-3xl bg-gradient-to-b from-[#0f1226] via-[#090b17] to-[#05060d] border-2 border-cyan-500/40 p-3 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl mb-4">
          <div className="text-[9px] font-black tracking-widest uppercase text-cyan-400/80 z-10">
            FINGER SUM ARENA
          </div>

          {/* Two Hands Display */}
          <div className="flex items-center justify-center gap-8 w-full z-10">
            {/* Player Hand */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-lg transition-transform duration-300 ${
                isRevealed && playerNum
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 scale-105 shadow-neon-cyan'
                  : playerNum
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-gray-900/60 border-gray-800 text-gray-600'
              }`}>
                {isRevealed && playerNum ? playerNum : playerNum ? '🔒' : '?'}
              </div>
              <span className="text-[10px] font-black text-cyan-300 uppercase">You</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/60 flex items-center justify-center shadow-lg">
              <span className="text-xs font-black text-cyan-300">+</span>
            </div>

            {/* Opponent Hand */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-lg transition-transform duration-300 ${
                isRevealed && opponentNum
                  ? 'bg-purple-950/90 border-purple-400 text-purple-300 scale-105 shadow-neon-purple'
                  : opponentNum
                  ? 'bg-purple-950/80 border-purple-400 text-purple-300 animate-pulse'
                  : 'bg-gray-900/60 border-gray-800 text-gray-600'
              }`}>
                {isRevealed && opponentNum ? opponentNum : opponentNum ? '🔒' : '?'}
              </div>
              <span className="text-[10px] font-black text-purple-300 uppercase">
                {mode === 'bot' ? 'Bot' : 'Opp'}
              </span>
            </div>
          </div>

          <div className="z-10 min-h-[20px] text-center px-2">
            {clashResultText ? (
              <span className="text-xs font-black text-amber-300 drop-shadow animate-bounce">
                {clashResultText}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-gray-400">
                {playerNum ? 'Number Locked · Awaiting Opponent...' : 'Throw 1 to 5 fingers below!'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 5 Finger Number Choice Buttons */}
      {phase === 'clash' && (
        <div className="w-full max-w-[360px] grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(num => {
            const isSelected = playerNum === num;
            return (
              <button
                key={num}
                onClick={() => handlePickNumber(num)}
                disabled={playerNum !== null || isRevealed || gameOver}
                className={`aspect-square rounded-2xl border-2 text-xl font-black transition-all duration-200 active:scale-90 flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-cyan-500 border-cyan-300 text-black scale-105 shadow-neon-cyan ring-2 ring-cyan-300'
                    : 'bg-gray-900/80 border-gray-800 text-gray-200 hover:border-cyan-400/80 hover:bg-cyan-950/40 cursor-pointer'
                }`}
              >
                <span>{num}</span>
                <span className="text-[9px] text-gray-400 font-bold -mt-0.5">
                  {num === 1 ? '👆' : num === 2 ? '✌️' : num === 3 ? '🤟' : num === 4 ? '🖖' : '🖐️'}
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
        themeColor="cyan"
        maxWidthClass="max-w-[360px]"
        opponentLeft={opponentLeft}
      />
    </div>
  );
};
