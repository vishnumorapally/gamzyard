// client/src/games/rps/bot.ts
import { BotDifficulty } from '../../types';

export type RPSChoice = 'rock' | 'paper' | 'scissors';

export const RPS_CHOICES: RPSChoice[] = ['rock', 'paper', 'scissors'];

export const CHOICE_DETAILS: Record<RPSChoice, { name: string; icon: string; beats: RPSChoice; beatVerb: string; color: string; border: string }> = {
  rock: {
    name: 'Titan Rock',
    icon: '🪨',
    beats: 'scissors',
    beatVerb: 'CRUSHES',
    color: 'from-amber-600 to-amber-950',
    border: 'border-amber-400'
  },
  paper: {
    name: 'Quantum Paper',
    icon: '📄',
    beats: 'rock',
    beatVerb: 'ENVツLOPS',
    color: 'from-cyan-600 to-cyan-950',
    border: 'border-cyan-400'
  },
  scissors: {
    name: 'Laser Blades',
    icon: '✂️',
    beats: 'paper',
    beatVerb: 'SLICES',
    color: 'from-purple-600 to-purple-950',
    border: 'border-purple-400'
  }
};

export function evaluateRPS(p1: RPSChoice, p2: RPSChoice): 'p1' | 'p2' | 'tie' {
  if (p1 === p2) return 'tie';
  if (CHOICE_DETAILS[p1].beats === p2) return 'p1';
  return 'p2';
}

export function getRPSBotChoice(
  playerHistory: RPSChoice[],
  botHistory: RPSChoice[],
  difficulty: BotDifficulty
): RPSChoice {
  if (playerHistory.length === 0 || difficulty === 'easy') {
    return RPS_CHOICES[Math.floor(Math.random() * RPS_CHOICES.length)];
  }

  const lastPlayerMove = playerHistory[playerHistory.length - 1];

  if (difficulty === 'medium') {
    // 60% chance to counter what player just played (assuming player might repeat)
    if (Math.random() < 0.6) {
      if (lastPlayerMove === 'rock') return 'paper';
      if (lastPlayerMove === 'paper') return 'scissors';
      return 'rock';
    }
    return RPS_CHOICES[Math.floor(Math.random() * RPS_CHOICES.length)];
  }

  // Hard difficulty: psychological pattern analysis
  // Players who lose tend to switch to the move that would have beaten their opponent's previous move.
  // Players who win often repeat their winning move.
  const lastBotMove = botHistory[botHistory.length - 1];
  const lastOutcome = evaluateRPS(lastPlayerMove, lastBotMove);

  if (lastOutcome === 'p1') {
    // Player won: likely to repeat lastPlayerMove -> bot plays move that beats lastPlayerMove
    if (lastPlayerMove === 'rock') return 'paper';
    if (lastPlayerMove === 'paper') return 'scissors';
    return 'rock';
  } else if (lastOutcome === 'p2') {
    // Player lost: likely to switch to what would have beaten bot's last move
    // If bot played rock, player might switch to paper -> bot counters with scissors
    if (lastBotMove === 'rock') return 'scissors';
    if (lastBotMove === 'paper') return 'rock';
    return 'paper';
  }

  return RPS_CHOICES[Math.floor(Math.random() * RPS_CHOICES.length)];
}
