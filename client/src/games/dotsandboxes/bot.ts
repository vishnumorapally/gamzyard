// client/src/games/dotsandboxes/bot.ts
import { BotDifficulty } from '../../types';

// 5x5 boxes = 6x6 dots (25 total boxes - deep strategic tournament depth)
export const GRID_DOTS = 6;
export const BOX_COUNT = 5;

export type LineId = string; // "h_r_c" or "v_r_c"

export interface BoxState {
  owner: 'player1' | 'player2' | null;
}

export function getAllPossibleLines(): LineId[] {
  const lines: LineId[] = [];
  // Horizontal lines: (GRID_DOTS rows) x (BOX_COUNT cols) = 6 x 5 = 30
  for (let r = 0; r < GRID_DOTS; r++) {
    for (let c = 0; c < BOX_COUNT; c++) {
      lines.push(`h_${r}_${c}`);
    }
  }
  // Vertical lines: (BOX_COUNT rows) x (GRID_DOTS cols) = 5 x 6 = 30
  for (let r = 0; r < BOX_COUNT; r++) {
    for (let c = 0; c < GRID_DOTS; c++) {
      lines.push(`v_${r}_${c}`);
    }
  }
  return lines;
}

export function getBoxBorders(r: number, c: number): LineId[] {
  return [
    `h_${r}_${c}`,     // top
    `h_${r + 1}_${c}`, // bottom
    `v_${r}_${c}`,     // left
    `v_${r}_${c + 1}`  // right
  ];
}

export function getCompletedBoxes(
  lines: Set<LineId>,
  newOwner: 'player1' | 'player2',
  boxes: Record<string, 'player1' | 'player2'>
): { newBoxKeys: string[]; newlyCompletedCount: number } {
  const newBoxKeys: string[] = [];

  for (let r = 0; r < BOX_COUNT; r++) {
    for (let c = 0; c < BOX_COUNT; c++) {
      const key = `${r}_${c}`;
      if (!boxes[key]) {
        const borders = getBoxBorders(r, c);
        if (borders.every(b => lines.has(b))) {
          newBoxKeys.push(key);
        }
      }
    }
  }

  return { newBoxKeys, newlyCompletedCount: newBoxKeys.length };
}

// Counts how many sides of a box are currently drawn
export function getBoxSidesDrawn(r: number, c: number, lines: Set<LineId>): number {
  const borders = getBoxBorders(r, c);
  return borders.filter(b => lines.has(b)).length;
}

export function getDotsBotMove(
  drawnLines: Set<LineId>,
  boxes: Record<string, 'player1' | 'player2'>,
  difficulty: BotDifficulty
): LineId | null {
  const allLines = getAllPossibleLines();
  const availableLines = allLines.filter(l => !drawnLines.has(l));
  if (availableLines.length === 0) return null;

  if (difficulty === 'easy') {
    return availableLines[Math.floor(Math.random() * availableLines.length)];
  }

  // 1. Any move that completes a box immediately
  const winningMoves: LineId[] = [];
  const safeMoves: LineId[] = [];
  const dangerousMoves: { line: LineId; penalty: number }[] = [];

  for (const line of availableLines) {
    const testSet = new Set(drawnLines);
    testSet.add(line);

    let completesCount = 0;
    let createsThirdSide = false;

    for (let r = 0; r < BOX_COUNT; r++) {
      for (let c = 0; c < BOX_COUNT; c++) {
        const key = `${r}_${c}`;
        if (!boxes[key]) {
          const borders = getBoxBorders(r, c);
          if (borders.includes(line)) {
            const sidesDrawn = borders.filter(b => testSet.has(b)).length;
            if (sidesDrawn === 4) {
              completesCount++;
            } else if (sidesDrawn === 3) {
              createsThirdSide = true;
            }
          }
        }
      }
    }

    if (completesCount > 0) {
      winningMoves.push(line);
    } else if (!createsThirdSide) {
      safeMoves.push(line);
    } else {
      dangerousMoves.push({ line, penalty: createsThirdSide ? 1 : 0 });
    }
  }

  // Priority 1: Take any box!
  if (winningMoves.length > 0) {
    return winningMoves[0];
  }

  // Priority 2: Safe move (does not give away 3rd side)
  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // Priority 3: Forced sacrifice
  if (difficulty === 'hard' && dangerousMoves.length > 0) {
    dangerousMoves.sort((a, b) => a.penalty - b.penalty);
    return dangerousMoves[0].line;
  }

  return availableLines[Math.floor(Math.random() * availableLines.length)];
}
