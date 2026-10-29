// client/src/games/carrom/physics.ts
import { BotDifficulty } from '../../types';

export const BOARD_SIZE = 540;
export const POCKET_RADIUS = 30;
export const STRIKER_RADIUS = 20;
export const STRIKER_MASS = 3.2;
export const COIN_RADIUS = 14;
export const COIN_MASS = 1.0;

export const POCKETS = [
  { x: 42, y: 42 },
  { x: BOARD_SIZE - 42, y: 42 },
  { x: 42, y: BOARD_SIZE - 42 },
  { x: BOARD_SIZE - 42, y: BOARD_SIZE - 42 }
];

export type CoinType = 'white' | 'black' | 'queen';

export interface CarromDisc {
  id: number;
  type: CoinType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  pocketed: boolean;
  scale: number; // for shrinking into pocket animation
  color: string;
}

export interface Striker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isMoving: boolean;
  baseY: number;
  scale: number;
}

export function createInitialDiscs(): CarromDisc[] {
  const center = BOARD_SIZE / 2;
  const dist = 30;
  const discs: CarromDisc[] = [];

  // Red Queen in center
  discs.push({
    id: 0,
    type: 'queen',
    x: center,
    y: center,
    vx: 0,
    vy: 0,
    radius: COIN_RADIUS,
    mass: COIN_MASS,
    pocketed: false,
    scale: 1,
    color: '#ef4444' // Crimson Queen
  });

  // 4 White coins in cross
  const whiteAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  whiteAngles.forEach((angle, idx) => {
    discs.push({
      id: idx + 1,
      type: 'white',
      x: center + Math.cos(angle) * dist,
      y: center + Math.sin(angle) * dist,
      vx: 0,
      vy: 0,
      radius: COIN_RADIUS,
      mass: COIN_MASS,
      pocketed: false,
      scale: 1,
      color: '#f8fafc' // Polished Ivory
    });
  });

  // 4 Black coins in diagonals
  const blackAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  blackAngles.forEach((angle, idx) => {
    discs.push({
      id: idx + 5,
      type: 'black',
      x: center + Math.cos(angle) * dist,
      y: center + Math.sin(angle) * dist,
      vx: 0,
      vy: 0,
      radius: COIN_RADIUS,
      mass: COIN_MASS,
      pocketed: false,
      scale: 1,
      color: '#0f172a' // Midnight Ebony
    });
  });

  return discs;
}

/**
 * Sub-stepped physics step to prevent fast-moving tunneling.
 */
export function stepPhysics(
  striker: Striker,
  discs: CarromDisc[]
): { newlyPocketed: CarromDisc[]; strikerFoul: boolean; isStillMoving: boolean } {
  const SUB_STEPS = 6;
  const FRICTION = 0.985;
  const RESTITUTION = 0.88;
  const MIN_SPEED = 0.05;
  const innerMin = 42;
  const innerMax = BOARD_SIZE - 42;

  const newlyPocketed: CarromDisc[] = [];
  let strikerFoul = false;

  const activeDiscs = discs.filter(d => !d.pocketed);
  const allObjects: (Striker | CarromDisc)[] = [striker, ...activeDiscs];

  for (let step = 0; step < SUB_STEPS; step++) {
    const dt = 1 / SUB_STEPS;

    // 1. Move and check wall bounces
    allObjects.forEach(obj => {
      obj.x += obj.vx * dt;
      obj.y += obj.vy * dt;

      // Friction
      obj.vx *= Math.pow(FRICTION, dt);
      obj.vy *= Math.pow(FRICTION, dt);

      if (Math.hypot(obj.vx, obj.vy) < MIN_SPEED) {
        obj.vx = 0;
        obj.vy = 0;
      }

      // Check if near any pocket corner
      let nearPocketDist = 999;
      let nearestPocket = POCKETS[0];
      POCKETS.forEach(p => {
        const d = Math.hypot(obj.x - p.x, obj.y - p.y);
        if (d < nearPocketDist) {
          nearPocketDist = d;
          nearestPocket = p;
        }
      });

      // Pocket gravity / funnel suction
      if (nearPocketDist < POCKET_RADIUS + 12) {
        const pAngle = Math.atan2(nearestPocket.y - obj.y, nearestPocket.x - obj.x);
        obj.vx += Math.cos(pAngle) * 0.45 * dt * 6;
        obj.vy += Math.sin(pAngle) * 0.45 * dt * 6;
      }

      // Only bounce against flat wooden cushions if NOT in the corner pocket zone
      if (nearPocketDist >= 50) {
        if (obj.x - obj.radius < innerMin) {
          obj.x = innerMin + obj.radius;
          obj.vx = Math.abs(obj.vx) * RESTITUTION;
        } else if (obj.x + obj.radius > innerMax) {
          obj.x = innerMax - obj.radius;
          obj.vx = -Math.abs(obj.vx) * RESTITUTION;
        }

        if (obj.y - obj.radius < innerMin) {
          obj.y = innerMin + obj.radius;
          obj.vy = Math.abs(obj.vy) * RESTITUTION;
        } else if (obj.y + obj.radius > innerMax) {
          obj.y = innerMax - obj.radius;
          obj.vy = -Math.abs(obj.vy) * RESTITUTION;
        }
      }
    });

    // 2. Elastic 2D Collisions with mass exchange
    for (let i = 0; i < allObjects.length; i++) {
      for (let j = i + 1; j < allObjects.length; j++) {
        const a = allObjects[i];
        const b = allObjects[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist && dist > 0) {
          // Positional overlap separation
          const overlap = (minDist - dist);
          const nx = dx / dist;
          const ny = dy / dist;

          const totalMass = (a.mass || 1) + (b.mass || 1);
          a.x -= nx * overlap * ((b.mass || 1) / totalMass);
          a.y -= ny * overlap * ((b.mass || 1) / totalMass);
          b.x += nx * overlap * ((a.mass || 1) / totalMass);
          b.y += ny * overlap * ((a.mass || 1) / totalMass);

          // Normal and Tangential Velocities
          const kx = a.vx - b.vx;
          const ky = a.vy - b.vy;
          const vn = kx * nx + ky * ny;

          if (vn > 0) {
            // Impulse scalar with restitution
            const impulse = (-(1 + RESTITUTION) * vn) / (1 / (a.mass || 1) + 1 / (b.mass || 1));
            a.vx += (impulse / (a.mass || 1)) * nx;
            a.vy += (impulse / (a.mass || 1)) * ny;
            b.vx -= (impulse / (b.mass || 1)) * nx;
            b.vy -= (impulse / (b.mass || 1)) * ny;
          }
        }
      }
    }

    // 3. Pocket detection
    POCKETS.forEach(pocket => {
      // Striker pocket check
      if (Math.hypot(striker.x - pocket.x, striker.y - pocket.y) < POCKET_RADIUS * 0.95) {
        strikerFoul = true;
        striker.vx = 0;
        striker.vy = 0;
        striker.scale = 0;
      }

      // Coins pocket check
      discs.forEach(disc => {
        if (!disc.pocketed && Math.hypot(disc.x - pocket.x, disc.y - pocket.y) < POCKET_RADIUS * 0.95) {
          disc.pocketed = true;
          disc.vx = 0;
          disc.vy = 0;
          disc.scale = 0;
          newlyPocketed.push(disc);
        }
      });
    });
  }

  const isStillMoving = allObjects.some(o => Math.hypot(o.vx, o.vy) > 0);
  striker.isMoving = isStillMoving;

  return { newlyPocketed, strikerFoul, isStillMoving };
}

