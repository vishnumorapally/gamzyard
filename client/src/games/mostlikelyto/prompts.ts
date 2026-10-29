// client/src/games/mostlikelyto/prompts.ts

export const MOST_LIKELY_TO_PROMPTS = [
  'Who is most likely to show up 30 minutes late to a movie and still insist on buying large popcorn?',
  'Who is most likely to become a high-voltage Telugu mass movie villain?',
  'Who is most likely to secretly eat someone else\'s Biryani piece and act innocent?',
  'Who is most likely to go viral on Instagram reels doing a chaotic dance step?',
  'Who is most likely to scream the loudest during a horror movie jump scare in theaters?',
  'Who is most likely to win Bigg Boss Telugu purely through accidental comedy?',
  'Who is most likely to start an argument over who is the greater Tollywood hero?',
  'Who is most likely to spend their entire paycheck on a first-day-first-show VIP movie ticket?',
  'Who is most likely to forget their own birthday or an important anniversary?',
  'Who is most likely to survive a zombie apocalypse by hiding behind everyone else?'
];

export function getRandomMLTPrompts(count: number = 6): string[] {
  return [...MOST_LIKELY_TO_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, count);
}
