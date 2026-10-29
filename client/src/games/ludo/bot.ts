// client/src/games/ludo/bot.ts
import { BotDifficulty } from '../../types';

export interface GridCoord {
  r: number;
  c: number;
}

// 52 common perimeter steps on 15x15 Ludo board (clockwise)
export const LUDO_TRACK: GridCoord[] = [
  /* 0: Red Start */ { r: 6, c: 1 },
  /* 1 */ { r: 6, c: 2 },
  /* 2 */ { r: 6, c: 3 },
  /* 3 */ { r: 6, c: 4 },
  /* 4 */ { r: 6, c: 5 },
  /* 5 */ { r: 5, c: 6 },
  /* 6 */ { r: 4, c: 6 },
  /* 7 */ { r: 3, c: 6 },
  /* 8: Safe Star */ { r: 2, c: 6 },
  /* 9 */ { r: 1, c: 6 },
  /* 10 */ { r: 0, c: 6 },
  /* 11 */ { r: 0, c: 7 },
  /* 12 */ { r: 0, c: 8 },
  /* 13: Green Start */ { r: 1, c: 8 },
  /* 14 */ { r: 2, c: 8 },
  /* 15 */ { r: 3, c: 8 },
  /* 16 */ { r: 4, c: 8 },
  /* 17 */ { r: 5, c: 8 },
  /* 18 */ { r: 6, c: 9 },
  /* 19 */ { r: 6, c: 10 },
  /* 20 */ { r: 6, c: 11 },
  /* 21: Safe Star */ { r: 6, c: 12 },
  /* 22 */ { r: 6, c: 13 },
  /* 23 */ { r: 6, c: 14 },
  /* 24 */ { r: 7, c: 14 },
  /* 25 */ { r: 8, c: 14 },
  /* 26: Yellow Start */ { r: 8, c: 13 },
  /* 27 */ { r: 8, c: 12 },
  /* 28 */ { r: 8, c: 11 },
  /* 29 */ { r: 8, c: 10 },
  /* 30 */ { r: 8, c: 9 },
  /* 31 */ { r: 9, c: 8 },
  /* 32 */ { r: 10, c: 8 },
  /* 33 */ { r: 11, c: 8 },
  /* 34: Safe Star */ { r: 12, c: 8 },
  /* 35 */ { r: 13, c: 8 },
  /* 36 */ { r: 14, c: 8 },
  /* 37 */ { r: 14, c: 7 },
  /* 38 */ { r: 14, c: 6 },
  /* 39: Blue Start */ { r: 13, c: 6 },
  /* 40 */ { r: 12, c: 6 },
  /* 41 */ { r: 11, c: 6 },
  /* 42 */ { r: 10, c: 6 },
  /* 43 */ { r: 9, c: 6 },
  /* 44 */ { r: 8, c: 5 },
  /* 45 */ { r: 8, c: 4 },
  /* 46 */ { r: 8, c: 3 },
  /* 47: Safe Star */ { r: 8, c: 2 },
  /* 48 */ { r: 8, c: 1 },
  /* 49 */ { r: 8, c: 0 },
  /* 50 */ { r: 7, c: 0 },
  /* 51 */ { r: 6, c: 0 }
];

// Home stretch columns leading to center (steps 51..56)
export const RED_HOME_STRETCH: GridCoord[] = [
  { r: 7, c: 1 },
  { r: 7, c: 2 },
  { r: 7, c: 3 },
  { r: 7, c: 4 },
  { r: 7, c: 5 },
  { r: 7, c: 6 } // Center Home
];

export const GREEN_HOME_STRETCH: GridCoord[] = [
  { r: 1, c: 7 },
  { r: 2, c: 7 },
  { r: 3, c: 7 },
  { r: 4, c: 7 },
  { r: 5, c: 7 },
  { r: 6, c: 7 } // Center Home
];

export const YELLOW_HOME_STRETCH: GridCoord[] = [
  { r: 7, c: 13 },
  { r: 7, c: 12 },
  { r: 7, c: 11 },
  { r: 7, c: 10 },
  { r: 7, c: 9 },
  { r: 7, c: 8 } // Center Home
];

