// client/src/games/neverhaveiever/prompts.ts

export const NHIE_PROMPTS = [
  'Never have I ever whistled or thrown paper in a theater during a hero intro scene.',
  'Never have I ever eaten biryani with a fork or spoon instead of my hands.',
  'Never have I ever tried doing the "Pushpa" shoulder walk in public.',
  'Never have I ever pretended to be on an important phone call to avoid someone.',
  'Never have I ever watched a Telugu movie first-day-first-show (FDFS).',
  'Never have I ever argued passionately with someone over which hero is the real Tollywood King.',
  'Never have I ever taken extra sweets or mutton pieces at a wedding buffet when nobody was looking.',
  'Never have I ever pretended to understand the entire plot of a Christopher Nolan movie.',
  'Never have I ever tried the "Naatu Naatu" hook step and pulled a muscle.',
  'Never have I ever binge-watched an entire Telugu TV serial or Bigg Boss episode with my grandma.',
  'Never have I ever stalked an ex on Instagram from a fake profile.',
  'Never have I ever walked out of a movie theater before the climax because the movie was so bad.',
  'Never have I ever delivered a mass Telugu dialogue in real life to look cool.',
  'Never have I ever accidentally liked someone\'s photo from 3 years ago while stalking.',
  'Never have I ever sung a Tollywood song out loud thinking nobody was listening when someone was right behind me.'
];

export function getRandomNHIEPrompts(count: number = 8): string[] {
  return [...NHIE_PROMPTS].sort(() => 0.5 - Math.random()).slice(0, count);
}
