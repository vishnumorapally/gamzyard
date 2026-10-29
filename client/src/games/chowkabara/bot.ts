// client/src/games/chowkabara/bot.ts
import { BotDifficulty } from '../../types';

export interface Coord {
  r: number;
  c: number;
}

// 5x5 board safe cells
export const SAFE_CELLS: Coord[] = [
  { r: 4, c: 2 }, // P1 Home
  { r: 0, c: 2 }, // P2 Home
  { r: 2, c: 0 }, // Left safe
  { r: 2, c: 4 }, // Right safe
  { r: 2, c: 2 }  // Center goal
];

export function isSafeCell(r: number, c: number): boolean {
  return SAFE_CELLS.some(sc => sc.r === r && sc.c === c);
}

// P1 Track (25 steps: index 0 to 24, where 24 is center home)
export const P1_TRACK: Coord[] = [
  { r: 4, c: 2 }, // 0: Start
  { r: 4, c: 1 }, // 1
  { r: 4, c: 0 }, // 2
  { r: 3, c: 0 }, // 3
  { r: 2, c: 0 }, // 4: Safe
  { r: 1, c: 0 }, // 5
  { r: 0, c: 0 }, // 6
  { r: 0, c: 1 }, // 7
  { r: 0, c: 2 }, // 8: P2 Base Safe
  { r: 0, c: 3 }, // 9
  { r: 0, c: 4 }, // 10
  { r: 1, c: 4 }, // 11
  { r: 2, c: 4 }, // 12: Safe
  { r: 3, c: 4 }, // 13
  { r: 4, c: 4 }, // 14
  { r: 4, c: 3 }, // 15
  // Enter Inner Track
  { r: 3, c: 3 }, // 16
  { r: 3, c: 2 }, // 17
  { r: 3, c: 1 }, // 18
  { r: 2, c: 1 }, // 19
  { r: 1, c: 1 }, // 20
  { r: 1, c: 2 }, // 21
  { r: 1, c: 3 }, // 22
  { r: 2, c: 3 }, // 23
  { r: 2, c: 2 }  // 24: Center Home Goal
];

// P2 Track (25 steps: index 0 to 24, where 24 is center home)
export const P2_TRACK: Coord[] = [
  { r: 0, c: 2 }, // 0: Start
  { r: 0, c: 3 }, // 1
  { r: 0, c: 4 }, // 2
  { r: 1, c: 4 }, // 3
  { r: 2, c: 4 }, // 4: Safe
  { r: 3, c: 4 }, // 5
  { r: 4, c: 4 }, // 6
  { r: 4, c: 3 }, // 7
  { r: 4, c: 2 }, // 8: P1 Base Safe
  { r: 4, c: 1 }, // 9
  { r: 4, c: 0 }, // 10
  { r: 3, c: 0 }, // 11
  { r: 2, c: 0 }, // 12: Safe
  { r: 1, c: 0 }, // 13
  { r: 0, c: 0 }, // 14
  { r: 0, c: 1 }, // 15
  // Enter Inner Track
  { r: 1, c: 1 }, // 16
  { r: 1, c: 2 }, // 17
  { r: 1, c: 3 }, // 18
  { r: 2, c: 3 }, // 19
  { r: 3, c: 3 }, // 20
  { r: 3, c: 2 }, // 21
  { r: 3, c: 1 }, // 22
  { r: 2, c: 1 }, // 23
  { r: 2, c: 2 }  // 24: Center Home Goal
];

export interface Pawn {
  id: number;
  step: number; // -1 = at base / yard, 0..24 = along track
  isHome: boolean;
}

export interface ChowkaBaraState {
  p1Pawns: Pawn[];
  p2Pawns: Pawn[];
  currentTurn: 'p1' | 'p2';
  lastRoll: number | null;
  cowrieShells: boolean[]; // 4 shells: true = mouth UP, false = mouth DOWN
  canRoll: boolean;
  extraTurn: boolean;
  p1Kills: number;
  p2Kills: number;
  isOver: boolean;
  winner: 'p1' | 'p2' | null;
}

export function createInitialChowkaBara(): ChowkaBaraState {
  return {
    p1Pawns: [
      { id: 0, step: -1, isHome: false },
      { id: 1, step: -1, isHome: false },
      { id: 2, step: -1, isHome: false }
    ],
    p2Pawns: [
      { id: 0, step: -1, isHome: false },
      { id: 1, step: -1, isHome: false },
      { id: 2, step: -1, isHome: false }
    ],
    currentTurn: 'p1',
    lastRoll: null,
    cowrieShells: [false, true, true, false],
    canRoll: true,
    extraTurn: false,
    p1Kills: 0,
    p2Kills: 0,
    isOver: false,
    winner: null
  };
}

/**
 * Rolls 4 cowrie shells:
 * 0 mouths up = Chowka (4) + Extra Turn
 * 1 mouth up = 1
 * 2 mouths up = 2
 * 3 mouths up = 3
 * 4 mouths up = Ashta (8) + Extra Turn
 */