export const BLUE_HOME_STRETCH: GridCoord[] = [
  { r: 13, c: 7 },
  { r: 12, c: 7 },
  { r: 11, c: 7 },
  { r: 10, c: 7 },
  { r: 9, c: 7 },
  { r: 8, c: 7 } // Center Home
];

// Safe star indices on LUDO_TRACK
export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export function isSafeTrackIndex(idx: number): boolean {
  return SAFE_TRACK_INDICES.includes(idx);
}

// 4 Yard base slot positions (row, col)
export const RED_YARD_SLOTS: GridCoord[] = [
  { r: 1.5, c: 1.5 },
  { r: 1.5, c: 3.5 },
  { r: 3.5, c: 1.5 },
  { r: 3.5, c: 3.5 }
];

export const GREEN_YARD_SLOTS: GridCoord[] = [
  { r: 1.5, c: 10.5 },
  { r: 1.5, c: 12.5 },
  { r: 3.5, c: 10.5 },
  { r: 3.5, c: 12.5 }
];

export const YELLOW_YARD_SLOTS: GridCoord[] = [
  { r: 10.5, c: 10.5 },
  { r: 10.5, c: 12.5 },
  { r: 12.5, c: 10.5 },
  { r: 12.5, c: 12.5 }
];

export const BLUE_YARD_SLOTS: GridCoord[] = [
  { r: 10.5, c: 1.5 },
  { r: 10.5, c: 3.5 },
  { r: 12.5, c: 1.5 },
  { r: 12.5, c: 3.5 }
];

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoToken {
  id: number;
  color: LudoColor;
  // step: -1 = in yard, 0..50 = common track, 51..55 = home stretch, 56 = Home Goal!
  step: number;
  isHome: boolean;
}

export interface LudoPlayer {
  id: string; // 'p1' | 'p2' | 'p3' | 'p4'
  name: string;
  color: LudoColor;
  tokens: LudoToken[];
  isBot: boolean;
  startTrackIndex: number;
  homeStretch: GridCoord[];
  yardSlots: GridCoord[];
}

export interface LudoState {
  playerCount: number; // 2, 3, or 4
  players: LudoPlayer[];
  currentTurnIndex: number;
  lastRoll: number | null;
  canRoll: boolean;
  consecutiveSixes: number;
  isOver: boolean;
  winner: LudoPlayer | null;
}

export interface LudoPlayerCustomConfig {
  name?: string;
  isBot?: boolean;
}

