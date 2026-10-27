// client/src/games/trivia/bot.ts
import { BotDifficulty } from '../../types';
import { TriviaQuestion } from './questions';

export interface BotTriviaAnswer {
  selectedIndex: number;
  thinkingDelayMs: number;
  isCorrect: boolean;
  scoreEarned: number;
}

export function calculateTriviaScore(isCorrect: boolean, secondsRemaining: number): number {
  if (!isCorrect) return 0;
  const baseScore = 100;
  const speedBonus = Math.max(0, Math.min(50, Math.floor((secondsRemaining / 30) * 50)));
  return baseScore + speedBonus;
}

export function getBotTriviaAnswer(
  question: TriviaQuestion,
  difficulty: BotDifficulty
): BotTriviaAnswer {
  let accuracyRate = 0.5; // default easy
  let minDelay = 2500;
  let maxDelay = 4500;

  if (difficulty === 'medium') {
    accuracyRate = 0.75;
    minDelay = 1800;
    maxDelay = 3500;
  } else if (difficulty === 'hard') {
    accuracyRate = 0.92;
    minDelay = 1000;
    maxDelay = 2400;
  }

  const isCorrect = Math.random() < accuracyRate;
  let selectedIndex = question.correctIndex;

  if (!isCorrect) {
    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== question.correctIndex);
    selectedIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
  }

  const thinkingDelayMs = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
  const simulatedSecondsRemaining = Math.max(5, 30 - Math.floor(thinkingDelayMs / 1000));
  const scoreEarned = calculateTriviaScore(isCorrect, simulatedSecondsRemaining);

  return {
    selectedIndex,
    thinkingDelayMs,
    isCorrect,
    scoreEarned
  };
}
