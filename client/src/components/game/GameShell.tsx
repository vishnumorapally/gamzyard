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
import { PallanguzhiGame } from '../../games/pallanguzhi/PallanguzhiGame';
import { ChowkaBaraGame } from '../../games/chowkabara/ChowkaBaraGame';
import { PachisiGame } from '../../games/pachisi/PachisiGame';
import { SnakesLaddersGame } from '../../games/snakesladders/SnakesLaddersGame';
import { LudoGame } from '../../games/ludo/LudoGame';
import { CarromGame } from '../../games/carrom/CarromGame';
import { KabaddiGame } from '../../games/kabaddi/KabaddiGame';
import { CricketQuizGame } from '../../games/cricketquiz/CricketQuizGame';
import { AntakshariGame } from '../../games/antakshari/AntakshariGame';
import { NPATGame } from '../../games/nameplaceanimalthing/NPATGame';
import { TruthOrDareGame } from '../../games/truthordare/TruthOrDareGame';
import { NeverHaveIEverGame } from '../../games/neverhaveiever/NeverHaveIEverGame';
import { WhoKnowsMeBestGame } from '../../games/whoknowsmebest/WhoKnowsMeBestGame';
import { MostLikelyToGame } from '../../games/mostlikelyto/MostLikelyToGame';
import { TwoTruthsLieGame } from '../../games/twotruthsalie/TwoTruthsLieGame';
import { WouldYouRatherGame } from '../../games/wouldyourather/WouldYouRatherGame';
import { RapidFireGame } from '../../games/rapidfire/RapidFireGame';
import { DumbCharadesGame } from '../../games/dumbcharades/DumbCharadesGame';
import { GuessTheMovieGame } from '../../games/guessthemovie/GuessTheMovieGame';
import { GuessTheSongGame } from '../../games/guessthesong/GuessTheSongGame';
import { GuessTheWordGame } from '../../games/guesstheword/GuessTheWordGame';
import { ImposterWordGame } from '../../games/imposterword/ImposterWordGame';
import { MafiaGame } from '../../games/mafia/MafiaGame';
import { SpyfallGame } from '../../games/spyfall/SpyfallGame';
import { WordChainGame } from '../../games/wordchain/WordChainGame';
import { WordleGame } from '../../games/wordle/WordleGame';
import { HangmanGame } from '../../games/hangman/HangmanGame';
import { WordBuilderGame } from '../../games/wordbuilder/WordBuilderGame';
import { AnagramsGame } from '../../games/anagrams/AnagramsGame';
import { UnscrambleGame } from '../../games/unscramble/UnscrambleGame';
import { LastLetterGame } from '../../games/lastletter/LastLetterGame';
import { AlphabetCategoriesGame } from '../../games/alphabetcategories/AlphabetCategoriesGame';
import { ForbiddenWordGame } from '../../games/forbiddenword/ForbiddenWordGame';
import { RhymeBattleGame } from '../../games/rhymebattle/RhymeBattleGame';
import { SentenceBuilderGame } from '../../games/sentencebuilder/SentenceBuilderGame';
import { EmojiMovieGuessGame } from '../../games/emojimovieguess/EmojiMovieGuessGame';
import { SudokuGame } from '../../games/sudoku/SudokuGame';
import { MinesweeperGame } from '../../games/minesweeper/MinesweeperGame';
import { MemoryMatchGame } from '../../games/memorymatch/MemoryMatchGame';
import { SimonSaysGame } from '../../games/simonsays/SimonSaysGame';
import { MastermindGame } from '../../games/mastermind/MastermindGame';
import { BullsAndCowsGame } from '../../games/bullsandcows/BullsAndCowsGame';
import { NonogramGame } from '../../games/nonogram/NonogramGame';
import { LightsOutGame } from '../../games/lightsout/LightsOutGame';
import { MathBattleGame } from '../../games/mathbattle/MathBattleGame';
import { LogicGridGame } from '../../games/logicgrid/LogicGridGame';
import { PatternRecognitionGame } from '../../games/patternrecognition/PatternRecognitionGame';
import { DailyRiddleGame } from '../../games/dailyriddle/DailyRiddleGame';
import { ChatBox } from './ChatBox';
import { sound } from '../../services/sound';
import { DEFAULT_AVATARS } from '../../services/storage';

interface GameShellProps {
  gameId: GameId;
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const GameShell: React.FC<GameShellProps> = ({
  gameId,
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
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
        {gameId === 'pallanguzhi' && (
          <PallanguzhiGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'chowka-bara' && (
          <ChowkaBaraGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'pachisi' && (
          <PachisiGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'snakes-and-ladders' && (
          <SnakesLaddersGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'ludo' && (
          <LudoGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'carrom' && (
          <CarromGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'kabaddi' && (
          <KabaddiGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'cricket-quiz' && (
          <CricketQuizGame
            mode={mode}
            botDifficulty={botDifficulty}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'antakshari' && (
          <AntakshariGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'name-place-animal-thing' && (
          <NPATGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'truth-or-dare' && (
          <TruthOrDareGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'never-have-i-ever' && (
          <NeverHaveIEverGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'who-knows-me-best' && (
          <WhoKnowsMeBestGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'most-likely-to' && (
          <MostLikelyToGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'two-truths-and-a-lie' && (
          <TwoTruthsLieGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'would-you-rather' && (
          <WouldYouRatherGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'rapid-fire' && (
          <RapidFireGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'dumb-charades' && (
          <DumbCharadesGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'guess-the-movie' && (
          <GuessTheMovieGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'guess-the-song' && (
          <GuessTheSongGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'guess-the-word' && (
          <GuessTheWordGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'imposter-word' && (
          <ImposterWordGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'mafia' && (
          <MafiaGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'spyfall' && (
          <SpyfallGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'word-chain' && (
          <WordChainGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'wordle' && (
          <WordleGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'hangman' && (
          <HangmanGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'word-builder' && (
          <WordBuilderGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'anagrams' && (
          <AnagramsGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'unscramble' && (
          <UnscrambleGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'last-letter' && (
          <LastLetterGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'alphabet-categories' && (
          <AlphabetCategoriesGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'forbidden-word' && (
          <ForbiddenWordGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'rhyme-battle' && (
          <RhymeBattleGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'sentence-builder' && (
          <SentenceBuilderGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'emoji-movie-guess' && (
          <EmojiMovieGuessGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'sudoku' && (
          <SudokuGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'minesweeper' && (
          <MinesweeperGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'memory-match' && (
          <MemoryMatchGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'simon-says' && (
          <SimonSaysGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'mastermind' && (
          <MastermindGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'bulls-and-cows' && (
          <BullsAndCowsGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'nonogram' && (
          <NonogramGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'lights-out' && (
          <LightsOutGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'math-battle' && (
          <MathBattleGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'logic-grid' && (
          <LogicGridGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'pattern-recognition' && (
          <PatternRecognitionGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
            multiplayerData={multiplayerData}
            onExit={onExit}
          />
        )}
        {gameId === 'daily-riddle' && (
          <DailyRiddleGame
            mode={mode}
            botDifficulty={botDifficulty}
            playerCount={playerCount}
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
