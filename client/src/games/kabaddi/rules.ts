// client/src/games/kabaddi/rules.ts
import { BotDifficulty } from '../../types';

export type RaiderMove = 'toe_touch' | 'hand_touch' | 'dubki' | 'frog_jump' | 'bonus_cross';
export type DefenderTactic = 'chain_tackle' | 'ankle_hold' | 'thigh_hold' | 'dash_block' | 'corner_dive';
export type ApproachVector = 'left_corner' | 'center' | 'right_corner';

export interface RaiderMoveInfo {
  id: RaiderMove;
  name: string;
  icon: string;
  tagline: string;
  energyCost: number;
  maxPoints: number;
  description: string;
}

export const RAIDER_MOVES: RaiderMoveInfo[] = [
  {
    id: 'hand_touch',
    name: 'Running Hand Touch',
    icon: '✋',
    tagline: 'High Speed Tag on Cover',
    energyCost: 15,
    maxPoints: 1,
    description: 'Fast sprint touch targeting the middle cover defenders. Strong against loose chains.'
  },
  {
    id: 'toe_touch',
    name: 'Stealth Toe Touch',
    icon: '👟',
    tagline: 'Extension Tag on Corner',
    energyCost: 10,
    maxPoints: 1,
    description: 'Extend your lead leg to tag the deep corner defender while keeping body safely back.'
  },
  {
    id: 'dubki',
    name: 'The Legendary Dubki',
    icon: '⚡',
    tagline: 'Duck & Slide Under Chain',
    energyCost: 25,
    maxPoints: 3,
    description: 'Duck low under the arms of the incoming chain tackle and sprint to midline. Can score 2-3 points!'
  },
  {
    id: 'frog_jump',
    name: 'Acrobatic Frog Jump',
    icon: '🐸',
    tagline: 'Leap Over Diving Defenders',
    energyCost: 25,
    maxPoints: 2,
    description: 'Plant both feet and vault directly over crouching ankle-holders to land safely across the midline.'
  },
  {
    id: 'bonus_cross',
    name: 'Bonus Line Attempt',
    icon: '✨',
    tagline: 'Steal +1 Bonus Point',
    energyCost: 12,
    maxPoints: 1,
    description: 'Step past the bonus line with one foot while trailing foot is in the air. Only valid if 6+ defenders on mat.'
  }
];

export interface DefenderTacticInfo {
  id: DefenderTactic;
  name: string;
  icon: string;
  counter: string;
  description: string;
}

export const DEFENDER_TACTICS: DefenderTacticInfo[] = [
  {
    id: 'chain_tackle',
    name: 'Coordinated Chain Hold',
    icon: '🔗',
    counter: 'Effective vs Running Hand Touch',
    description: 'Corner and In defenders lock hands to form an inescapable net wrapping the raider.'
  },
  {
    id: 'ankle_hold',
    name: 'Iron Ankle Grip',
    icon: '🤼',
    counter: 'Effective vs Dubki & Toe Touch',
    description: 'Pounce low and lock both hands around the raider lead ankle to kill momentum.'
  },
  {
    id: 'thigh_hold',
    name: 'Deep Thigh Grab',
    icon: '🦵',
    counter: 'Effective vs Toe Touch & Stand still',
    description: 'Wrap your body around the raider thighs, lifting their center of gravity.'
  },
  {
    id: 'dash_block',
    name: 'Thunder Cover Dash',
    icon: '💥',
    counter: 'Effective vs Frog Jump & Sprints',
    description: 'Full-body collision charge pushing the raider out into the side lobby or over backline.'
  },
  {
    id: 'corner_dive',
    name: 'Corner Lion Dive',
    icon: '🦁',
    counter: 'Surprise ambush from the blind spot',
    description: 'Blindside dive around the raider torso as they turn back toward the midline.'
  }
];

export interface KabaddiState {
  team1Score: number;
  team2Score: number;
  team1Defenders: number; // 1 to 7 active
  team2Defenders: number; // 1 to 7 active
  currentTurn: 'p1' | 'p2'; // Who is raiding: 'p1' = Team 1 raider, 'p2' = Team 2 raider
  currentRaidNumber: number;
  maxRaids: number; // e.g. 10 total raids
  team1EmptyRaids: number; // For Do-or-Die
  team2EmptyRaids: number;
  isDoOrDie: boolean;
  raidResult: {
    raiderMove: RaiderMove;
    defenderTactic: DefenderTactic;
    approach: ApproachVector;
    success: boolean;
    points: number;
    bonus: boolean;
    superTackle: boolean;
    superRaid: boolean;
    allOut: boolean;
    commentary: string;
  } | null;
  commentaryLog: string[];
  isOver: boolean;
  winner: 'p1' | 'p2' | 'tie' | null;
}

export function createInitialKabaddi(): KabaddiState {
  return {
    team1Score: 0,
    team2Score: 0,
    team1Defenders: 7,
    team2Defenders: 7,
    currentTurn: 'p1',
    currentRaidNumber: 1,
    maxRaids: 10,
    team1EmptyRaids: 0,
    team2EmptyRaids: 0,
    isDoOrDie: false,
    raidResult: null,
    commentaryLog: ['Welcome to the Kabaddi Arena! 7 vs 7 tournament clash underway.'],
    isOver: false,
    winner: null
  };
}

