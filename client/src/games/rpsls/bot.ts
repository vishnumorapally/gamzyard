// client/src/games/rpsls/bot.ts
import { BotDifficulty } from '../../types';

export type RPSLSChoice = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock';

export const RPSLS_CHOICES: RPSLSChoice[] = ['rock', 'paper', 'scissors', 'lizard', 'spock'];

export const RPSLS_DETAILS: Record<
  RPSLSChoice,
  {
    name: string;
    icon: string;
    beats: Record<RPSLSChoice, string>; // target choice -> verb
    color: string;
    border: string;
  }
> = {
  rock: {
    name: 'Titan Rock',
    icon: '🪨',
    beats: {
      scissors: 'crushes',
      lizard: 'crushes',
      rock: '',
      paper: '',
      spock: ''
    },
    color: 'from-amber-600 to-amber-950',
    border: 'border-amber-400'
  },
  paper: {
    name: 'Quantum Paper',
    icon: '📄',
    beats: {
      rock: 'covers',
      spock: 'disproves',
      paper: '',
      scissors: '',
      lizard: ''
    },
    color: 'from-cyan-600 to-cyan-950',
    border: 'border-cyan-400'
  },
  scissors: {
    name: 'Laser Scissors',
    icon: '✂️',
    beats: {
      paper: 'cuts',
      lizard: 'decapitates',
      scissors: '',
      rock: '',
      spock: ''
    },
    color: 'from-rose-600 to-rose-950',
    border: 'border-rose-400'
  },
  lizard: {
    name: 'Cyber Lizard',
    icon: '🦎',
    beats: {
      spock: 'poisons',
      paper: 'eats',
      lizard: '',
      rock: '',
      scissors: ''
    },
    color: 'from-emerald-600 to-emerald-950',
    border: 'border-emerald-400'
  },
  spock: {
    name: 'Vulcan Spock',
    icon: '🖖',
    beats: {
      scissors: 'smashes',
      rock: 'vaporizes',
      spock: '',
      paper: '',
      lizard: ''
    },
    color: 'from-purple-600 to-purple-950',
    border: 'border-purple-400'
  }
};

export function evaluateRPSLS(
  p1: RPSLSChoice,
  p2: RPSLSChoice
): { outcome: 'p1' | 'p2' | 'tie'; explanation: string } {
  if (p1 === p2) {
    return {
      outcome: 'tie',
      explanation: `Dual clash! Both picked ${RPSLS_DETAILS[p1].name}. Tie round!`
    };
  }

  if (RPSLS_DETAILS[p1].beats[p2]) {
    const verb = RPSLS_DETAILS[p1].beats[p2];
    return {
      outcome: 'p1',
      explanation: `${RPSLS_DETAILS[p1].name} ${verb} ${RPSLS_DETAILS[p2].name}!`
    };
  }

  const verb = RPSLS_DETAILS[p2].beats[p1];
  return {
    outcome: 'p2',
    explanation: `${RPSLS_DETAILS[p2].name} ${verb} ${RPSLS_DETAILS[p1].name}!`
  };
}

export function getRPSLSBotChoice(
  playerHistory: RPSLSChoice[],
  botHistory: RPSLSChoice[],
  difficulty: BotDifficulty
): RPSLSChoice {
  if (playerHistory.length === 0 || difficulty === 'easy') {
    return RPSLS_CHOICES[Math.floor(Math.random() * RPSLS_CHOICES.length)];
  }

  const lastPlayerMove = playerHistory[playerHistory.length - 1];

  if (difficulty === 'medium') {
    // 60% chance to counter what beats or counters the last player choice
    if (Math.random() < 0.6) {
      // Find moves that beat lastPlayerMove
      const winningCounter = RPSLS_CHOICES.filter(c => RPSLS_DETAILS[c].beats[lastPlayerMove]);
      return winningCounter[Math.floor(Math.random() * winningCounter.length)];
    }
    return RPSLS_CHOICES[Math.floor(Math.random() * RPSLS_CHOICES.length)];
  }

  // Hard difficulty:
  const lastBotMove = botHistory[botHistory.length - 1];
  const { outcome } = evaluateRPSLS(lastPlayerMove, lastBotMove);

  if (outcome === 'p1') {
    // Player won: likely to repeat -> counter it
    const counterMoves = RPSLS_CHOICES.filter(c => RPSLS_DETAILS[c].beats[lastPlayerMove]);
    return counterMoves[Math.floor(Math.random() * counterMoves.length)];
  } else if (outcome === 'p2') {
    // Player lost: likely to switch to what beats bot's last move
    const playerExpectedCounter = RPSLS_CHOICES.filter(c => RPSLS_DETAILS[c].beats[lastBotMove]);
    const expected = playerExpectedCounter[Math.floor(Math.random() * playerExpectedCounter.length)];
    const counterToExpected = RPSLS_CHOICES.filter(c => RPSLS_DETAILS[c].beats[expected]);
    return counterToExpected[0] || 'spock';
  }

  return RPSLS_CHOICES[Math.floor(Math.random() * RPSLS_CHOICES.length)];
}
