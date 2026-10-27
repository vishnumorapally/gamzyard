// client/src/games/handcricket/bot.ts
import { BotDifficulty } from '../../types';

export function getHandCricketBotChoice(
  role: 'bat' | 'bowl',
  playerHistory: number[],
  botHistory: number[],
  currentScore: number,
  target: number | null,
  difficulty: BotDifficulty
): number {
  const choices = [1, 2, 3, 4, 5, 6];

  if (difficulty === 'easy' || playerHistory.length === 0) {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  const lastPlayerNum = playerHistory[playerHistory.length - 1];

  if (difficulty === 'medium') {
    // 50% chance to predict player will stick with or change number
    if (role === 'bowl') {
      // Trying to get player out: guess what player might pick (often 4 or 6, or repeating)
      if (Math.random() < 0.45) return lastPlayerNum;
      const commonAggressive = [4, 6];
      if (Math.random() < 0.5) return commonAggressive[Math.floor(Math.random() * commonAggressive.length)];
    } else {
      // Batting: avoid what bot thinks bowler will bowl
      const avoid = lastPlayerNum;
      const safe = choices.filter(c => c !== avoid);
      return safe[Math.floor(Math.random() * safe.length)];
    }
  }

  // Hard difficulty:
  if (role === 'bowl') {
    // If player is close to target, player will likely play safe (1, 2) or hit a boundary (4, 6)
    if (target !== null && target - currentScore <= 6) {
      const needed = Math.max(1, Math.min(6, target - currentScore));
      if (Math.random() < 0.6) return needed;
    }
    // Pattern frequency
    const freq: Record<number, number> = {};
    playerHistory.slice(-5).forEach(n => { freq[n] = (freq[n] || 0) + 1; });
    const mostFrequent = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (mostFrequent && Math.random() < 0.55) {
      return Number(mostFrequent[0]);
    }
    return choices[Math.floor(Math.random() * choices.length)];
  } else {
    // Bot is batting: try to outscore without getting out
    // Avoid last number bowler used
    const safeChoices = choices.filter(c => c !== lastPlayerNum);
    if (target !== null) {
      const needed = target - currentScore;
      if (needed <= 4 && safeChoices.includes(needed)) return needed;
    }
    // Mix of 3, 4, 6 for good run rate
    const aggressive = safeChoices.filter(c => c >= 3);
    if (aggressive.length > 0 && Math.random() < 0.6) {
      return aggressive[Math.floor(Math.random() * aggressive.length)];
    }
    return safeChoices[Math.floor(Math.random() * safeChoices.length)];
  }
}
