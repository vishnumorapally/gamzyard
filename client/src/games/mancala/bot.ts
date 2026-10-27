// client/src/games/mancala/bot.ts
import { BotDifficulty } from '../../types';

export const P1_STORE = 6;
export const P2_STORE = 13;
export const P1_PITS = [0, 1, 2, 3, 4, 5];
export const P2_PITS = [7, 8, 9, 10, 11, 12];

export type MancalaBoard = number[]; // 14 indices

export function createInitialMancalaBoard(): MancalaBoard {
  const b = Array(14).fill(4);
  b[P1_STORE] = 0;
  b[P2_STORE] = 0;
  return b;
}

export interface SowResult {
  nextBoard: MancalaBoard;
  extraTurn: boolean;
  capturedCount: number;
}

export function sowMancalaStones(
  board: MancalaBoard,
  pitIndex: number,
  player: 'player1' | 'player2'
): SowResult {
  const next = [...board];
  let stones = next[pitIndex];
  next[pitIndex] = 0;

  const myStore = player === 'player1' ? P1_STORE : P2_STORE;
  const oppStore = player === 'player1' ? P2_STORE : P1_STORE;
  const myPits = player === 'player1' ? P1_PITS : P2_PITS;

  let current = pitIndex;
  while (stones > 0) {
    current = (current + 1) % 14;
    // Skip opponent's store
    if (current === oppStore) continue;

    next[current]++;
    stones--;
  }

  const extraTurn = current === myStore;
  let capturedCount = 0;

  // Capture rule: last stone in empty pit on my side and opposite has stones
  if (!extraTurn && myPits.includes(current) && next[current] === 1) {
    const oppPit = 12 - current;
    if (next[oppPit] > 0) {
      capturedCount = next[oppPit] + 1;
      next[myStore] += capturedCount;
      next[current] = 0;
      next[oppPit] = 0;
    }
  }

  return { nextBoard: next, extraTurn, capturedCount };
}

export function isMancalaGameOver(board: MancalaBoard): boolean {
  const p1Empty = P1_PITS.every(idx => board[idx] === 0);
  const p2Empty = P2_PITS.every(idx => board[idx] === 0);
  return p1Empty || p2Empty;
}

export function collectRemainingStones(board: MancalaBoard): MancalaBoard {
  const next = [...board];
  for (const idx of P1_PITS) {
    next[P1_STORE] += next[idx];
    next[idx] = 0;
  }
  for (const idx of P2_PITS) {
    next[P2_STORE] += next[idx];
    next[idx] = 0;
  }
  return next;
}

export function getMancalaBotMove(
  board: MancalaBoard,
  difficulty: BotDifficulty
): number | null {
  const availablePits = P2_PITS.filter(idx => board[idx] > 0);
  if (availablePits.length === 0) return null;

  if (difficulty === 'easy') {
    return availablePits[Math.floor(Math.random() * availablePits.length)];
  }

  // Find extra turn move (lands in P2_STORE 13)
  for (const pit of availablePits) {
    const { extraTurn } = sowMancalaStones(board, pit, 'player2');
    if (extraTurn) return pit;
  }

  // Find capture move
  let bestCapturePit: number | null = null;
  let maxCaptured = 0;
  for (const pit of availablePits) {
    const { capturedCount } = sowMancalaStones(board, pit, 'player2');
    if (capturedCount > maxCaptured) {
      maxCaptured = capturedCount;
      bestCapturePit = pit;
    }
  }
  if (bestCapturePit !== null && maxCaptured > 0) {
    return bestCapturePit;
  }

  // Medium / Hard: choose pit leaving highest stones in P2 store
  let bestPit = availablePits[0];
  let bestScore = -Infinity;
  for (const pit of availablePits) {
    const { nextBoard } = sowMancalaStones(board, pit, 'player2');
    const score = nextBoard[P2_STORE] - nextBoard[P1_STORE];
    if (score > bestScore) {
      bestScore = score;
      bestPit = pit;
    }
  }

  return bestPit;
}
