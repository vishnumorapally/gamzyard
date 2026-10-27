// client/src/games/battleship/bot.ts
import { BotDifficulty } from '../../types';

export const GRID_SIZE = 10;

export interface ShipDef {
  id: string;
  name: string;
  size: number;
}

export const SHIPS: ShipDef[] = [
  { id: 'carrier', name: 'Aircraft Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'cruiser', name: 'Cruiser', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 2 },
];

export interface PlacedShip {
  id: string;
  name: string;
  size: number;
  coordinates: [number, number][];
  hits: number;
  sunk: boolean;
}

export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export function createEmptyGrid(): CellState[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty'));
}

export function generateRandomFleet(): { fleet: PlacedShip[]; grid: CellState[][] } {
  const grid = createEmptyGrid();
  const fleet: PlacedShip[] = [];

  for (const ship of SHIPS) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;
      const isHorizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE : GRID_SIZE - ship.size + 1));
      const c = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE - ship.size + 1 : GRID_SIZE));

      // Check collision
      let canPlace = true;
      const coords: [number, number][] = [];

      for (let i = 0; i < ship.size; i++) {
        const nr = isHorizontal ? r : r + i;
        const nc = isHorizontal ? c + i : c;
        if (grid[nr][nc] !== 'empty') {
          canPlace = false;
          break;
        }
        coords.push([nr, nc]);
      }

      if (canPlace) {
        coords.forEach(([cr, cc]) => {
          grid[cr][cc] = 'ship';
        });
        fleet.push({
          id: ship.id,
          name: ship.name,
          size: ship.size,
          coordinates: coords,
          hits: 0,
          sunk: false
        });
        placed = true;
      }
    }
  }

  return { fleet, grid };
}

// Bot Radar Target AI
export class BattleshipBot {
  private targetQueue: [number, number][] = [];
  private firedCoords: Set<string> = new Set();
  private lastHitCoords: [number, number][] = [];

  public getNextShot(difficulty: BotDifficulty): [number, number] {
    // 1. Target mode (Hard/Medium): If we have targets in the queue from a recent hit
    if (difficulty !== 'easy' && this.targetQueue.length > 0) {
      while (this.targetQueue.length > 0) {
        const target = this.targetQueue.shift()!;
        const key = `${target[0]},${target[1]}`;
        if (!this.firedCoords.has(key)) {
          this.firedCoords.add(key);
          return target;
        }
      }
    }

    // 2. Hunt mode: checkerboard parity or random
    const available: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const key = `${r},${c}`;
        if (!this.firedCoords.has(key)) {
          if (difficulty === 'hard') {
            // Parity check for better spread
            if ((r + c) % 2 === 0) available.push([r, c]);
          } else {
            available.push([r, c]);
          }
        }
      }
    }

    if (available.length === 0) {
      // Fallback to any remaining
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const key = `${r},${c}`;
          if (!this.firedCoords.has(key)) available.push([r, c]);
        }
      }
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    this.firedCoords.add(`${chosen[0]},${chosen[1]}`);
    return chosen;
  }

  public registerShotResult(coord: [number, number], wasHit: boolean, didSink: boolean) {
    if (wasHit) {
      if (didSink) {
        // Clear targets for that ship
        this.targetQueue = [];
        this.lastHitCoords = [];
      } else {
        this.lastHitCoords.push(coord);
        // Add adjacent coordinates: Up, Down, Left, Right
        const [r, c] = coord;
        const neighbors: [number, number][] = [
          [r - 1, c],
          [r + 1, c],
          [r, c - 1],
          [r, c + 1]
        ];

        neighbors.forEach(([nr, nc]) => {
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            const key = `${nr},${nc}`;
            if (!this.firedCoords.has(key)) {
              this.targetQueue.push([nr, nc]);
            }
          }
        });
      }
    }
  }

  public reset() {
    this.targetQueue = [];
    this.firedCoords.clear();
    this.lastHitCoords = [];
  }
}