/**
 * Resolves a Kabaddi raid clash based on raider move, defender tactic, and approach.
 */
export function resolveRaid(
  state: KabaddiState,
  raiderMove: RaiderMove,
  defenderTactic: DefenderTactic,
  approach: ApproachVector
): {
  nextState: KabaddiState;
  success: boolean;
  points: number;
  bonus: boolean;
  superTackle: boolean;
  superRaid: boolean;
  allOut: boolean;
  commentary: string;
} {
  const isP1Raiding = state.currentTurn === 'p1';
  const defenderCount = isP1Raiding ? state.team2Defenders : state.team1Defenders;
  const isSuperTackleSituation = defenderCount <= 3;
  const isDoOrDie = isP1Raiding ? state.team1EmptyRaids >= 2 : state.team2EmptyRaids >= 2;

  let success = false;
  let points = 0;
  let bonus = false;
  let superTackle = false;
  let superRaid = false;
  let allOut = false;
  let commentary = '';

  // Base success calculations with tactical rock-paper-scissors
  // Matrix:
  // Dubki beats: chain_tackle, dash_block
  // Dubki loses to: ankle_hold
  // Frog Jump beats: ankle_hold, thigh_hold
  // Frog Jump loses to: dash_block, corner_dive
  // Toe Touch beats: corner_dive, thigh_hold
  // Toe Touch loses to: ankle_hold
  // Running Hand Touch beats: chain_tackle, corner_dive
  // Running Hand Touch loses to: dash_block, ankle_hold
  // Bonus Cross: Success if defenders >= 6 and not corner_dive

  const roll = Math.random();

  if (raiderMove === 'bonus_cross') {
    if (defenderCount >= 6 && defenderTactic !== 'corner_dive' && roll > 0.25) {
      success = true;
      bonus = true;
      points = 1;
      commentary = '✨ BRILLIANT TOE EXTENSION! Raider crosses the orange bonus line cleanly!';
    } else {
      success = false;
      points = 0;
      commentary = '❌ Caught on the bonus line! Defenders trapped the trailing foot!';
    }
  } else if (raiderMove === 'dubki') {
    if (defenderTactic === 'chain_tackle' || defenderTactic === 'dash_block' || roll > 0.45) {
      if (defenderTactic === 'ankle_hold' && roll < 0.65) {
        success = false;
        commentary = '⚡ ANKLE TRAP! The raider went low for Dubki, but the defender clamped the foot!';
      } else {
        success = true;
        points = Math.min(defenderCount, Math.floor(Math.random() * 2) + 2); // 2 or 3 points!
        if (points >= 3) superRaid = true;
        commentary = `🔥 SENSATIONAL DUBKI! Raider ducks under the chain and drags ${points} defenders over midline!`;
      }
    } else {
      success = false;
      commentary = '🛡️ TACKLED! Defenders collapsed on the raider before the escape!';
    }
  } else if (raiderMove === 'frog_jump') {
    if (defenderTactic === 'ankle_hold' || defenderTactic === 'thigh_hold' || roll > 0.4) {
      if (defenderTactic === 'dash_block' && roll < 0.6) {
        success = false;
        commentary = '💥 MIGHTY DASH IN MID-AIR! Raider was air-lifted out of the court by cover dash!';
      } else {
        success = true;
        points = Math.min(defenderCount, 2);
        commentary = '🐸 INCREDIBLE FROG JUMP! Flying over the low defenders to reach home!';
      }
    } else {
      success = false;
      commentary = '🛡️ CAUGHT IN THE SKY! Defenders pulled down the airborne raider!';
    }
  } else if (raiderMove === 'toe_touch') {
    if (defenderTactic === 'corner_dive' || approach !== 'center' || roll > 0.35) {
      if (defenderTactic === 'ankle_hold' && roll < 0.55) {
        success = false;
        commentary = '🤼 ANKLE HOLD MASTERCLASS! Corner snatched the extended toe!';
      } else {
        success = true;
        points = 1;
        commentary = '👟 SURGICAL TOE TOUCH! Sneaked a lightning tag on the corner!';
      }
    } else {
      success = false;
      commentary = '❌ MISSED TOUCH! Foot fell short and defenders surrounded!';
    }
  } else {
    // running hand touch
    if (defenderTactic !== 'dash_block' || roll > 0.4) {
      success = true;
      points = Math.min(defenderCount, roll > 0.75 ? 2 : 1);
      commentary = `✋ RUNNING HAND TOUCH! Clean tag on cover defender! (${points} pts)`;
    } else {
      success = false;
      commentary = '💥 DASH BLOCK! Cover defender charged in and knocked raider out into lobby!';
    }
  }

  // Handle Do-or-Die raid penalty
  if (isDoOrDie && !success) {
    commentary += ' (Do-or-Die Raid Failed!)';
  }

  // Handle Super Tackle
  if (!success && isSuperTackleSituation) {
    superTackle = true;
    commentary += ' 🌟 SUPER TACKLE! Defense earns 2 points for defending with 3 or fewer players!';
  }

  // Calculate new scores and defender counts
  let newTeam1Score = state.team1Score;
  let newTeam2Score = state.team2Score;
  let newTeam1Def = state.team1Defenders;
  let newTeam2Def = state.team2Defenders;
  let newTeam1Empty = state.team1EmptyRaids;
  let newTeam2Empty = state.team2EmptyRaids;

  if (isP1Raiding) {
    if (success) {
      newTeam1Score += points;
      newTeam2Def = Math.max(0, newTeam2Def - (bonus ? 0 : points));
      // Revive 1 teammate per touch point
      newTeam1Def = Math.min(7, newTeam1Def + (bonus ? 0 : points));
      newTeam1Empty = 0;
    } else {
      newTeam2Score += superTackle ? 2 : 1;
      newTeam1Def = Math.max(1, newTeam1Def - 1); // Raider is out
      newTeam2Def = Math.min(7, newTeam2Def + 1); // Defense revives 1
      newTeam1Empty = 0;
    }
  } else {
    // P2 raiding
    if (success) {
      newTeam2Score += points;
      newTeam1Def = Math.max(0, newTeam1Def - (bonus ? 0 : points));
      newTeam2Def = Math.min(7, newTeam2Def + (bonus ? 0 : points));
      newTeam2Empty = 0;
    } else {
      newTeam1Score += superTackle ? 2 : 1;
      newTeam2Def = Math.max(1, newTeam2Def - 1);
      newTeam1Def = Math.min(7, newTeam1Def + 1);
      newTeam2Empty = 0;
    }
  }

  // Check ALL-OUT
  if (isP1Raiding && newTeam2Def === 0) {
    allOut = true;
    newTeam1Score += 2; // All-Out bonus
    newTeam2Def = 7; // Reset
    commentary += ' 🏆 ALL OUT! Opponent wiped out! +2 Extra Bonus Points!';
  } else if (!isP1Raiding && newTeam1Def === 0) {
    allOut = true;
    newTeam2Score += 2;
    newTeam1Def = 7;
    commentary += ' 🏆 ALL OUT! Team wiped out! +2 Extra Bonus Points!';
  }

  const nextRaidNum = state.currentRaidNumber + 1;
  const isOver = nextRaidNum > state.maxRaids;
  let winner: 'p1' | 'p2' | 'tie' | null = null;

  if (isOver) {
    if (newTeam1Score > newTeam2Score) winner = 'p1';
    else if (newTeam2Score > newTeam1Score) winner = 'p2';
    else winner = 'tie';
  }

  const nextState: KabaddiState = {
    ...state,
    team1Score: newTeam1Score,
    team2Score: newTeam2Score,
    team1Defenders: newTeam1Def,
    team2Defenders: newTeam2Def,
    currentTurn: isP1Raiding ? 'p2' : 'p1',
    currentRaidNumber: nextRaidNum,
    team1EmptyRaids: newTeam1Empty,
    team2EmptyRaids: newTeam2Empty,
    isDoOrDie: isP1Raiding ? newTeam2Empty >= 2 : newTeam1Empty >= 2,
    raidResult: {
      raiderMove,
      defenderTactic,
      approach,
      success,
      points,
      bonus,
      superTackle,
      superRaid,
      allOut,
      commentary
    },
    commentaryLog: [commentary, ...state.commentaryLog.slice(0, 15)],
    isOver,
    winner
  };

  return {
    nextState,
    success,
    points,
    bonus,
    superTackle,
    superRaid,
    allOut,
    commentary
  };
}

