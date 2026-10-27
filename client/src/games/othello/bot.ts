// client/src/games/othello/bot.ts
import { BotDifficulty } from '../../types';

export type OthelloColor = 'black' | 'white';
export type OthelloCell = OthelloColor | null;
export type OthelloBoard = OthelloCell[][];

export const BOARD_SIZE = 8;

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

// Positional weight matrix for 8x8 Othello
const POSITIONAL_WEIGHTS: number[][] = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
  [  5,  -2,  -1,   0,   0,  -1,  -2,   5],
  [  5,  -2,  -1,   0,   0,  -1,  -2,   5],
  [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100]
];

export function createInitialOthelloBoard(): OthelloBoard {
  const board: OthelloBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
}

export function getFlipsForMove(
  board: OthelloBoard,
  row: number,
  col: number,
  color: OthelloColor
): [number, number][] {
  if (board[row][col] !== null) return [];

  const oppColor: OthelloColor = color === 'black' ? 'white' : 'black';
  const allFlips: [number, number][] = [];

  for (const [dr, dc] of DIRECTIONS) {
    let r = row + dr;
    let c = col + dc;
    const currentFlips: [number, number][] = [];

    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === oppColor) {
      currentFlips.push([r, c]);
      r += dr;
      c += dc;
    }

    if (currentFlips.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
      allFlips.push(...currentFlips);
    }
  }

  return allFlips;
}

export interface ValidMove {
  row: number;
  col: number;
  flips: [number, number][];
}

export function getValidMoves(board: OthelloBoard, color: OthelloColor): ValidMove[] {
  const validMoves: ValidMove[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const flips = getFlipsForMove(board, r, c, color);
      if (flips.length > 0) {
        validMoves.push({ row: r, col: c, flips });
      }
    }
  }
  return validMoves;
}

export function applyOthelloMove(
  board: OthelloBoard,
  row: number,
  col: number,
  color: OthelloColor,
  flips: [number, number][]
): OthelloBoard {
  const next: OthelloBoard = board.map(r => [...r]);
  next[row][col] = color;
  for (const [fr, fc] of flips) {
    next[fr][fc] = color;
  }
  return next;
}

export function countOthelloDiscs(board: OthelloBoard): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 'black') black++;
      else if (board[r][c] === 'white') white++;
    }
  }
  return { black, white };
}

export function getOthelloBotMove(
  board: OthelloBoard,
  difficulty: BotDifficulty,
  botColor: OthelloColor
): { row: number; col: number; flips: [number, number][] } | null {
  const moves = getValidMoves(board, botColor);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === 'medium') {
    // Greedy flip count with corner preference
    let best = moves[0];
    let bestScore = -Infinity;
    for (const move of moves) {
      const isCorner = (move.row === 0 || move.row === 7) && (move.col === 0 || move.col === 7);
      const score = move.flips.length + (isCorner ? 25 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    return best;
  }

  // Hard: Positional weights evaluation
  let best = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const posVal = POSITIONAL_WEIGHTS[move.row][move.col];
    const score = posVal + move.flips.length * 2;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}
