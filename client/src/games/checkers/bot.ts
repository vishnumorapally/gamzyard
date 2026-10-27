// client/src/games/checkers/bot.ts
import { BotDifficulty } from '../../types';

export type CheckersPieceColor = 'red' | 'black';

export interface CheckersPiece {
  color: CheckersPieceColor;
  isKing: boolean;
}

export type CheckersBoard = (CheckersPiece | null)[][];

export interface CheckersMove {
  from: [number, number];
  to: [number, number];
  jumps?: [number, number][]; // jumped piece positions
  isPromotion?: boolean;
}

export function initCheckersBoard(): CheckersBoard {
  const board: CheckersBoard = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Rows 0, 1, 2: Black pieces on dark squares ((r + c) % 2 === 1)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { color: 'black', isKing: false };
      }
    }
  }

  // Rows 5, 6, 7: Red pieces on dark squares
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { color: 'red', isKing: false };
      }
    }
  }

  return board;
}

export function getLegalMovesForPiece(
  board: CheckersBoard,
  r: number,
  c: number
): CheckersMove[] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: CheckersMove[] = [];
  const directions: [number, number][] = [];

  // Red moves UP (dr = -1), Black moves DOWN (dr = +1)
  if (piece.color === 'red' || piece.isKing) {
    directions.push([-1, -1], [-1, 1]);
  }
  if (piece.color === 'black' || piece.isKing) {
    directions.push([1, -1], [1, 1]);
  }

  // Check 1-step moves
  for (const [dr, dc] of directions) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === null) {
      const isPromotion = (piece.color === 'red' && nr === 0) || (piece.color === 'black' && nr === 7);
      moves.push({
        from: [r, c],
        to: [nr, nc],
        isPromotion
      });
    }
  }

  // Check Jumps (Captures)
  for (const [dr, dc] of directions) {
    const midR = r + dr;
    const midC = c + dc;
    const landR = r + 2 * dr;
    const landC = c + 2 * dc;

    if (
      landR >= 0 && landR < 8 &&
      landC >= 0 && landC < 8 &&
      board[landR][landC] === null
    ) {
      const midPiece = board[midR][midC];
      if (midPiece && midPiece.color !== piece.color) {
        const isPromotion = (piece.color === 'red' && landR === 0) || (piece.color === 'black' && landR === 7);
        moves.push({
          from: [r, c],
          to: [landR, landC],
          jumps: [[midR, midC]],
          isPromotion
        });
      }
    }
  }

  return moves;
}

export function getAllLegalMoves(
  board: CheckersBoard,
  color: CheckersPieceColor
): CheckersMove[] {
  const moves: CheckersMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === color) {
        moves.push(...getLegalMovesForPiece(board, r, c));
      }
    }
  }

  // Mandatory capture rule: If jumps are available, non-jump moves can be filtered or prioritized
  const jumpMoves = moves.filter(m => m.jumps && m.jumps.length > 0);
  return jumpMoves.length > 0 ? jumpMoves : moves;
}

export function applyCheckersMove(board: CheckersBoard, move: CheckersMove): CheckersBoard {
  const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;

  const piece = newBoard[fr][fc];
  if (!piece) return newBoard;

  newBoard[fr][fc] = null;
  newBoard[tr][tc] = piece;

  if (move.isPromotion) {
    piece.isKing = true;
  }

  if (move.jumps) {
    for (const [jr, jc] of move.jumps) {
      newBoard[jr][jc] = null;
    }
  }

  return newBoard;
}

export function getCheckersBotMove(
  board: CheckersBoard,
  difficulty: BotDifficulty,
  botColor: CheckersPieceColor = 'black'
): CheckersMove | null {
  const legalMoves = getAllLegalMoves(board, botColor);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'easy') {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Medium / Hard: Evaluate captures and king promotions
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;
    if (move.jumps && move.jumps.length > 0) score += 50;
    if (move.isPromotion) score += 40;

    // Favor advancing towards center/king
    score += (botColor === 'black' ? move.to[0] : (7 - move.to[0])) * 3;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
