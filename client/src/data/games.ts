// client/src/data/games.ts
import { GameMetadata, GameId } from '../types';

export interface CanvaGameItem {
  id: string;
  gameEngineId: GameId;
  title: string;
  category: 'Puzzle' | 'Arcade' | 'Strategy' | 'Trivia' | 'Party' | 'Multiplayer';
  categories: string[];
  artClass: string;
  artSymbol: string;
  meta: string;
  quickSubtitle?: string;
  description: string;
  rules: string[];
}

export const CANVA_GAMES: CanvaGameItem[] = [
  {
    id: 'chess',
    gameEngineId: 'chess',
    title: 'Chess Master',
    category: 'Strategy',
    categories: ['Strategy', 'Multiplayer', 'Trivia'],
    artClass: 'art-chess',
    artSymbol: '♞',
    meta: '2 Players · 30s Blitz · Ranked & Bot',
    quickSubtitle: 'The ultimate strategy checkmate',
    description: 'Grandmaster standard 8x8 chess. Command your royal army of pawns, knights, bishops, rooks, queen, and king in a 30s blitz duel.',
    rules: [
      'Standard 8x8 international chess rules apply.',
      'Strict 30-second turn timer per move.',
      'Checkmate or timeout forfeit wins the match.'
    ]
  },
  {
    id: 'connect-four',
    gameEngineId: 'connect-four',
    title: 'Connect Four',
    category: 'Puzzle',
    categories: ['Puzzle', 'Arcade', 'Party', 'Multiplayer'],
    artClass: 'art-brain',
    artSymbol: '✦',
    meta: '2 Players · 30s Move · Casual & Ranked',
    quickSubtitle: 'Drop, block, and connect 4 discs',
    description: 'Gravity-powered vertical grid duel! Drop your colored discs into 7 columns and connect four in a line before your rival.',
    rules: [
      '30 seconds per move timer.',
      'Drop discs into columns to form 4-in-a-row.',
      'If opponent leaves or times out, you automatically win by forfeit.'
    ]
  },
  {
    id: 'tic-tac-toe',
    gameEngineId: 'tic-tac-toe',
    title: 'Neon Tic-Tac-Toe',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Multiplayer', 'Puzzle'],
    artClass: 'art-pixel',
    artSymbol: '⚡',
    meta: '2 Players · Quick Match · Arcade Blitz',
    quickSubtitle: 'Fast 3x3 neon grid clash',
    description: 'World-famous neon cyber duel! Place X or O and race to complete 3 in a line within 30 seconds.',
    rules: [
      'Strict 30-second turn limit.',
      'Take turns placing symbols in empty 3x3 cells.',
      'Line up 3 across, down, or diagonal to claim victory!'
    ]
  },
  {
    id: 'checkers',
    gameEngineId: 'checkers',
    title: 'Classic Checkers',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Multiplayer'],
    artClass: 'art-fire',
    artSymbol: '👑',
    meta: '2 Players · 30s Clock · Jump & Crown',
    quickSubtitle: 'Diagonal jumps & king promotion',
    description: 'Command your pieces forward along dark squares. Leap over enemy checkers to capture them and get crowned King!',
    rules: [
      '30-second move clock.',
      'Jump over opponent pieces diagonally to capture them.',
      'Reaching the opposite back row crowns your piece into a King 👑.'
    ]
  },
  {
    id: 'battleship',
    gameEngineId: 'battleship',
    title: 'Naval Battleship',
    category: 'Trivia',
    categories: ['Trivia', 'Strategy', 'Puzzle', 'Multiplayer'],
    artClass: 'art-logic',
    artSymbol: '⚓',
    meta: '2 Players · Fleet Radar · Tactical Duel',
    quickSubtitle: 'Radar strikes & sink enemy armada',
    description: 'Secretly deploy your 5 naval warships. Call coordinates, detect hits, and sink the entire enemy armada on the 10x10 radar grid!',
    rules: [
      '30s per radar strike.',
      'Track red explosions (💥 Hit) and blue splashes (💧 Miss).',
      'First commander to sink all 5 warships wins!'
    ]
  },
  {
    id: 'othello',
    gameEngineId: 'othello',
    title: 'Reversi Duel',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Multiplayer'],
    artClass: 'art-othello',
    artSymbol: '☯',
    meta: '2 Players · 30s Clock · Flip & Conquer',
    quickSubtitle: 'Trap and flip opponent discs',
    description: 'The minute-to-learn, lifetime-to-master classic! Trap your opponent discs between yours to flip them. Outflank on corners to win.',
    rules: [
      'Trap opponent discs between yours horizontally, vertically, or diagonally.',
      'Trapped discs flip to your color.',
      'Player with the highest disc count at the end wins!'
    ]
  },
  {
    id: 'dots-and-boxes',
    gameEngineId: 'dots-and-boxes',
    title: 'Dots & Boxes',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Strategy', 'Multiplayer'],
    artClass: 'art-dots',
    artSymbol: '⚄',
    meta: '2 Players · Grid Duel · Territory Rush',
    quickSubtitle: 'Connect lines & claim boxes',
    description: 'Connect dots with glowing laser lines. Complete the 4th side of any box to claim it and win a free bonus turn!',
    rules: [
      'Players alternate turns drawing lines between dots.',
      'Completing a box claims it and awards a free extra turn.',
      'Claim the most boxes on the grid to conquer the match.'
    ]
  },
  {
    id: 'gomoku',
    gameEngineId: 'gomoku',
    title: 'Gomoku Zen',
    category: 'Strategy',
    categories: ['Strategy', 'Multiplayer', 'Trivia'],
    artClass: 'art-gomoku',
    artSymbol: '⛩',
    meta: '2 Players · 30s Blitz · Five-in-a-Row',
    quickSubtitle: 'Align 5 stones to strike victory',
    description: 'The ancient art of Five-in-a-Row. Take turns placing black and white stones on the grid. First to align 5 stones wins!',
    rules: [
      'Take turns placing stones on empty intersections.',
      'First player to create an unbroken row of 5 stones (horizontal, vertical, or diagonal) wins.',
      'Strict 30-second turn limit.'
    ]
  },
  {
    id: 'memory-match',
    gameEngineId: 'memory-match',
    title: 'Cyber Pairs',
    category: 'Puzzle',
    categories: ['Puzzle', 'Party', 'Arcade', 'Multiplayer'],
    artClass: 'art-memory',
    artSymbol: '🧩',
    meta: '2 Players · Memory Clash · Bonus Turns',
    quickSubtitle: 'Flip cards & match cyber icons',
    description: 'A high-stakes cyber card-matching duel! Flip two cards per turn. Finding matching pairs scores points and grants bonus turns.',
    rules: [
      'Flip 2 cards per turn to uncover cyber icons.',
      'Finding a match scores 1 point and awards a free turn.',
      'Player with the most matches when all cards are cleared wins!'
    ]
  },
  {
    id: 'mancala',
    gameEngineId: 'mancala',
    title: 'Mancala Quest',
    category: 'Party',
    categories: ['Party', 'Strategy', 'Multiplayer'],
    artClass: 'art-mancala',
    artSymbol: '🏺',
    meta: '2 Players · Ancient Kalah · Seed Sowing',
    quickSubtitle: 'Sow gemstones & capture pits',
    description: 'The timeless gemstone strategy game! Pick up seeds from your pits and sow them counter-clockwise. Chain bonus turns and capture opponent pits!',
    rules: [
      'Pick up seeds from any pit on your side and sow them one-by-one counter-clockwise.',
      'If your last seed lands in your store, you get a free turn!',
      'If your last seed lands in an empty pit on your side, capture the opposite pit! Most seeds wins.'
    ]
  },
  {
    id: 'cyber-trivia',
    gameEngineId: 'cyber-trivia',
    title: 'Cyber Trivia',
    category: 'Trivia',
    categories: ['Trivia', 'Party', 'Multiplayer'],
    artClass: 'art-trivia',
    artSymbol: '⚡',
    meta: '2 Players · 5 Fast Rounds · Speed Bonus',
    quickSubtitle: 'Test your brain across tech & games',
    description: 'A high-voltage 5-round trivia showdown! Race against the clock answering questions across Gaming, Tech & AI, Cosmos, Pop Culture, and History.',
    rules: [
      '5 rounds of timed questions.',
      'Faster correct answers score up to +50 speed bonus.',
      'Highest points at round 5 wins!'
    ]
  },
  {
    id: 'word-clash',
    gameEngineId: 'word-clash',
    title: 'Word Clash',
    category: 'Puzzle',
    categories: ['Puzzle', 'Trivia', 'Multiplayer'],
    artClass: 'art-wordclash',
    artSymbol: '🔤',
    meta: '2 Players · 6 Attempts · Code Cracker',
    quickSubtitle: 'Crack the 5-letter secret code',
    description: 'The ultimate 5-letter word puzzle duel! Guess the hidden code in 6 attempts with live Green, Yellow, and Gray cyber feedback.',
    rules: [
      'Guess the secret 5-letter word in 6 tries.',
      '🟩 Green = exact letter. 🟨 Yellow = wrong spot. ⬛ Gray = not in word.',
      'First to solve or fewest attempts wins!'
    ]
  },
  {
    id: 'rps-strike',
    gameEngineId: 'rps-strike',
    title: 'RPS Cyber Strike',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Multiplayer'],
    artClass: 'art-rps',
    artSymbol: '⚔️',
    meta: '2 Players · Best of 5 · Laser Weapons',
    quickSubtitle: 'Titan Rock, Quantum Paper, Laser Blades',
    description: 'Fast-action Rock-Paper-Scissors tactical clash! Lock in your weapon secretly, trigger the simultaneous holographic reveal, and reach 3 points to claim the arena!',
    rules: [
      'First to 3 points wins the match.',
      'Titan Rock crushes Blades, Quantum Paper envelops Rock, Laser Blades slice Paper.',
      '12-second round timer for quick tactical clashes.'
    ]
  }
];

