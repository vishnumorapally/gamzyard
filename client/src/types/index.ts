// client/src/types/index.ts

export type GameId =
  | 'tic-tac-toe'
  | 'connect-four'
  | 'chess'
  | 'checkers'
  | 'battleship'
  | 'othello'
  | 'dots-and-boxes'
  | 'gomoku'
  | 'memory-match'
  | 'mancala'
  | 'cyber-trivia'
  | 'word-clash'
  | 'rps-strike'
  | 'hand-cricket'
  | 'rpsls'
  | 'nim'
  | 'matchstick-puzzle'
  | 'coin-toss'
  | 'odd-even'
  | 'higher-lower'
  | 'guess-number'
  | 'pallanguzhi'
  | 'chowka-bara'
  | 'pachisi'
  | 'snakes-and-ladders'
  | 'ludo'
  | 'carrom'
  | 'kabaddi'
  | 'cricket-quiz'
  | 'antakshari'
  | 'name-place-animal-thing'
  | 'truth-or-dare'
  | 'never-have-i-ever'
  | 'who-knows-me-best'
  | 'most-likely-to'
  | 'two-truths-and-a-lie'
  | 'would-you-rather'
  | 'rapid-fire'
  | 'dumb-charades'
  | 'guess-the-movie'
  | 'guess-the-song'
  | 'guess-the-word'
  | 'imposter-word'
  | 'mafia'
  | 'spyfall'
  | 'word-chain'
  | 'wordle'
  | 'hangman'
  | 'word-builder'
  | 'anagrams'
  | 'unscramble'
  | 'last-letter'
  | 'alphabet-categories'
  | 'forbidden-word'
  | 'rhyme-battle'
  | 'sentence-builder'
  | 'emoji-movie-guess'
  | 'sudoku'
  | 'minesweeper'
  | 'memory-match'
  | 'simon-says'
  | 'mastermind'
  | 'bulls-and-cows'
  | 'nonogram'
  | 'lights-out'
  | 'math-battle'
  | 'logic-grid'
  | 'pattern-recognition'
  | 'daily-riddle';

export type GameMode = 'bot' | 'room' | 'match';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  category: 'Strategy' | 'Board Game' | 'Classic' | 'Tactical' | 'Quick' | 'Party' | 'Trivia' | 'Social' | 'Puzzle' | 'Word' | 'Arcade';
  difficulty: 'Casual' | 'Intermediate' | 'Hardcore';
  players: string;
  avgTime: string;
  iconName: string;
  gradient: string;
  accentColor: string;
  featured?: boolean;
  description: string;
  rules: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  email?: string;
  provider?: 'guest' | 'google';
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export interface MultiplayerPlayer {
  id?: string;
  socketId: string;
  name: string;
  avatar: string;
  symbol?: string;
  color?: string;
  role: 'player1' | 'player2' | string;
  isHost?: boolean;
  isBot?: boolean;
}

export interface MultiplayerMatchData {
  roomId: string;
  gameId: GameId;
  you: MultiplayerPlayer;
  opponent: MultiplayerPlayer;
  allPlayers?: MultiplayerPlayer[];
  playerCount?: number;
  yourRole: 'player1' | 'player2';
  isYourTurn: boolean;
}
