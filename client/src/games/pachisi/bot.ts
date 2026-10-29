// client/src/games/pachisi/bot.ts
import { BotDifficulty } from '../../types';

export interface GridCoord {
  r: number;
  c: number;
}

// 52 Perimeter track coordinates on a 17x17 Pachisi Cross Grid
export const PACHISI_TRACK: GridCoord[] = [
  // South Arm right col moving up (0..6)
  { r: 16, c: 9 }, { r: 15, c: 9 }, { r: 14, c: 9 }, { r: 13, c: 9 }, { r: 12, c: 9 }, { r: 11, c: 9 }, { r: 10, c: 9 },
  // East Arm bottom row moving right (7..13)
  { r: 9, c: 10 }, { r: 9, c: 11 }, { r: 9, c: 12 }, { r: 9, c: 13 }, { r: 9, c: 14 }, { r: 9, c: 15 }, { r: 9, c: 16 },
  // East Arm turn (14)
  { r: 8, c: 16 },
  // East Arm top row moving left (15..20)
  { r: 7, c: 16 }, { r: 7, c: 15 }, { r: 7, c: 14 }, { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 },
  // North Arm right col moving up (21..27)
  { r: 6, c: 9 }, { r: 5, c: 9 }, { r: 4, c: 9 }, { r: 3, c: 9 }, { r: 2, c: 9 }, { r: 1, c: 9 }, { r: 0, c: 9 },
  // North Arm turn (28)
  { r: 0, c: 8 },
  // North Arm left col moving down (29..34)
  { r: 0, c: 7 }, { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 },
  // West Arm top row moving left (35..41)
  { r: 7, c: 6 }, { r: 7, c: 5 }, { r: 7, c: 4 }, { r: 7, c: 3 }, { r: 7, c: 2 }, { r: 7, c: 1 }, { r: 7, c: 0 },
  // West Arm turn (42)
  { r: 8, c: 0 },
  // West Arm bottom row moving right (43..48)
  { r: 9, c: 0 }, { r: 9, c: 1 }, { r: 9, c: 2 }, { r: 9, c: 3 }, { r: 9, c: 4 }, { r: 9, c: 5 }, { r: 9, c: 6 },
  // South Arm left col moving down (49..51)
  { r: 10, c: 7 }, { r: 11, c: 7 }, { r: 12, c: 7 }, { r: 13, c: 7 }, { r: 14, c: 7 }, { r: 15, c: 7 }, { r: 16, c: 7 }
];

// P1 (South) Home Stretch moving up middle col to center
export const P1_HOME_STRETCH: GridCoord[] = [
  { r: 15, c: 8 }, { r: 14, c: 8 }, { r: 13, c: 8 }, { r: 12, c: 8 }, { r: 11, c: 8 }, { r: 10, c: 8 }, { r: 8, c: 8 }
];

// P2 (North) Home Stretch moving down middle col to center
export const P2_HOME_STRETCH: GridCoord[] = [
  { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 }, { r: 6, c: 8 }, { r: 8, c: 8 }
];

// Safe Castle Squares (marked with "X")
export const SAFE_TRACK_STEPS = [0, 8, 13, 21, 26, 34, 39, 47];

export function isTrackStepSafe(step: number): boolean {
  return SAFE_TRACK_STEPS.includes(step % 52);
}

export interface PachisiPawn {
  id: number;
  position: number; // -1 = In Base, 0..51 = track, 52..57 = home stretch, 58 = Charkoni Home!
  isHome: boolean;
}

export interface PachisiState {
  p1Pawns: PachisiPawn[];
  p2Pawns: PachisiPawn[];
  currentTurn: 'p1' | 'p2';
  lastRoll: number | null;
  cowries: boolean[]; // 6 shells: true = mouth UP, false = mouth DOWN
  canRoll: boolean;
  extraTurn: boolean;
  p1Captures: number;
  p2Captures: number;
  isOver: boolean;
  winner: 'p1' | 'p2' | null;
}

export function createInitialPachisi(): PachisiState {
  return {
    p1Pawns: [
      { id: 0, position: -1, isHome: false },
      { id: 1, position: -1, isHome: false },
      { id: 2, position: -1, isHome: false }
    ],
    p2Pawns: [
      { id: 0, position: -1, isHome: false },
      { id: 1, position: -1, isHome: false },
      { id: 2, position: -1, isHome: false }
    ],
    currentTurn: 'p1',
    lastRoll: null,
    cowries: [false, true, true, false, true, false],
    canRoll: true,
    extraTurn: false,
    p1Captures: 0,
    p2Captures: 0,
    isOver: false,
    winner: null
  };
}

export function rollPachisiCowries(): { roll: number; cowries: boolean[]; extraTurn: boolean } {
  const cowries = [
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5,
    Math.random() < 0.5
  ];
  const mouthsUp = cowries.filter(Boolean).length;

  let roll = 2;
  let extraTurn = false;

  switch (mouthsUp) {
    case 0:
      roll = 6;
      extraTurn = true;
      break;
    case 1:
      roll = 10; // Grace
      break;
    case 2:
      roll = 2;
      break;
    case 3:
      roll = 3;
      break;
    case 4:
      roll = 4;
      break;
    case 5:
      roll = 25; // Pachisi!
      extraTurn = true;
      break;
    case 6:
      roll = 12;
      extraTurn = true;
      break;
  }

  return { roll, cowries, extraTurn };
}

