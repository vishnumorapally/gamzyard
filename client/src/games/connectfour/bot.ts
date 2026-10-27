// client/src/games/connectfour/bot.ts
import { BotDifficulty } from '../../types';

export const ROWS = 6;
export const COLS = 7;

export type CellValue = 'red' | 'yellow' | null;
export type ConnectBoard = CellValue[][];

export function createEmptyBoard(): ConnectBoard {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function getLowestEmptyRow(board: ConnectBoard, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      return r;
    }
  }
  return -1;
}

export function checkConnectFourWinner(board: ConnectBoard): {
  winner: CellValue;
  winningCoords: [number, number][] | null;
} {
  // Horizontal check
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const piece = board[r][c];
      if (
        piece &&
        piece === board[r][c + 1] &&
        piece === board[r][c + 2] &&
        piece === board[r][c + 3]
      ) {
        return {
          winner: piece,
          winningCoords: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]]
        };
      }
    }
  }

  // Vertical check
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const piece = board[r][c];
      if (
        piece &&
        piece === board[r + 1][c] &&
        piece === board[r + 2][c] &&
        piece === board[r + 3][c]
      ) {
        return {
          winner: piece,
          winningCoords: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]]
        };
      }
    }
  }

  // Diagonal Down-Right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const piece = board[r][c];
      if (
        piece &&
        piece === board[r + 1][c + 1] &&
        piece === board[r + 2][c + 2] &&
        piece === board[r + 3][c + 3]
      ) {
        return {
          winner: piece,
          winningCoords: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]]
        };
      }
    }
  }

  // Diagonal Up-Right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const piece = board[r][c];
      if (
        piece &&
        piece === board[r - 1][c + 1] &&
        piece === board[r - 2][c + 2] &&
        piece === board[r - 3][c + 3]
      ) {
        return {
          winner: piece,
          winningCoords: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]]
        };
      }
    }
  }

  return { winner: null, winningCoords: null };
}

export function isConnectBoardFull(board: ConnectBoard): boolean {
  return board[0].every(cell => cell !== null);
}

function evaluateWindow(window: CellValue[], piece: CellValue): number {
  let score = 0;
  const oppPiece = piece === 'yellow' ? 'red' : 'yellow';

  const pieceCount = window.filter(c => c === piece).length;
  const emptyCount = window.filter(c => c === null).length;
  const oppCount = window.filter(c => c === oppPiece).length;

  if (pieceCount === 4) score += 1000;
  else if (pieceCount === 3 && emptyCount === 1) score += 20;
  else if (pieceCount === 2 && emptyCount === 2) score += 5;

  if (oppCount === 3 && emptyCount === 1) score -= 80;

  return score;
}

function scoreBoard(board: ConnectBoard, piece: CellValue): number {
  let score = 0;

  // Center column priority
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === piece) centerCount++;
  }
  score += centerCount * 6;

  // Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const win = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(win, piece);
    }
  }

  // Vertical windows
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const win = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(win, piece);
    }
  }

  // Diagonal Down-Right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const win = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(win, piece);
    }
  }

  // Diagonal Up-Right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const win = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += evaluateWindow(win, piece);
    }
  }

  return score;
}

export function getConnectFourBotMove(
  board: ConnectBoard,
  difficulty: BotDifficulty,
  botPiece: CellValue = 'yellow',
  humanPiece: CellValue = 'red'
): number {
  const validCols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) validCols.push(c);
  }

  if (validCols.length === 0) return 0;

  // 1. Easy Mode
  if (difficulty === 'easy') {
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  // 2. Medium & Hard: Check 1-step win
  for (const c of validCols) {
    const r = getLowestEmptyRow(board, c);
    board[r][c] = botPiece;
    const { winner } = checkConnectFourWinner(board);
    board[r][c] = null;
    if (winner === botPiece) return c;
  }

  // Check 1-step block of human
  for (const c of validCols) {
    const r = getLowestEmptyRow(board, c);
    board[r][c] = humanPiece;
    const { winner } = checkConnectFourWinner(board);
    board[r][c] = null;
    if (winner === humanPiece) return c;
  }

  if (difficulty === 'medium') {
    // Prefer center-most available columns
    const preferredCols = [3, 2, 4, 1, 5, 0, 6];
    for (const c of preferredCols) {
      if (validCols.includes(c)) return c;
    }
    return validCols[0];
  }

  // 3. Hard Mode: Minimax with depth 3
  let bestScore = -Infinity;
  let bestCol = validCols[0];

  for (const c of validCols) {
    const r = getLowestEmptyRow(board, c);
    board[r][c] = botPiece;
    const score = scoreBoard(board, botPiece);
    board[r][c] = null;

    if (score > bestScore) {
      bestScore = score;
      bestCol = c;
    }
  }

  return bestCol;
}