export function getKabaddiBotMove(
  isRaiding: boolean,
  state: KabaddiState,
  difficulty: BotDifficulty = 'medium'
): { raiderMove?: RaiderMove; approach?: ApproachVector; defenderTactic?: DefenderTactic } {
  if (isRaiding) {
    const moves: RaiderMove[] = ['hand_touch', 'toe_touch', 'dubki', 'frog_jump', 'bonus_cross'];
    const approaches: ApproachVector[] = ['left_corner', 'center', 'right_corner'];

    if (difficulty === 'hard') {
      // Hard bots use Dubki & Bonus when defenders are 6+, Frog jump on low tackle
      if (state.team1Defenders >= 6 && Math.random() < 0.4) {
        return { raiderMove: 'bonus_cross', approach: 'right_corner' };
      }
      if (Math.random() < 0.35) {
        return { raiderMove: 'dubki', approach: 'center' };
      }
    }

    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    const randomApproach = approaches[Math.floor(Math.random() * approaches.length)];
    return { raiderMove: randomMove, approach: randomApproach };
  } else {
    // Bot is defending
    const tactics: DefenderTactic[] = ['chain_tackle', 'ankle_hold', 'thigh_hold', 'dash_block', 'corner_dive'];
    const randomTactic = tactics[Math.floor(Math.random() * tactics.length)];
    return { defenderTactic: randomTactic };
  }
}
