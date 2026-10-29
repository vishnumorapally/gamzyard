// client/src/games/guesstheword/words.ts

export interface WordRiddle {
  word: string;
  category: string;
  hint: string;
}

export const GUESS_WORDS_POOL: WordRiddle[] = [
  { word: 'BIRYANI', category: 'Hyderabadi Cuisine', hint: 'The world-famous aromatic basmati rice dish cooked with spices & meat' },
  { word: 'BAAHUBALI', category: 'Indian Cinema', hint: 'S.S. Rajamouli\'s monumental cinematic masterpiece that shook Indian box office' },
  { word: 'CHARMINAR', category: 'Heritage Monument', hint: 'Historical 1591 monument with four majestic minarets in Old Hyderabad' },
  { word: 'GOLCONDA', category: 'Fortress', hint: 'Famous medieval fortress where the Koh-i-Noor diamond was once stored' },
  { word: 'SANKRANTI', category: 'Telugu Festival', hint: 'Major harvest festival celebrated with colorful kites, rangoli, and haridasu' },
  { word: 'TOLLEWOOD', category: 'Film Industry', hint: 'The Telugu film industry centered around Hyderabad' },
  { word: 'GONGURA', category: 'Andhra Specialty', hint: 'The tangy sorrel leaf famous in Andhra pickles and curries' },
  { word: 'KUCHIPUDI', category: 'Classical Dance', hint: 'The classical dance form originating from Krishna district in Andhra Pradesh' }
];

export function getRandomWord(): WordRiddle {
  return GUESS_WORDS_POOL[Math.floor(Math.random() * GUESS_WORDS_POOL.length)];
}
