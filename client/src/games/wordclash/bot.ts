// client/src/games/wordclash/bot.ts
import { BotDifficulty } from '../../types';
import { TARGET_WORDS, VALID_GUESS_WORDS, evaluateWordGuess, TileState } from './words';

export interface BotWordGuessResult {
  guess: string;
  evaluations: TileState[];
  isSolved: boolean;
}

export function getBotWordGuess(
  targetWord: string,
  previousGuesses: string[],
  difficulty: BotDifficulty
): string {
  const target = targetWord.toUpperCase();
  const validArray = Array.from(VALID_GUESS_WORDS);

  // If hard difficulty and first guess, use optimal opener
  if (previousGuesses.length === 0) {
    if (difficulty === 'hard') return 'CRANE';
    if (difficulty === 'medium') return 'SLATE';
    return validArray[Math.floor(Math.random() * validArray.length)];
  }

  // Easy bot: picks random target words that haven't been guessed yet
  if (difficulty === 'easy') {
    const candidates = TARGET_WORDS.filter(w => !previousGuesses.includes(w));
    return candidates[Math.floor(Math.random() * candidates.length)] || 'CYBER';
  }

  // Medium / Hard: build filter based on past evaluations
  const knownCorrect: Record<number, string> = {};
  const knownPresent: Set<string> = new Set();
  const knownAbsent: Set<string> = new Set();

  previousGuesses.forEach(g => {
    const evalResult = evaluateWordGuess(g, target);
    for (let i = 0; i < 5; i++) {
      if (evalResult[i] === 'correct') {
        knownCorrect[i] = g[i];
      } else if (evalResult[i] === 'present') {
        knownPresent.add(g[i]);
      } else if (evalResult[i] === 'absent' && !target.includes(g[i])) {
        knownAbsent.add(g[i]);
      }
    }
  });

  const filtered = validArray.filter(w => {
    if (previousGuesses.includes(w)) return false;
    for (const [pos, ch] of Object.entries(knownCorrect)) {
      if (w[Number(pos)] !== ch) return false;
    }
    for (const ch of knownPresent) {
      if (!w.includes(ch)) return false;
    }
    if (difficulty === 'hard') {
      for (const ch of knownAbsent) {
        if (w.includes(ch)) return false;
      }
    }
    return true;
  });

  if (filtered.length > 0) {
    // If target is in the filtered list and it's late in the game or hard difficulty
    if (filtered.includes(target) && (difficulty === 'hard' || Math.random() < 0.65)) {
      return target;
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  return target;
}