// Maps pawn position to 17x17 board GridCoord
export function getPachisiPawnCoord(pawn: PachisiPawn, player: 'p1' | 'p2'): GridCoord {
  if (pawn.position === -1) {
    // Base yard
    return player === 'p1'
      ? { r: 15, c: 7.5 + pawn.id * 0.7 }
      : { r: 1, c: 7.5 + pawn.id * 0.7 };
  }
  if (pawn.position >= 52) {
    const idx = Math.min(6, pawn.position - 52);
    return player === 'p1' ? P1_HOME_STRETCH[idx] : P2_HOME_STRETCH[idx];
  }
  const trackIdx = player === 'p1' ? pawn.position : (pawn.position + 26) % 52;
  return PACHISI_TRACK[trackIdx % PACHISI_TRACK.length];
}

export function getMovablePachisiPawns(
  state: PachisiState,
  player: 'p1' | 'p2',
  roll: number
): number[] {
  const pawns = player === 'p1' ? state.p1Pawns : state.p2Pawns;
  const movable: number[] = [];

  pawns.forEach(p => {
    if (p.isHome) return;
    if (p.position === -1) {
      if (roll === 10 || roll === 25 || roll === 6 || roll === 12) {
        movable.push(p.id);
      }
    } else {
      if (p.position + roll <= 58) {
        movable.push(p.id);
      }
    }
  });

  return movable;
}

export function movePachisiPawn(
  state: PachisiState,
  pawnId: number
): { nextState: PachisiState; captured: boolean; stepsPath: number[] } {
  const isP1 = state.currentTurn === 'p1';
  const myPawns = isP1 ? [...state.p1Pawns] : [...state.p2Pawns];
  const opPawns = isP1 ? [...state.p2Pawns] : [...state.p1Pawns];
  const roll = state.lastRoll || 0;

  const idx = myPawns.findIndex(p => p.id === pawnId);
  if (idx === -1) return { nextState: state, captured: false, stepsPath: [] };

  const pawn = { ...myPawns[idx] };
  let captured = false;
  const stepsPath: number[] = [];

  if (pawn.position === -1) {
    pawn.position = 0;
    stepsPath.push(0);
  } else {
    for (let s = 1; s <= roll; s++) {
      stepsPath.push(pawn.position + s);
    }
    pawn.position += roll;
    if (pawn.position >= 58) {
      pawn.position = 58;
      pawn.isHome = true;
    }
  }
  myPawns[idx] = pawn;

  // Collision with opponent
  if (pawn.position >= 0 && pawn.position < 52) {
    const myAbsStep = isP1 ? pawn.position : (pawn.position + 26) % 52;
    if (!isTrackStepSafe(myAbsStep)) {
      opPawns.forEach((op, opIdx) => {
        if (op.position >= 0 && op.position < 52 && !op.isHome) {
          const opAbsStep = isP1 ? (op.position + 26) % 52 : op.position;
          if (opAbsStep === myAbsStep) {
            opPawns[opIdx] = { ...op, position: -1 };
            captured = true;
          }
        }
      });
    }
  }

  const allHome = myPawns.every(p => p.isHome);
  const nextP1 = isP1 ? myPawns : opPawns;
  const nextP2 = isP1 ? opPawns : myPawns;
  const grantBonus = state.extraTurn || captured || pawn.isHome;
  const nextTurn = allHome ? state.currentTurn : grantBonus ? state.currentTurn : isP1 ? 'p2' : 'p1';

  return {
    nextState: {
      ...state,
      p1Pawns: nextP1,
      p2Pawns: nextP2,
      p1Captures: state.p1Captures + (isP1 && captured ? 1 : 0),
      p2Captures: state.p2Captures + (!isP1 && captured ? 1 : 0),
      currentTurn: nextTurn,
      lastRoll: null,
      canRoll: true,
      extraTurn: false,
      isOver: allHome,
      winner: allHome ? state.currentTurn : null
    },
    captured,
    stepsPath
  };
}

export function getPachisiBotMove(
  state: PachisiState,
  movableIds: number[],
  difficulty: BotDifficulty
): number {
  if (movableIds.length === 0) return -1;
  if (movableIds.length === 1 || difficulty === 'easy') return movableIds[0];

  const roll = state.lastRoll || 2;
  let bestScore = -9999;
  let bestId = movableIds[0];

  movableIds.forEach(id => {
    const pawn = state.p2Pawns.find(p => p.id === id);
    if (!pawn) return;
    let score = 0;

    const nextPos = pawn.position === -1 ? 0 : pawn.position + roll;
    if (nextPos >= 58) {
      score += 700;
    } else {
      if (nextPos < 52) {
        const myAbs = (nextPos + 26) % 52;
        if (isTrackStepSafe(myAbs)) score += 120;

        state.p1Pawns.forEach(op => {
          if (op.position >= 0 && op.position < 52 && !op.isHome) {
            if (op.position === myAbs) score += 400;
          }
        });
      }

      score += nextPos * 4;
      if (pawn.position === -1) score += 100;
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  });

  return bestId;
}
