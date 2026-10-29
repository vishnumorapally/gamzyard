// client/src/games/wouldyourather/prompts.ts

export interface WYRPrompt {
  id: string;
  optionA: string;
  optionB: string;
  topic: string;
}

export const WYR_PROMPTS: WYRPrompt[] = [
  {
    id: 'wyr-1',
    topic: 'Cinema Dream',
    optionA: 'Star in an epic S.S. Rajamouli movie, but shoot for 6 straight years',
    optionB: 'Star in 10 hit commercial comedies with Brahmanandam in 2 years'
  },
  {
    id: 'wyr-2',
    topic: 'Food vs Passion',
    optionA: 'Unlimited free world-class Hyderabadi Biryani for life (never enter a theater again)',
    optionB: 'Free lifetime First-Day-First-Show VIP movie tickets (never eat Biryani again)'
  },
  {
    id: 'wyr-3',
    topic: 'Stage Performance',
    optionA: 'Perform the high-speed "Naatu Naatu" hook step live on the Oscar stage',
    optionB: 'Deliver Balakrishna\'s 3-minute thunderous monologue without stammering on live TV'
  },
  {
    id: 'wyr-4',
    topic: 'Tollywood Survival',
    optionA: 'Spend 24 hours alone inside the haunted fort from "Arundhati"',
    optionB: 'Get chased through the narrow lanes of Charminar by Ali Bhai\'s gang from "Pokiri"'
  },
  {
    id: 'wyr-5',
    topic: 'Hero Powers',
    optionA: 'Have Allu Arjun\'s effortless dance fluidity and swag',
    optionB: 'Have Mahesh Babu\'s razor-sharp dialogue delivery and screen presence'
  },
  {
    id: 'wyr-6',
    topic: 'Box Office Stakes',
    optionA: 'Own 50% shares in the highest-grossing Indian film of all time',
    optionB: 'Win the Best Actor National Award and an Oscar trophy in the same year'
  }
];

export function getRandomWYRPrompts(count: number = 5): WYRPrompt[] {
  return [...WYR_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, count);
}
