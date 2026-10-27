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
  | 'guess-number';

export type GameMode = 'bot' | 'room' | 'match';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  category: 'Strategy' | 'Board Game' | 'Classic' | 'Tactical' | 'Quick';
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
  socketId: string;
  name: string;
  avatar: string;
  symbol?: string;
  color?: string;
  role: 'player1' | 'player2';
  isHost?: boolean;
}

export interface MultiplayerMatchData {
  roomId: string;
  gameId: GameId;
  you: MultiplayerPlayer;
  opponent: MultiplayerPlayer;
  yourRole: 'player1' | 'player2';
  isYourTurn: boolean;
}
