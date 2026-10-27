// client/src/games/gomoku/bot.ts
import { BotDifficulty } from '../../types';

export type GomokuStone = 'black' | 'white';
export type GomokuCell = GomokuStone | null;
export type GomokuBoard = GomokuCell[][];

export const GOMOKU_SIZE = 11; // 11x11 grid is ideal for mobile touch & tactical depth

const DIRS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal down-right
  [1, -1]   // diagonal down-left
];

export function createEmptyGomokuBoard(): GomokuBoard {
  return Array(GOMOKU_SIZE).fill(null).map(() => Array(GOMOKU_SIZE).fill(null));
}

export function checkGomokuWinner(
  board: GomokuBoard,
  lastR: number,
  lastC: number,
  color: GomokuStone
): [number, number][] | null {
  for (const [dr, dc] of DIRS) {
    const line: [number, number][] = [[lastR, lastC]];

    // forward
    let r = lastR + dr;
    let c = lastC + dc;
    while (r >= 0 && r < GOMOKU_SIZE && c >= 0 && c < GOMOKU_SIZE && board[r][c] === color) {
      line.push([r, c]);
      r += dr;
      c += dc;
    }

    // backward
    r = lastR - dr;
    c = lastC - dc;
    while (r >= 0 && r < GOMOKU_SIZE && c >= 0 && c < GOMOKU_SIZE && board[r][c] === color) {
      line.push([r, c]);
      r -= dr;
      c -= dc;
    }

    if (line.length >= 5) {
      return line;
    }
  }

  return null;
}

export function isGomokuFull(board: GomokuBoard): boolean {
  for (let r = 0; r < GOMOKU_SIZE; r++) {
    for (let c = 0; c < GOMOKU_SIZE; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

export function getGomokuBotMove(
  board: GomokuBoard,
  difficulty: BotDifficulty,
  botColor: GomokuStone
): { row: number; col: number } {
  const oppColor: GomokuStone = botColor === 'black' ? 'white' : 'black';
  const emptyCells: [number, number][] = [];

  for (let r = 0; r < GOMOKU_SIZE; r++) {
    for (let c = 0; c < GOMOKU_SIZE; c++) {
      if (board[r][c] === null) emptyCells.push([r, c]);
    }
  }

  if (emptyCells.length === 0) return { row: 5, col: 5 };

  // If board is empty, place center
  if (emptyCells.length === GOMOKU_SIZE * GOMOKU_SIZE) {
    const mid = Math.floor(GOMOKU_SIZE / 2);
    return { row: mid, col: mid };
  }

  if (difficulty === 'easy') {
    // Random move near existing stones
    const nearStones = emptyCells.filter(([r, c]) => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE && board[nr][nc] !== null) {
            return true;
          }
        }
      }
      return false;
    });
    const pool = nearStones.length > 0 ? nearStones : emptyCells;
    const [row, col] = pool[Math.floor(Math.random() * pool.length)];
    return { row, col };
  }

  // 1. Check if Bot can win immediately (5 in a row)
  for (const [r, c] of emptyCells) {
    board[r][c] = botColor;
    const win = checkGomokuWinner(board, r, c, botColor);
    board[r][c] = null;
    if (win) return { row: r, col: c };
  }

  // 2. Check if Opponent can win immediately -> BLOCK!
  for (const [r, c] of emptyCells) {
    board[r][c] = oppColor;
    const win = checkGomokuWinner(board, r, c, oppColor);
    board[r][c] = null;
    if (win) return { row: r, col: c };
  }

  // 3. Score potential moves by counting continuous lines
  let bestMove = emptyCells[0];
  let maxScore = -Infinity;

  for (const [r, c] of emptyCells) {
    let score = 0;
    // Distance from center preference
    const centerDist = Math.abs(r - 5) + Math.abs(c - 5);
    score -= centerDist;

    // Evaluate offense (bot) and defense (opp)
    for (const [dr, dc] of DIRS) {
      let botCount = 0;
      let oppCount = 0;
      for (let step = 1; step <= 4; step++) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < GOMOKU_SIZE && nc >= 0 && nc < GOMOKU_SIZE) {
          if (board[nr][nc] === botColor) botCount++;
          else if (board[nr][nc] === oppColor) oppCount++;
          else break;
        } else break;
      }
      score += Math.pow(botCount, 3) * 3;
      score += Math.pow(oppCount, 3) * 2;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMove = [r, c];
    }
  }

  return { row: bestMove[0], col: bestMove[1] };
}
