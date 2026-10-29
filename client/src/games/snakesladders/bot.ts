// client/src/games/snakesladders/bot.ts
import { BotDifficulty } from '../../types';

// Clean, non-overlapping tournament board mapping
export const SNAKES: Record<number, number> = {
  98: 79,
  95: 75,
  93: 73,
  87: 24,
  64: 60,
  62: 19,
  54: 34,
  17: 7
};

export const LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91
};

export type PlayerId = 'p1' | 'p2' | 'p3' | 'p4';

export interface SnakesPlayer {
  id: PlayerId;
  name: string;
  pos: number; // 1..100
  color: string;
  badgeClass: string;
  isBot: boolean;
}

export interface SnakesLaddersState {
  playerCount: number; // 2, 3, or 4
  players: SnakesPlayer[];
  currentTurnIndex: number;
  lastRoll: number | null;
  extraRoll: boolean;
  eventMessage: string;
  isOver: boolean;
  winner: SnakesPlayer | null;
}

export interface SnakesPlayerCustomConfig {
  name?: string;
  isBot?: boolean;
}

export function createInitialSnakesLadders(
  playerCount: number = 2,
  userConfigs?: SnakesPlayerCustomConfig[] | Partial<Record<PlayerId, string>>
): SnakesLaddersState {
  const isCustomArray = Array.isArray(userConfigs);
  const customMap = (!isCustomArray && userConfigs) ? (userConfigs as Partial<Record<PlayerId, string>>) : {};

  const configs: Omit<SnakesPlayer, 'pos'>[] = [
    {
      id: 'p1',
      name: (isCustomArray && userConfigs[0]?.name) || customMap.p1 || 'Player 1',
      color: '#10b981',
      badgeClass: 'bg-emerald-500 text-black ring-emerald-400',
      isBot: (isCustomArray && typeof userConfigs[0]?.isBot === 'boolean') ? userConfigs[0].isBot! : false
    },
    {
      id: 'p2',
      name: (isCustomArray && userConfigs[1]?.name) || customMap.p2 || (playerCount === 2 ? 'Player 2' : 'Player 2'),
      color: '#a855f7',
      badgeClass: 'bg-purple-500 text-white ring-purple-400',
      isBot: (isCustomArray && typeof userConfigs[1]?.isBot === 'boolean') ? userConfigs[1].isBot! : true
    },
    {
      id: 'p3',
      name: (isCustomArray && userConfigs[2]?.name) || customMap.p3 || 'Player 3',
      color: '#f59e0b',
      badgeClass: 'bg-amber-500 text-black ring-amber-400',
      isBot: (isCustomArray && typeof userConfigs[2]?.isBot === 'boolean') ? userConfigs[2].isBot! : true
    },
    {
      id: 'p4',
      name: (isCustomArray && userConfigs[3]?.name) || customMap.p4 || 'Player 4',
      color: '#06b6d4',
      badgeClass: 'bg-cyan-500 text-black ring-cyan-400',
      isBot: (isCustomArray && typeof userConfigs[3]?.isBot === 'boolean') ? userConfigs[3].isBot! : true
    }
  ];

  const players: SnakesPlayer[] = configs.slice(0, playerCount).map(c => ({
    ...c,
    pos: 1
  }));

  return {
    playerCount,
    players,
    currentTurnIndex: 0,
    lastRoll: null,
    extraRoll: false,
    eventMessage: 'Roll the die to begin the ascent!',
    isOver: false,
    winner: null
  };
}

export function getSquareCoord(sq: number): { r: number; c: number } {
  // sq: 1..100
  const zeroIdx = Math.max(0, Math.min(99, sq - 1));
  const rowFromBottom = Math.floor(zeroIdx / 10);
  const r = 9 - rowFromBottom; // 0 at top, 9 at bottom
  let c = zeroIdx % 10;
  if (rowFromBottom % 2 === 1) {
    // Alternating rows run right-to-left
    c = 9 - c;
  }
  return { r, c };
}

export function executeDiceMove(
  state: SnakesLaddersState,
  roll: number
): {
  nextState: SnakesLaddersState;
  landedSnake: boolean;
  landedLadder: boolean;
  finalPos: number;
  walkedPos: number;
} {
  const activePlayer = state.players[state.currentTurnIndex];
  const currPos = activePlayer.pos;
  let targetPos = currPos + roll;

  let landedSnake = false;
  let landedLadder = false;
  let eventMsg = `${activePlayer.name} rolled a ${roll}!`;

  // Standard rule: Exact roll to win. If overshoot 100, stay in place.
  if (targetPos > 100) {
    const needed = 100 - currPos;
    eventMsg = `${activePlayer.name} rolled a ${roll}, but needs exactly ${needed} to reach 100. Stays at tile ${currPos}.`;
    targetPos = currPos;
  } else {
    // Moved normally
    const walkedTarget = targetPos;

    if (LADDERS[walkedTarget]) {
      landedLadder = true;
      targetPos = LADDERS[walkedTarget];
      eventMsg = `🪜 LADDER! ${activePlayer.name} climbed from ${walkedTarget} up to ${targetPos}!`;
    } else if (SNAKES[walkedTarget]) {
      landedSnake = true;
      targetPos = SNAKES[walkedTarget];
      eventMsg = `🐍 SNAKE! ${activePlayer.name} bitten on tile ${walkedTarget} and slid to ${targetPos}!`;
    } else {
      eventMsg = `${activePlayer.name} advanced to tile ${targetPos}.`;
    }
  }

  const isWin = targetPos === 100;
  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentTurnIndex ? { ...p, pos: targetPos } : p
  );

  const extraRoll = roll === 6 && !isWin;
  const nextTurnIndex = isWin
    ? state.currentTurnIndex
    : extraRoll
    ? state.currentTurnIndex
    : (state.currentTurnIndex + 1) % state.playerCount;

  return {
    nextState: {
      ...state,
      players: updatedPlayers,
      currentTurnIndex: nextTurnIndex,
      lastRoll: roll,
      extraRoll,
      eventMessage: isWin ? `🏆 ${activePlayer.name} reached tile 100 and WON THE GAME!` : eventMsg,
      isOver: isWin,
      winner: isWin ? updatedPlayers[state.currentTurnIndex] : null
    },
    landedSnake,
    landedLadder,
    finalPos: targetPos,
    walkedPos: currPos + (targetPos > 100 ? 0 : roll)
  };
}