export function createInitialLudo(
  playerCount: number = 4,
  customPlayers?: LudoPlayerCustomConfig[] | Partial<Record<string, string>>
): LudoState {
  const isCustomArray = Array.isArray(customPlayers);
  const customMap = (!isCustomArray && customPlayers) ? (customPlayers as Partial<Record<string, string>>) : {};

  const allConfigs: Omit<LudoPlayer, 'tokens'>[] = [
    {
      id: 'p1',
      name: (isCustomArray && customPlayers[0]?.name) || customMap.p1 || 'Player 1 (Red)',
      color: 'red',
      isBot: (isCustomArray && typeof customPlayers[0]?.isBot === 'boolean') ? customPlayers[0].isBot! : false,
      startTrackIndex: 0,
      homeStretch: RED_HOME_STRETCH,
      yardSlots: RED_YARD_SLOTS
    },
    {
      id: 'p2',
      name: (isCustomArray && customPlayers[1]?.name) || customMap.p2 || (playerCount === 2 ? 'Player 2 (Yellow)' : 'Player 2 (Green)'),
      color: playerCount === 2 ? 'yellow' : 'green',
      isBot: (isCustomArray && typeof customPlayers[1]?.isBot === 'boolean') ? customPlayers[1].isBot! : true,
      startTrackIndex: playerCount === 2 ? 26 : 13,
      homeStretch: playerCount === 2 ? YELLOW_HOME_STRETCH : GREEN_HOME_STRETCH,
      yardSlots: playerCount === 2 ? YELLOW_YARD_SLOTS : GREEN_YARD_SLOTS
    },
    {
      id: 'p3',
      name: (isCustomArray && customPlayers[2]?.name) || customMap.p3 || 'Player 3 (Yellow)',
      color: 'yellow',
      isBot: (isCustomArray && typeof customPlayers[2]?.isBot === 'boolean') ? customPlayers[2].isBot! : true,
      startTrackIndex: 26,
      homeStretch: YELLOW_HOME_STRETCH,
      yardSlots: YELLOW_YARD_SLOTS
    },
    {
      id: 'p4',
      name: (isCustomArray && customPlayers[3]?.name) || customMap.p4 || 'Player 4 (Blue)',
      color: 'blue',
      isBot: (isCustomArray && typeof customPlayers[3]?.isBot === 'boolean') ? customPlayers[3].isBot! : true,
      startTrackIndex: 39,
      homeStretch: BLUE_HOME_STRETCH,
      yardSlots: BLUE_YARD_SLOTS
    }
  ];

  const selectedConfigs = playerCount === 2
    ? [allConfigs[0], allConfigs[1]] // Red vs Yellow (opposite)
    : allConfigs.slice(0, playerCount);

  const players: LudoPlayer[] = selectedConfigs.map(c => ({
    ...c,
    tokens: [0, 1, 2, 3].map(id => ({
      id,
      color: c.color,
      step: -1,
      isHome: false
    }))
  }));

  return {
    playerCount,
    players,
    currentTurnIndex: 0,
    lastRoll: null,
    canRoll: true,
    consecutiveSixes: 0,
    isOver: false,
    winner: null
  };
}

export function getTokenCoord(token: LudoToken, player: LudoPlayer): GridCoord {
  if (token.isHome || token.step === 56) {
    return player.homeStretch[5];
  }
  if (token.step === -1) {
    return player.yardSlots[token.id];
  }
  if (token.step >= 0 && token.step <= 50) {
    const trackIndex = (player.startTrackIndex + token.step) % 52;
    return LUDO_TRACK[trackIndex];
  }
  if (token.step >= 51 && token.step <= 55) {
    const homeIndex = token.step - 51;
    return player.homeStretch[homeIndex];
  }
  return player.homeStretch[5];
}

export function getMovableTokenIds(state: LudoState, roll: number): number[] {
  const player = state.players[state.currentTurnIndex];
  if (!player || state.isOver) return [];

  const movable: number[] = [];
  player.tokens.forEach(t => {
    if (t.isHome) return;
    if (t.step === -1) {
      if (roll === 6) movable.push(t.id);
    } else {
      if (t.step + roll <= 56) {
        movable.push(t.id);
      }
    }
  });

  return movable;
}

