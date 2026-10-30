// client/src/utils/gameCategories.ts
import React from 'react';
import {
  Brain,
  Puzzle,
  Trophy,
  Zap,
  Shield,
  Dice5,
  Sparkles,
  BookOpen,
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { GameId } from '../types';

export type GameGenre =
  | 'Brain'
  | 'Puzzle'
  | 'Action'
  | 'Sports'
  | 'Strategy'
  | 'Board'
  | 'Party'
  | 'Word'
  | 'Trivia';

export interface GenreMeta {
  name: GameGenre;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const GENRE_METAS: Record<GameGenre, GenreMeta> = {
  Brain: {
    name: 'Brain',
    icon: Brain,
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.25)'
  },
  Puzzle: {
    name: 'Puzzle',
    icon: Puzzle,
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.12)',
    borderColor: 'rgba(192, 132, 252, 0.25)'
  },
  Sports: {
    name: 'Sports',
    icon: Trophy,
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.25)'
  },
  Action: {
    name: 'Action',
    icon: Zap,
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.25)'
  },
  Strategy: {
    name: 'Strategy',
    icon: Shield,
    color: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.12)',
    borderColor: 'rgba(96, 165, 250, 0.25)'
  },
  Board: {
    name: 'Board',
    icon: Dice5,
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.12)',
    borderColor: 'rgba(251, 146, 60, 0.25)'
  },
  Party: {
    name: 'Party',
    icon: Sparkles,
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.12)',
    borderColor: 'rgba(244, 114, 182, 0.25)'
  },
  Word: {
    name: 'Word',
    icon: BookOpen,
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.25)'
  },
  Trivia: {
    name: 'Trivia',
    icon: HelpCircle,
    color: '#2dd4bf',
    bgColor: 'rgba(45, 212, 191, 0.12)',
    borderColor: 'rgba(45, 212, 191, 0.25)'
  }
};

export const GAME_ENGINE_GENRES: Record<string, GameGenre> = {
  // Strategy
  chess: 'Strategy',
  checkers: 'Strategy',
  battleship: 'Strategy',
  othello: 'Strategy',
  gomoku: 'Strategy',
  mancala: 'Strategy',
  mafia: 'Strategy',
  spyfall: 'Strategy',

  // Board
  'tic-tac-toe': 'Board',
  ludo: 'Board',
  'snakes-and-ladders': 'Board',
  pachisi: 'Board',
  'chowka-bara': 'Board',
  pallanguzhi: 'Board',

  // Puzzle
  'connect-four': 'Puzzle',
  'dots-and-boxes': 'Puzzle',
  minesweeper: 'Puzzle',
  nonogram: 'Puzzle',
  'lights-out': 'Puzzle',
  'emoji-movie-guess': 'Puzzle',

  // Sports
  carrom: 'Sports',
  kabaddi: 'Sports',
  'cricket-quiz': 'Sports',
  'hand-cricket': 'Sports',

  // Action
  'math-battle': 'Action',
  'rps-strike': 'Action',
  rpsls: 'Action',
  'rapid-fire': 'Action',
  'last-letter': 'Action',
  'coin-toss': 'Action',
  'odd-even': 'Action',

  // Brain
  sudoku: 'Brain',
  mastermind: 'Brain',
  'bulls-and-cows': 'Brain',
  'logic-grid': 'Brain',
  'pattern-recognition': 'Brain',
  'daily-riddle': 'Brain',
  'simon-says': 'Brain',
  'memory-match': 'Brain',
  'matchstick-puzzle': 'Brain',
  nim: 'Brain',
  'higher-lower': 'Brain',
  'guess-number': 'Brain',

  // Party
  'truth-or-dare': 'Party',
  'never-have-i-ever': 'Party',
  'who-knows-me-best': 'Party',
  'most-likely-to': 'Party',
  'two-truths-and-a-lie': 'Party',
  'would-you-rather': 'Party',
  'dumb-charades': 'Party',
  'imposter-word': 'Party',
  'sentence-builder': 'Party',
  'alphabet-categories': 'Party',
  'forbidden-word': 'Party',

  // Word
  'word-chain': 'Word',
  wordle: 'Word',
  hangman: 'Word',
  'word-builder': 'Word',
  anagrams: 'Word',
  unscramble: 'Word',
  'rhyme-battle': 'Word',
  'guess-the-word': 'Word',
  'word-clash': 'Word',

  // Trivia
  'cyber-trivia': 'Trivia',
  'guess-the-movie': 'Trivia',
  'guess-the-song': 'Trivia',
  antakshari: 'Trivia',
  'name-place-animal-thing': 'Trivia'
};

export const getGameGenre = (gameEngineId: string): GenreMeta => {
  const genre = GAME_ENGINE_GENRES[gameEngineId] || 'Brain';
  return GENRE_METAS[genre];
};

export const getPlayerCountBadge = (meta?: string): string => {
  if (!meta) return '2 Players';
  const firstPart = meta.split('·')[0].trim();
  return firstPart || '2 Players';
};
