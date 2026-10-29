// client/src/games/pallanguzhi/bot.ts
import { BotDifficulty } from '../../types';

export const PITS_COUNT = 14;
export const P1_PITS = [0, 1, 2, 3, 4, 5, 6];
export const P2_PITS = [7, 8, 9, 10, 11, 12, 13];
export const INITIAL_SEEDS_PER_PIT = 5;

export interface PallanguzhiState {
  pits: number[]; // 14 pits
  stores: { p1: number; p2: number };
  currentTurn: 'p1' | 'p2';
  lastCaptured?: { pit: number; count: number; player: 'p1' | 'p2' };
  isOver: boolean;
  winner: 'p1' | 'p2' | 'tie' | null;
}

export function createInitialPallanguzhi(): PallanguzhiState {
  return {
    pits: Array(PITS_COUNT).fill(INITIAL_SEEDS_PER_PIT),
    stores: { p1: 0, p2: 0 },
    currentTurn: 'p1',
    isOver: false,
    winner: null
  };
}

export interface SowResult {
  nextState: PallanguzhiState;
  sowHistory: { pit: number; seedsInHand: number }[];
  capturedSeeds: number;
}

/**
 * Executes a full Pallanguzhi turn starting from pitIndex.
 * Supports continuous sowing, Pasu (4 seeds claim), and empty-cup captures.
 */
export function executePallanguzhiMove(
  state: PallanguzhiState,
  startPit: number,
  player: 'p1' | 'p2'
): SowResult {
  const pits = [...state.pits];
  const stores = { ...state.stores };
  const sowHistory: { pit: number; seedsInHand: number }[] = [];
  let totalCaptured = 0;

  if (pits[startPit] <= 0) {
    return { nextState: state, sowHistory: [], capturedSeeds: 0 };
  }

  let hand = pits[startPit];
  pits[startPit] = 0;
  let curr = startPit;

  while (hand > 0) {
    curr = (curr + 1) % PITS_COUNT;
    pits[curr]++;
    hand--;
    sowHistory.push({ pit: curr, seedsInHand: hand });

    // Check Pasu rule: if pit reaches 4 seeds, owner claims them
    if (pits[curr] === 4) {
      const pitOwner = P1_PITS.includes(curr) ? 'p1' : 'p2';
      stores[pitOwner] += 4;
      pits[curr] = 0;
      if (pitOwner === player) totalCaptured += 4;
    }

    // If hand is now empty, evaluate next pit for continuous sowing or capture
    if (hand === 0) {
      const nextPit = (curr + 1) % PITS_COUNT;
      if (pits[nextPit] > 0) {
        // Continuous sowing: pick up and keep going
        hand = pits[nextPit];
        pits[nextPit] = 0;
        curr = nextPit;
      } else {
        // Next pit is empty! Check capture pit (pit after next)
        const capturePit = (nextPit + 1) % PITS_COUNT;
        if (pits[capturePit] > 0) {
          const cap = pits[capturePit];
          pits[capturePit] = 0;
          stores[player] += cap;
          totalCaptured += cap;
        }
        // Turn ends after capture/empty check
        break;
      }
    }
  }

  // Check game over
  const nextTurn = player === 'p1' ? 'p2' : 'p1';
  const nextPits = nextTurn === 'p1' ? P1_PITS : P2_PITS;
  const nextHasMoves = nextPits.some(p => pits[p] > 0);
  const totalRemaining = pits.reduce((a, b) => a + b, 0);

  let isOver = false;
  let winner: 'p1' | 'p2' | 'tie' | null = null;

  if (!nextHasMoves || totalRemaining === 0) {
    // Collect remaining seeds to respective pit owners
    P1_PITS.forEach(p => { stores.p1 += pits[p]; pits[p] = 0; });
    P2_PITS.forEach(p => { stores.p2 += pits[p]; pits[p] = 0; });
    isOver = true;
    if (stores.p1 > stores.p2) {
      winner = 'p1';
    } else if (stores.p2 > stores.p1) {
      winner = 'p2';
    } else {
      winner = 'tie';
    }
  }

  return {
    nextState: {
      pits,
      stores,
      currentTurn: isOver ? player : nextTurn,
      lastCaptured: totalCaptured > 0 ? { pit: curr, count: totalCaptured, player } : undefined,
      isOver,
      winner
    },
    sowHistory,
    capturedSeeds: totalCaptured
  };
}


export function getPallanguzhiBotMove(
  state: PallanguzhiState,
  difficulty: BotDifficulty
): number {
  const validPits = P2_PITS.filter(p => state.pits[p] > 0);
  if (validPits.length === 0) return -1;
  if (validPits.length === 1 || difficulty === 'easy') {
    return validPits[Math.floor(Math.random() * validPits.length)];
  }

  // Medium / Hard: evaluate moves
  let bestScore = -9999;
  let bestPit = validPits[0];

  for (const pit of validPits) {
    const res = executePallanguzhiMove(state, pit, 'p2');
    let score = res.capturedSeeds * 2 + (res.nextState.stores.p2 - res.nextState.stores.p1);

    if (difficulty === 'hard') {
      // Lookahead: penalize if opponent can make a big capture on their next turn
      const opponentPits = P1_PITS.filter(p => res.nextState.pits[p] > 0);
      let maxOpponentGain = 0;
      for (const opPit of opponentPits) {
        const opRes = executePallanguzhiMove(res.nextState, opPit, 'p1');
        if (opRes.capturedSeeds > maxOpponentGain) {
          maxOpponentGain = opRes.capturedSeeds;
        }
      }
      score -= maxOpponentGain * 1.5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestPit = pit;
    }
  }

  return bestPit;
}