export function rollCowries(): { roll: number; shells: boolean[]; extraTurn: boolean } {
  const shells = [
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5
  ];
  const mouthsUp = shells.filter(Boolean).length;

  let roll = 1;
  let extraTurn = false;

  if (mouthsUp === 0) {
    roll = 4; // Chowka
    extraTurn = true;
  } else if (mouthsUp === 1) {
    roll = 1;
  } else if (mouthsUp === 2) {
    roll = 2;
  } else if (mouthsUp === 3) {
    roll = 3;
  } else if (mouthsUp === 4) {
    roll = 8; // Ashta
    extraTurn = true;
  }

  return { roll, shells, extraTurn };
}

export function getMovablePawns(
  state: ChowkaBaraState,
  player: 'p1' | 'p2',
  roll: number
): number[] {
  const pawns = player === 'p1' ? state.p1Pawns : state.p2Pawns;
  const movable: number[] = [];

  pawns.forEach(p => {
    if (p.isHome) return;
    if (p.step === -1) {
      // Must roll 1, 4, or 8 to spawn out of yard
      if (roll === 1 || roll === 4 || roll === 8) {
        movable.push(p.id);
      }
    } else {
      const nextStep = p.step + roll;
      if (nextStep <= 24) {
        movable.push(p.id);
      }
    }
  });

  return movable;
}

export function movePawn(
  state: ChowkaBaraState,
  pawnId: number
): { nextState: ChowkaBaraState; killedOpponent: boolean } {
  const isP1 = state.currentTurn === 'p1';
  const myPawns = isP1 ? [...state.p1Pawns] : [...state.p2Pawns];
  const opPawns = isP1 ? [...state.p2Pawns] : [...state.p1Pawns];
  const myTrack = isP1 ? P1_TRACK : P2_TRACK;
  const opTrack = isP1 ? P2_TRACK : P1_TRACK;

  const roll = state.lastRoll || 0;
  const pawnIdx = myPawns.findIndex(p => p.id === pawnId);
  if (pawnIdx === -1) return { nextState: state, killedOpponent: false };

  const pawn = { ...myPawns[pawnIdx] };
  let killedOpponent = false;

  if (pawn.step === -1) {
    pawn.step = 0; // enter at starting cell
  } else {
    pawn.step += roll;
    if (pawn.step === 24) {
      pawn.isHome = true;
    }
  }
  myPawns[pawnIdx] = pawn;

  // Check collision with opponent if not at home and not on a safe cell
  if (pawn.step < 24) {
    const landingCoord = myTrack[pawn.step];
    if (!isSafeCell(landingCoord.r, landingCoord.c)) {
      opPawns.forEach((op, idx) => {
        if (op.step >= 0 && !op.isHome) {
          const opCoord = opTrack[op.step];
          if (opCoord.r === landingCoord.r && opCoord.c === landingCoord.c) {
            // Kill opponent pawn!
            opPawns[idx] = { ...op, step: -1 };
            killedOpponent = true;
          }
        }
      });
    }
  }

  // Check victory
  const allHome = myPawns.every(p => p.isHome);
  const nextP1 = isP1 ? myPawns : opPawns;
  const nextP2 = isP1 ? opPawns : myPawns;
  const nextP1Kills = state.p1Kills + (isP1 && killedOpponent ? 1 : 0);
  const nextP2Kills = state.p2Kills + (!isP1 && killedOpponent ? 1 : 0);

  const grantExtra = state.extraTurn || killedOpponent;
  const nextTurn = allHome ? state.currentTurn : grantExtra ? state.currentTurn : isP1 ? 'p2' : 'p1';

  return {
    nextState: {
      ...state,
      p1Pawns: nextP1,
      p2Pawns: nextP2,
      p1Kills: nextP1Kills,
      p2Kills: nextP2Kills,
      currentTurn: nextTurn,
      lastRoll: null,
      canRoll: true,
      extraTurn: false,
      isOver: allHome,
      winner: allHome ? state.currentTurn : null
    },
    killedOpponent
  };
}

export function getChowkaBaraBotMove(
  state: ChowkaBaraState,
  movableIds: number[],
  difficulty: BotDifficulty
): number {
  if (movableIds.length === 0) return -1;
  if (movableIds.length === 1 || difficulty === 'easy') return movableIds[0];

  const roll = state.lastRoll || 1;
  let bestScore = -9999;
  let bestId = movableIds[0];

  movableIds.forEach(id => {
    const pawn = state.p2Pawns.find(p => p.id === id);
    if (!pawn) return;
    let score = 0;

    const nextStep = pawn.step === -1 ? 0 : pawn.step + roll;
    if (nextStep === 24) {
      score += 500; // Entering home is huge
    } else {
      const targetCoord = P2_TRACK[nextStep];
      if (isSafeCell(targetCoord.r, targetCoord.c)) {
        score += 80; // Safe cells are great
      }

      // Check if this move kills an opponent pawn
      state.p1Pawns.forEach(op => {
        if (op.step >= 0 && !op.isHome) {
          const opCoord = P1_TRACK[op.step];
          if (opCoord.r === targetCoord.r && opCoord.c === targetCoord.c) {
            score += 300; // Kill priority!
          }
        }
      });

      // Prefer moving pawns further along track
      score += nextStep * 4;

      // Bring pawns out of yard
      if (pawn.step === -1) score += 60;
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  });

  return bestId;
}
