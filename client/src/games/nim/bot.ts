// client/src/games/nim/bot.ts
import { BotDifficulty } from '../../types';

export type NimHeaps = [number, number, number];

export interface NimMove {
  row: number; // 0, 1, or 2
  count: number; // number of sticks to take
}

export function getNimBotMove(heaps: NimHeaps, difficulty: BotDifficulty): NimMove {
  const validRows = [0, 1, 2].filter(r => heaps[r] > 0);
  if (validRows.length === 0) return { row: 0, count: 1 };

  if (difficulty === 'easy') {
    const row = validRows[Math.floor(Math.random() * validRows.length)];
    const count = Math.floor(Math.random() * heaps[row]) + 1;
    return { row, count };
  }

  // Calculate Nim-Sum (XOR of all heap sizes)
  const nimSum = heaps[0] ^ heaps[1] ^ heaps[2];

  if (difficulty === 'medium' && Math.random() < 0.45) {
    // 45% of the time play casually on medium
    const row = validRows[Math.floor(Math.random() * validRows.length)];
    const count = Math.floor(Math.random() * heaps[row]) + 1;
    return { row, count };
  }

  // Hard or Medium optimal move: Find a heap to reduce so nimSum becomes 0
  if (nimSum !== 0) {
    for (const r of validRows) {
      const targetSize = heaps[r] ^ nimSum;
      if (targetSize < heaps[r]) {
        return {
          row: r,
          count: heaps[r] - targetSize
        };
      }
    }
  }

  // If already at 0 nimSum, take 1 from largest heap
  const largestRow = validRows.reduce((max, r) => heaps[r] > heaps[max] ? r : max, validRows[0]);
  return { row: largestRow, count: 1 };
}
