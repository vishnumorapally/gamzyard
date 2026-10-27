// client/src/games/memory/bot.ts
import { BotDifficulty } from '../../types';

export const CARD_ICONS = ['🦊', '🐲', '🤖', '🐱', '🐼', '👾', '⚡', '👑'];

export interface MemoryCard {
  id: number;
  icon: string;
  isMatched: boolean;
  matchedBy: 'player1' | 'player2' | null;
}

export function createShuffledMemoryCards(): MemoryCard[] {
  const pairs = [...CARD_ICONS, ...CARD_ICONS];
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs.map((icon, id) => ({
    id,
    icon,
    isMatched: false,
    matchedBy: null
  }));
}

export function getMemoryBotPicks(
  cards: MemoryCard[],
  seenCards: Record<number, string>,
  difficulty: BotDifficulty
): [number, number] {
  const unmatchedIds = cards.filter(c => !c.isMatched).map(c => c.id);

  // Check known matching pairs in memory
  const memoryRate = difficulty === 'hard' ? 0.95 : difficulty === 'medium' ? 0.70 : 0.35;
  const knownPairs: [number, number][] = [];

  const iconToIds: Record<string, number[]> = {};
  for (const [idStr, icon] of Object.entries(seenCards)) {
    const id = parseInt(idStr, 10);
    if (!cards[id].isMatched) {
      if (!iconToIds[icon]) iconToIds[icon] = [];
      iconToIds[icon].push(id);
    }
  }

  for (const ids of Object.values(iconToIds)) {
    if (ids.length >= 2) {
      knownPairs.push([ids[0], ids[1]]);
    }
  }

  // If bot knows a pair and passes probability check -> choose that pair!
  if (knownPairs.length > 0 && Math.random() < memoryRate) {
    return knownPairs[0];
  }

  // Otherwise pick first unknown card
  const unknownIds = unmatchedIds.filter(id => !seenCards[id]);
  const firstPick = unknownIds.length > 0
    ? unknownIds[Math.floor(Math.random() * unknownIds.length)]
    : unmatchedIds[Math.floor(Math.random() * unmatchedIds.length)];

  // For second pick: if the first pick matches something in seen memory -> pick it!
  const firstIcon = cards[firstPick].icon;
  const matchingSeen = Object.entries(seenCards).find(
    ([idStr, icon]) => parseInt(idStr, 10) !== firstPick && icon === firstIcon && !cards[parseInt(idStr, 10)].isMatched
  );

  if (matchingSeen && Math.random() < memoryRate) {
    return [firstPick, parseInt(matchingSeen[0], 10)];
  }

  // Second random pick from remaining unmatched
  const remaining = unmatchedIds.filter(id => id !== firstPick);
  const secondPick = remaining[Math.floor(Math.random() * remaining.length)];

  return [firstPick, secondPick];
}