export function moveTokenState(
  state: LudoState,
  tokenId: number
): {
  nextState: LudoState;
  captured: boolean;
  stepsPath: GridCoord[];
} {
  const activePlayer = state.players[state.currentTurnIndex];
  const roll = state.lastRoll || 1;
  const token = activePlayer.tokens.find(t => t.id === tokenId);
  if (!token) return { nextState: state, captured: false, stepsPath: [] };

  const stepsPath: GridCoord[] = [];
  let nextStep = token.step;

  if (token.step === -1) {
    // Release onto start square
    nextStep = 0;
    stepsPath.push(LUDO_TRACK[activePlayer.startTrackIndex]);
  } else {
    // Walk step by step
    for (let s = 1; s <= roll; s++) {
      const interim = token.step + s;
      const interimCoord = getTokenCoord({ ...token, step: interim }, activePlayer);
      stepsPath.push(interimCoord);
    }
    nextStep = token.step + roll;
  }

  const reachedGoal = nextStep === 56;
  let captured = false;

  // Clone players
  const updatedPlayers = state.players.map((p, pIdx) => {
    if (pIdx === state.currentTurnIndex) {
      return {
        ...p,
        tokens: p.tokens.map(t =>
          t.id === tokenId
            ? { ...t, step: nextStep, isHome: reachedGoal }
            : t
        )
      };
    }
    return p;
  });

  // Check captures if landing on common track (0..50)
  if (nextStep >= 0 && nextStep <= 50) {
    const landingTrackIndex = (activePlayer.startTrackIndex + nextStep) % 52;
    const isSafe = isSafeTrackIndex(landingTrackIndex);

    if (!isSafe) {
      // Check other players
      for (let pIdx = 0; pIdx < updatedPlayers.length; pIdx++) {
        if (pIdx === state.currentTurnIndex) continue;
        const opponent = updatedPlayers[pIdx];

        opponent.tokens.forEach(ot => {
          if (!ot.isHome && ot.step >= 0 && ot.step <= 50) {
            const oppTrackIndex = (opponent.startTrackIndex + ot.step) % 52;
            if (oppTrackIndex === landingTrackIndex) {
              // Captured! Send back to yard
              ot.step = -1;
              captured = true;
            }
          }
        });
      }
    }
  }

  // Check victory
  const updatedActive = updatedPlayers[state.currentTurnIndex];
  const allHome = updatedActive.tokens.every(t => t.isHome);

  // Bonus turn on rolling 6, capture, or reaching home goal
  const bonusTurn = roll === 6 || captured || reachedGoal;
  const nextTurnIndex = allHome
    ? state.currentTurnIndex
    : bonusTurn
    ? state.currentTurnIndex
    : (state.currentTurnIndex + 1) % state.playerCount;

  return {
    nextState: {
      ...state,
      players: updatedPlayers,
      currentTurnIndex: nextTurnIndex,
      lastRoll: null,
      canRoll: true,
      consecutiveSixes: roll === 6 ? state.consecutiveSixes + 1 : 0,
      isOver: allHome,
      winner: allHome ? updatedActive : null
    },
    captured,
    stepsPath
  };
}

export function getLudoBotChoice(
  state: LudoState,
  movableIds: number[],
  difficulty: BotDifficulty = 'medium'
): number {
  if (movableIds.length === 1) return movableIds[0];
  const activePlayer = state.players[state.currentTurnIndex];
  const roll = state.lastRoll || 1;

  // 1. Prioritize finishing in home
  for (const id of movableIds) {
    const t = activePlayer.tokens.find(tok => tok.id === id);
    if (t && t.step !== -1 && t.step + roll === 56) return id;
  }

  // 2. Prioritize capturing an opponent
  for (const id of movableIds) {
    const t = activePlayer.tokens.find(tok => tok.id === id);
    if (!t) continue;
    const landingStep = t.step === -1 ? 0 : t.step + roll;
    if (landingStep <= 50) {
      const trackIdx = (activePlayer.startTrackIndex + landingStep) % 52;
      if (!isSafeTrackIndex(trackIdx)) {
        for (let pIdx = 0; pIdx < state.players.length; pIdx++) {
          if (pIdx === state.currentTurnIndex) continue;
          const opp = state.players[pIdx];
          const canCut = opp.tokens.some(ot => {
            if (!ot.isHome && ot.step >= 0 && ot.step <= 50) {
              const oppTrack = (opp.startTrackIndex + ot.step) % 52;
              return oppTrack === trackIdx;
            }
            return false;
          });
          if (canCut) return id;
        }
      }
    }
  }

  // 3. Prioritize releasing token from base on 6
  if (roll === 6) {
    const inYard = movableIds.find(id => activePlayer.tokens.find(t => t.id === id)?.step === -1);
    if (inYard !== undefined) return inYard;
  }

  // 4. Advance furthest ahead
  let bestId = movableIds[0];
  let maxStep = -999;
  for (const id of movableIds) {
    const t = activePlayer.tokens.find(tok => tok.id === id);
    if (t && t.step > maxStep) {
      maxStep = t.step;
      bestId = id;
    }
  }
  return bestId;
}
