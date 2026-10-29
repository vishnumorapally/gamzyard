// client/src/games/imposterword/words.ts

export interface WordPair {
  id: string;
  civilianWord: string;
  imposterWord: string;
  category: string;
  sampleClues: string[];
}

export const IMPOSTER_WORD_PAIRS: WordPair[] = [
  {
    id: 'iw-1',
    civilianWord: 'Hyderabadi Dum Biryani',
    imposterWord: 'Veg Pulav',
    category: 'Food & Cuisine',
    sampleClues: ['Basmati', 'Mutton', 'Spices', 'Dum', 'Old City', 'Pot']
  },
  {
    id: 'iw-2',
    civilianWord: 'Baahubali',
    imposterWord: 'Magadheera',
    category: 'Epic Cinema',
    sampleClues: ['Rajamouli', 'Sword', 'Crown', 'Kingdom', 'Mahishmati', 'Waterfall']
  },
  {
    id: 'iw-3',
    civilianWord: 'Charminar',
    imposterWord: 'Golconda Fort',
    category: 'Historical Landmarks',
    sampleClues: ['Minarets', 'Old City', 'Chai', 'Bangles', 'Monuments', '1591']
  },
  {
    id: 'iw-4',
    civilianWord: 'Allu Arjun',
    imposterWord: 'Ram Charan',
    category: 'Tollywood Mega Stars',
    sampleClues: ['Dance', 'Swag', 'Pushpa', 'National Award', 'Stylish', 'Cinema']
  },
  {
    id: 'iw-5',
    civilianWord: 'Irani Chai',
    imposterWord: 'Filter Coffee',
    category: 'Hyderabadi Beverages',
    sampleClues: ['Tea stall', 'Osmania Biscuit', 'Creamy', 'Evening', 'Chai', 'Old City']
  }
];

export function getRandomImposterPair(): WordPair {
  return IMPOSTER_WORD_PAIRS[Math.floor(Math.random() * IMPOSTER_WORD_PAIRS.length)];
}
