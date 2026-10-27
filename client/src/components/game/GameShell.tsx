// client/src/components/game/GameShell.tsx
import React from 'react';
import { ArrowLeft, Bot, Users2, Globe, Volume2, VolumeX } from 'lucide-react';
import { BotDifficulty, GameId, GameMode, MultiplayerMatchData } from '../../types';
import { GAMES } from '../../data/games';
import { TicTacToe } from '../../games/tictactoe/TicTacToe';
import { ConnectFour } from '../../games/connectfour/ConnectFour';
import { ChessGame } from '../../games/chess/ChessGame';
import { CheckersGame } from '../../games/checkers/CheckersGame';
import { BattleshipGame } from '../../games/battleship/BattleshipGame';
import { OthelloGame } from '../../games/othello/OthelloGame';
import { DotsAndBoxesGame } from '../../games/dotsandboxes/DotsAndBoxesGame';
import { GomokuGame } from '../../games/gomoku/GomokuGame';
import { MemoryGame } from '../../games/memory/MemoryGame';
import { MancalaGame } from '../../games/mancala/MancalaGame';
import { TriviaGame } from '../../games/trivia/TriviaGame';
import { WordClashGame } from '../../games/wordclash/WordClashGame';
import { RPSGame } from '../../games/rps/RPSGame';
import { HandCricketGame } from '../../games/handcricket/HandCricketGame';
import { RPSLSGame } from '../../games/rpsls/RPSLSGame';
import { NimGame } from '../../games/nim/NimGame';
import { MatchstickGame } from '../../games/matchstick/MatchstickGame';
import { CoinTossGame } from '../../games/cointoss/CoinTossGame';
import { OddEvenGame } from '../../games/oddeven/OddEvenGame';
import { HigherLowerGame } from '../../games/higherlower/HigherLowerGame';
import { GuessNumberGame } from '../../games/guessthenumber/GuessNumberGame';
import { ChatBox } from './ChatBox';
import { sound } from '../../services/sound';
import { DEFAULT_AVATARS } from '../../services/storage';

interface GameShellProps {
  gameId: GameId;
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const GameShell: React.FC<GameShellProps> = ({
  gameId,
  mode,
  botDifficulty = 'medium',
  multiplayerData,
  onExit
}) => {
  const [isMuted, setIsMuted] = React.useState<boolean>(sound.getMuted());
  const game = GAMES.find(g => g.id === gameId);

  // Always reset scroll to the very top of page when entering a game
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [gameId]);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.play('click');
  };

  const opponentAvatar = multiplayerData?.opponent
    ? DEFAULT_AVATARS.find(a => a.id === multiplayerData.opponent.avatar)?.emoji || '👤'
    : '🤖';

  const opponentName = mode === 'bot'
    ? `Gamzyard Bot (${botDifficulty})`
    : multiplayerData?.opponent.name || 'Opponent';

  return (
    <div className="min-h-screen flex flex-col bg-[#070810] text-gray-100 relative overflow-x-hidden">
      {/* Ambient gradient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${game?.accentColor || '#00f2fe'}, transparent 70%)`
        }}
      />

      {/* Game Shell Header */}
      <header className="relative z-10 w-full px-4 py-3 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between">
        {/* Left: Back & Game Info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { onExit(); sound.play('click'); }}
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-colors"
            title="Leave Match"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                {game?.title}
              </h1>
              {/* Mode Badge */}
              <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-800/80 text-gray-300 border border-gray-700">
                {mode === 'bot' && <Bot className="w-3 h-3 text-cyan-400" />}
                {mode === 'room' && <Users2 className="w-3 h-3 text-purple-400" />}
                {mode === 'match' && <Globe className="w-3 h-3 text-emerald-400" />}
                <span>
                  {mode === 'bot' ? `Bot: ${botDifficulty}` : mode === 'room' ? `Room: ${multiplayerData?.roomId}` : 'Ranked Online'}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center space-x-1">
              <span>Playing vs</span>
              <span className="font-semibold text-gray-200">{opponentAvatar} {opponentName}</span>
            </div>
          </div>
        </div>

        {/* Right: Sound toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition-all active:scale-95"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* Main Game Play Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-4 sm:py-6">
        {gameId === 'tic-tac-toe' && (
          <TicTacToe
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'connect-four' && (
          <ConnectFour
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'chess' && (
          <ChessGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'checkers' && (
          <CheckersGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'battleship' && (
          <BattleshipGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'othello' && (
          <OthelloGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'dots-and-boxes' && (
          <DotsAndBoxesGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'gomoku' && (
          <GomokuGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'memory-match' && (
          <MemoryGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'mancala' && (
          <MancalaGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'cyber-trivia' && (
          <TriviaGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'word-clash' && (
          <WordClashGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'rps-strike' && (
          <RPSGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'hand-cricket' && (
          <HandCricketGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'rpsls' && (
          <RPSLSGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'nim' && (
          <NimGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'matchstick-puzzle' && (
          <MatchstickGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'coin-toss' && (
          <CoinTossGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'odd-even' && (
          <OddEvenGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'higher-lower' && (
          <HigherLowerGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'guess-number' && (
          <GuessNumberGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
      </main>

      {/* In-game live chat for multiplayer mode */}
      {mode !== 'bot' && multiplayerData && (
        <ChatBox multiplayerData={multiplayerData} />
      )}
    </div>
  );
};