// Compatibility with existing game engine definitions
export const GAMES: GameMetadata[] = [
  {
    id: 'chess',
    title: 'Chess Master',
    tagline: 'The Ultimate Strategy Battlefield',
    category: 'Strategy',
    difficulty: 'Hardcore',
    players: '1 - 2 Players',
    avgTime: '10-25 min',
    iconName: 'Crown',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#b58aff',
    featured: true,
    description: 'Command your royal army of pawns, knights, rooks, bishops, queen, and king. Outwit your rival with tactical checkmate!',
    rules: [
      'Standard 8x8 international chess rules apply.',
      'Strict 30-second turn timer per move.',
      'Checkmate or timeout forfeit wins the match.'
    ]
  },
  {
    id: 'connect-four',
    title: 'Connect Four',
    tagline: 'Drop, Block, and Connect 4 Discs',
    category: 'Tactical',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-8 min',
    iconName: 'CircleDot',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#5be9ed',
    featured: true,
    description: 'Gravity-powered grid duel! Drop your colored discs into the 7 vertical columns and connect four in a row.',
    rules: [
      'Players alternate turns dropping discs with 30s move timers.',
      'Form a line of four horizontally, vertically, or diagonally to win.',
      'If opponent leaves, you automatically win by forfeit.'
    ]
  },
  {
    id: 'tic-tac-toe',
    title: 'Neon Tic-Tac-Toe',
    tagline: 'Fast-Paced 3x3 Grid Clash',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '1-3 min',
    iconName: 'Hash',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#a77bff',
    featured: false,
    description: 'World-famous neon cyber duel! Place X or O and race to complete 3 in a line within 30 seconds.',
    rules: [
      'Strict 30-second turn limit.',
      'Take turns placing symbols in empty 3x3 cells.',
      'Line up 3 across, down, or diagonal to trigger the win!'
    ]
  },
  {
    id: 'checkers',
    title: 'Classic Checkers',
    tagline: 'Diagonal Jumps & King Promotion',
    category: 'Board Game',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-15 min',
    iconName: 'Shield',
    gradient: 'from-red-500/20 to-transparent',
    accentColor: '#f58977',
    featured: false,
    description: 'Command your pieces forward along dark squares. Leap over enemy checkers to capture them and get crowned King!',
    rules: [
      '30-second move clock.',
      'Jump over opponent pieces diagonally to capture them.',
      'Reaching the opposite back row crowns your piece into a King!'
    ]
  },
  {
    id: 'battleship',
    title: 'Naval Battleship',
    tagline: 'Deploy Fleet & Sink Enemy Armada',
    category: 'Tactical',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '8-18 min',
    iconName: 'Anchor',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#5be9ed',
    featured: true,
    description: 'Secretly deploy your 5 naval warships. Call coordinates, detect hits, and sink the entire enemy armada!',
    rules: [
      '30s per radar strike.',
      'Track red explosions (Hit) and white splashes (Miss).',
      'First commander to sink all 5 ships wins!'
    ]
  },
  {
    id: 'othello',
    title: 'Reversi Duel',
    tagline: 'Trap & Flip Discs',
    category: 'Strategy',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-12 min',
    iconName: 'Disc',
    gradient: 'from-teal-500/20 to-transparent',
    accentColor: '#2dd4bf',
    featured: true,
    description: 'Classic 8x8 disc-flipping duel! Trap enemy discs between yours along horizontal, vertical, or diagonal lines to flip them.',
    rules: [
      'Trap opponent pieces between yours to flip them to your color.',
      'Corner tiles are immune to flipping and grant supreme advantage.',
      'Most discs at the end wins the match!'
    ]
  },
  {
    id: 'dots-and-boxes',
    title: 'Dots & Boxes',
    tagline: 'Laser Lines & Territory Capture',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-8 min',
    iconName: 'Grid',
    gradient: 'from-fuchsia-500/20 to-transparent',
    accentColor: '#d946ef',
    featured: false,
    description: 'Connect dots with laser lines. Completing any box claims it for points and gives an extra turn.',
    rules: [
      'Take turns drawing lines between adjacent dots.',
      'Completing the 4th side of a box captures it and grants a free turn.',
      'Player with the highest box count wins.'
    ]
  },
  {
    id: 'gomoku',
    title: 'Gomoku Zen',
    tagline: 'The Zen of Five-in-a-Row',
    category: 'Strategy',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-15 min',
    iconName: 'Target',
    gradient: 'from-indigo-500/20 to-transparent',
    accentColor: '#6366f1',
    featured: false,
    description: 'Race to form an unbroken chain of 5 stones horizontally, vertically, or diagonally on the Go board.',
    rules: [
      'Place stones on empty grid intersections.',
      'First player to create an unbroken line of 5 stones wins.',
      '30-second turn limit.'
    ]
  },
  {
    id: 'memory-match',
    title: 'Cyber Pairs',
    tagline: 'High-Tech Holographic Card Duel',
    category: 'Classic',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-7 min',
    iconName: 'Sparkles',
    gradient: 'from-pink-500/20 to-transparent',
    accentColor: '#ec4899',
    featured: false,
    description: 'Flip holographic cyber tiles to find matching pairs. Matching grants bonus turns!',
    rules: [
      'Flip two cards per turn.',
      'Matching cards gives 1 point and a free turn.',
      'Most pairs when all cards are cleared wins.'
    ]
  },
  {
    id: 'mancala',
    title: 'Mancala Quest',
    tagline: 'Ancient Pit & Seed Capture',
    category: 'Board Game',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-12 min',
    iconName: 'CircleDot',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Sow gemstones counter-clockwise. Chain bonus turns from your store and capture opponent pits to dominate.',
    rules: [
      'Sow stones into consecutive pits and your store.',
      'Ending in your store gives a free extra turn.',
      'Ending in an empty pit captures the opposite pit.'
    ]
  },
  {
    id: 'cyber-trivia',
    title: 'Cyber Trivia',
    tagline: '5-Round High-Voltage Quiz Duel',
    category: 'Quick',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '3-6 min',
    iconName: 'Zap',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#00f2fe',
    featured: true,
    description: 'Battle across 5 timed trivia rounds in Gaming, Tech, AI, and Science. Fast answers earn speed bonuses!',
    rules: [
      '5 rounds of timed questions.',
      'Faster correct answers score up to +50 speed bonus.',
      'Highest points at round 5 wins!'
    ]
  },
  {
    id: 'word-clash',
    title: 'Word Clash',
    tagline: '5-Letter Cyber Wordle Duel',
    category: 'Tactical',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '4-8 min',
    iconName: 'Sparkles',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#00f59b',
    featured: true,
    description: 'Crack the hidden 5-letter cyber code in 6 attempts with live color-coded tile hints.',
    rules: [
      'Guess the secret 5-letter word in 6 tries.',
      '🟩 Green = exact letter. 🟨 Yellow = wrong spot. ⬛ Gray = not in word.',
      'First to solve or fewest attempts wins!'
    ]
  },
  {
    id: 'rps-strike',
    title: 'RPS Cyber Strike',
    tagline: 'Holographic Rock Paper Scissors',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '2-5 min',
    iconName: 'Swords',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#9d4edd',
    featured: true,
    description: 'High-stakes tactical RPS! Secret weapon lock-in and simultaneous holographic reveals in a race to 3 wins.',
    rules: [
      'First to 3 points wins the match.',
      'Titan Rock crushes Blades, Quantum Paper envelops Rock, Laser Blades slice Paper.',
      '12-second round timer for quick tactical clashes.'
    ]
  }
];