/**
 * Calculates ghost ball aim collision and trajectory.
 */
export function calculateAimTrajectory(
  startX: number,
  startY: number,
  aimAngleRad: number,
  discs: CarromDisc[]
): { hitX: number; hitY: number; targetDisc: CarromDisc | null; targetAngle?: number } {
  const dirX = Math.cos(aimAngleRad);
  const dirY = Math.sin(aimAngleRad);

  let closestDist = 450;
  let targetDisc: CarromDisc | null = null;
  const activeDiscs = discs.filter(d => !d.pocketed);

  activeDiscs.forEach(disc => {
    // Vector from striker to disc
    const toDiscX = disc.x - startX;
    const toDiscY = disc.y - startY;

    // Projection along aim line
    const proj = toDiscX * dirX + toDiscY * dirY;
    if (proj > 0) {
      // Perpendicular distance
      const perpDist = Math.abs(toDiscX * dirY - toDiscY * dirX);
      const combinedRadius = STRIKER_RADIUS + disc.radius;

      if (perpDist < combinedRadius) {
        // Collision distance
        const colDist = proj - Math.sqrt(combinedRadius * combinedRadius - perpDist * perpDist);
        if (colDist > 0 && colDist < closestDist) {
          closestDist = colDist;
          targetDisc = disc;
        }
      }
    }
  });

  const hitX = startX + dirX * closestDist;
  const hitY = startY + dirY * closestDist;
  const targetAngle = targetDisc ? Math.atan2(targetDisc.y - hitY, targetDisc.x - hitX) : undefined;

  return {
    hitX,
    hitY,
    targetDisc,
    targetAngle
  };
}

export function getCarromBotShot(
  striker: Striker,
  discs: CarromDisc[],
  difficulty: BotDifficulty
): { strikerX: number; aimAngle: number; power: number; impulseX: number; impulseY: number } {
  const targets = discs.filter(d => !d.pocketed && (d.type === 'black' || d.type === 'queen'));
  if (targets.length === 0) {
    const defaultPower = 18;
    return {
      strikerX: BOARD_SIZE / 2,
      aimAngle: Math.PI / 2,
      power: defaultPower,
      impulseX: 0,
      impulseY: defaultPower
    };
  }

  // Find target closest to bottom-left or bottom-right pocket
  let bestTarget = targets[0];
  let bestPocket = POCKETS[2];
  let minScore = 9999;

  targets.forEach(t => {
    POCKETS.forEach(p => {
      const d = Math.hypot(t.x - p.x, t.y - p.y);
      if (d < minScore) {
        minScore = d;
        bestTarget = t;
        bestPocket = p;
      }
    });
  });

  // Vector from pocket through target
  const toPocketX = bestPocket.x - bestTarget.x;
  const toPocketY = bestPocket.y - bestTarget.y;
  const toPocketDist = Math.hypot(toPocketX, toPocketY) || 1;

  // Ghost ball position for striker to hit
  const ghostX = bestTarget.x - (toPocketX / toPocketDist) * (COIN_RADIUS + STRIKER_RADIUS);
  const ghostY = bestTarget.y - (toPocketY / toPocketDist) * (COIN_RADIUS + STRIKER_RADIUS);

  // Position bot striker on top baseline (y = 100)
  const strikerX = Math.max(120, Math.min(BOARD_SIZE - 120, ghostX));
  const strikerY = 100;

  const dx = ghostX - strikerX;
  const dy = ghostY - strikerY;
  let aimAngle = Math.atan2(dy, dx);

  if (difficulty === 'easy') {
    aimAngle += (Math.random() - 0.5) * 0.15;
  }

  const power = difficulty === 'hard' ? 24 : difficulty === 'medium' ? 19 : 14;
  const impulseX = Math.cos(aimAngle) * power;
  const impulseY = Math.sin(aimAngle) * power;

  return { strikerX, aimAngle, power, impulseX, impulseY };
}
