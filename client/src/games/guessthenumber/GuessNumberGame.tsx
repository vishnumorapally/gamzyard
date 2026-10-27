// client/src/games/guessthenumber/GuessNumberGame.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Target, Flame, Snowflake, User, Bot, CornerDownLeft, Delete } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface GuessLog {
  guesser: 'you' | 'opponent';
  guess: number;
  hint: 'higher' | 'lower' | 'correct';
}

interface GuessNumberGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const GuessNumberGame: React.FC<GuessNumberGameProps> = ({
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [secretNumber, setSecretNumber] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [minBound, setMinBound] = useState<number>(1);
  const [maxBound, setMaxBound] = useState<number>(100);
  const [inputVal, setInputVal] = useState<string>('');
  const [guessHistory, setGuessHistory] = useState<GuessLog[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  const myRole: 'player1' | 'player2' = useMemo(() => {
    if (mode === 'bot') return 'player1';
    return multiplayerData?.yourRole || 'player1';
  }, [mode, multiplayerData]);

  const isMyTurn = mode === 'bot' ? currentTurn === 'player1' : currentTurn === myRole;

  const triggerConfetti = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
  };

  // 30s Turn Timer
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
        setEndMessage(`⏰ 30s Time Expired! The secret number was ${secretNumber}.`);
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

  const handleKeyPress = (digit: string) => {
    if (!isMyTurn || isBotThinking || gameOver) return;
    sound.play('click');
    if (inputVal.length < 3) {
      setInputVal(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    if (!isMyTurn || isBotThinking || gameOver) return;
    sound.play('click');
    setInputVal(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (!isMyTurn || isBotThinking || gameOver) return;
    sound.play('click');
    setInputVal('');
  };

  const handleSubmitGuess = () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val) || val < minBound || val > maxBound || !isMyTurn || isBotThinking || gameOver) return;
    setInputVal('');
    executeGuess(val, currentTurn);
  };

  const executeGuess = useCallback((guess: number, player: 'player1' | 'player2') => {
    const isMe = player === myRole;
    setMoveCount(prev => prev + 1);

    if (guess === secretNumber) {
      // WINNER!
      sound.play('win');
      setGameOver(true);
      setWinner(player);
      setEndMessage(isMe ? `🎉 BINGO! You guessed ${secretNumber} and won!` : `💀 Opponent cracked ${secretNumber}!`);
      if (isMe) { triggerConfetti(); recordGameResult('win'); }
      else { sound.play('loss'); recordGameResult('loss'); }

      setGuessHistory(prev => [
        { guesser: isMe ? 'you' : 'opponent', guess, hint: 'correct' },
        ...prev
      ]);

      if (mode !== 'bot' && multiplayerData) {
        const socket = getSocket();
        socket.emit('make_move', {
          roomId: multiplayerData.roomId,
          move: { guess, isCorrect: true, secretNumber },
          nextTurnState: {}
        });
      }
      return;
    }

    sound.play('move');
    const isHigher = guess < secretNumber; // secret is higher
    const hint: 'higher' | 'lower' = isHigher ? 'higher' : 'lower';

    if (isHigher) {
      setMinBound(prev => Math.max(prev, guess + 1));
    } else {
      setMaxBound(prev => Math.min(prev, guess - 1));
    }

    setGuessHistory(prev => [
      { guesser: isMe ? 'you' : 'opponent', guess, hint },
      ...prev
    ]);

    const nextTurn = player === 'player1' ? 'player2' : 'player1';
    setCurrentTurn(nextTurn);

    if (mode !== 'bot' && multiplayerData) {
      const socket = getSocket();
      socket.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { guess, isCorrect: false, minBound: isHigher ? guess + 1 : minBound, maxBound: !isHigher ? guess - 1 : maxBound },
        nextTurnState: { currentTurn: nextTurn }
      });
    }
  }, [secretNumber, myRole, minBound, maxBound, mode, multiplayerData]);

  // Bot Turn Logic
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'player2' && !gameOver) {
      setIsBotThinking(true);
      const timer = setTimeout(() => {
        let botGuess = 50;
        if (botDifficulty === 'easy') {
          botGuess = Math.floor(Math.random() * (maxBound - minBound + 1)) + minBound;
        } else if (botDifficulty === 'medium') {
          // Midpoint with slight noise
          const mid = Math.floor((minBound + maxBound) / 2);
          const noise = Math.floor(Math.random() * 5) - 2;
          botGuess = Math.max(minBound, Math.min(maxBound, mid + noise));
        } else {
          // Hard: exact midpoint binary search or correct if range is small
          if (maxBound - minBound <= 2 || Math.random() < 0.25) {
            botGuess = secretNumber;
          } else {
            botGuess = Math.floor((minBound + maxBound) / 2);
          }
        }
        executeGuess(botGuess, 'player2');
        setIsBotThinking(false);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [mode, currentTurn, gameOver, minBound, maxBound, botDifficulty, secretNumber, executeGuess]);

  // Multiplayer Listeners
  useEffect(() => {
    if (mode === 'bot' || !multiplayerData) return;
    const socket = getSocket();

    const handleOpponentMove = (data: { move: any; nextTurnState: any }) => {
      if (data.move.isCorrect) {
        setGameOver(true);
        const opp = myRole === 'player1' ? 'player2' : 'player1';
        setWinner(opp);
        setEndMessage(`💀 Opponent guessed ${data.move.secretNumber}!`);
        sound.play('loss');
        recordGameResult('loss');
      } else {
        setMoveCount(prev => prev + 1);
        sound.play('move');
        if (data.move.minBound) setMinBound(data.move.minBound);
        if (data.move.maxBound) setMaxBound(data.move.maxBound);
        setGuessHistory(prev => [
          { guesser: 'opponent', guess: data.move.guess, hint: data.move.guess < secretNumber ? 'higher' : 'lower' },
          ...prev
        ]);
        setCurrentTurn(data.nextTurnState.currentTurn);
      }
    };

    const handleOpponentLeft = (data: { message?: string }) => {
      setGameOver(true);
      setOpponentLeft(true);
      setWinner(myRole);
      setEndMessage(data.message || '🏆 Opponent left! You win by forfeit!');
      sound.play('win'); triggerConfetti(); recordGameResult('win');
    };

    const handlePlayerTimedOut = (data: { timedOutPlayerId: string }) => {
      setGameOver(true);
      const iWon = data.timedOutPlayerId !== multiplayerData.you.socketId;
      setWinner(iWon ? myRole : (myRole === 'player1' ? 'player2' : 'player1'));
      setEndMessage(iWon ? `🏆 Opponent ran out of time! Secret was ${secretNumber}.` : '⏰ Time expired! 30s limit reached.');
      if (iWon) {
        sound.play('win'); triggerConfetti(); recordGameResult('win');
      } else {
        sound.play('loss'); recordGameResult('loss');
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
  }, [mode, multiplayerData, myRole, secretNumber]);

  const resetGame = () => {
    setSecretNumber(Math.floor(Math.random() * 100) + 1);
    setMinBound(1);
    setMaxBound(100);
    setInputVal('');
    setGuessHistory([]);
    setCurrentTurn('player1');
    setMoveCount(0);
    setGameOver(false);
    setOpponentLeft(false);
    setWinner(null);
    setEndMessage(null);
    setIsBotThinking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Turn Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        percent={percent}
        isMyTurn={isMyTurn}
        isBotThinking={isBotThinking}
        gameOver={gameOver}
        statusText={`Range: [${minBound} - ${maxBound}] · ${isMyTurn ? 'Your Turn to Guess' : 'Opponent Thinking...'}`}
      />

      {/* Game Over Banner */}
      {endMessage && (
        <div className={`w-full max-w-[360px] p-2.5 mb-3 rounded-2xl text-center text-xs font-black border shadow-lg animate-fade-in ${
          winner === myRole
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-neon-emerald'
            : 'bg-rose-950/90 border-rose-500/80 text-rose-300'
        }`}>
          {endMessage}
        </div>
      )}

      {/* Target Radar Range Card */}
      <div className="w-full max-w-[360px] rounded-3xl bg-gradient-to-b from-[#131b2e] via-[#0b101c] to-[#06080e] border-2 border-cyan-500/40 p-4 flex flex-col items-center justify-between shadow-2xl mb-3 relative overflow-hidden">
        <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-wider text-cyan-400">
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5" /> SECRET TARGET: [1 - 100]
          </span>
          <span className="text-gray-400 font-mono">Turn: {isMyTurn ? 'YOU' : 'OPPONENT'}</span>
        </div>

        {/* Dynamic Bounds Slider Visual */}
        <div className="w-full my-3 flex items-center justify-between gap-3 px-3 py-2 rounded-2xl bg-black/50 border border-gray-800">
          <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300">{minBound}</span>
          <div className="flex-1 text-center">
            <span className="text-xs font-bold text-gray-400">SHRINKING BOUNDS</span>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                style={{
                  marginLeft: `${minBound}%`,
                  width: `${Math.max(5, maxBound - minBound)}%`
                }}
              />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-purple-300">{maxBound}</span>
        </div>

        {/* Input Box */}
        <div className="w-full flex items-center justify-between gap-2">
          <div className="flex-1 h-12 rounded-xl bg-gray-900/90 border-2 border-cyan-400/60 flex items-center justify-center text-2xl font-black font-mono text-white tracking-widest shadow-inner">
            {inputVal || <span className="text-gray-600 text-sm">Enter Number</span>}
          </div>
          <button
            onClick={handleSubmitGuess}
            disabled={!inputVal || !isMyTurn || isBotThinking || gameOver}
            className="h-12 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:pointer-events-none text-black font-black text-xs uppercase tracking-wider shadow-neon-cyan active:scale-95 transition-all flex items-center gap-1"
          >
            <CornerDownLeft className="w-4 h-4" /> Guess
          </button>
        </div>
      </div>

      {/* On-Screen Touch Numpad */}
      <div className="w-full max-w-[360px] grid grid-cols-3 gap-1.5 mb-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(btn => {
          const isAction = btn === 'C' || btn === '⌫';
          return (
            <button
              key={btn}
              onClick={() => {
                if (btn === 'C') handleClear();
                else if (btn === '⌫') handleDelete();
                else handleKeyPress(btn);
              }}
              disabled={!isMyTurn || isBotThinking || gameOver}
              className={`h-10 sm:h-11 rounded-xl border text-sm sm:text-base font-black transition-all active:scale-90 ${
                isAction
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-900/90 border-gray-800 text-white hover:border-cyan-400/80 hover:bg-cyan-950/30'
              }`}
            >
              {btn}
            </button>
          );
        })}
      </div>

      {/* Live Recent Clues Stream */}
      {guessHistory.length > 0 && (
        <div className="w-full max-w-[360px] p-2.5 rounded-2xl bg-gray-950/80 border border-gray-800 flex flex-col gap-1.5 text-xs max-h-24 overflow-y-auto">
          {guessHistory.slice(0, 3).map((h, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-gray-400">
                {h.guesser === 'you' ? 'You' : 'Opponent'} guessed <strong className="text-white text-xs">{h.guess}</strong>:
              </span>
              <span className={`font-black flex items-center gap-1 ${
                h.hint === 'correct' ? 'text-emerald-400' : h.hint === 'higher' ? 'text-amber-400' : 'text-sky-400'
              }`}>
                {h.hint === 'correct' ? '🎉 CORRECT!' : h.hint === 'higher' ? <><Flame className="w-3 h-3 fill-amber-400" /> Go HIGHER</> : <><Snowflake className="w-3 h-3" /> Go LOWER</>}
              </span>
            </div>
          ))}
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
