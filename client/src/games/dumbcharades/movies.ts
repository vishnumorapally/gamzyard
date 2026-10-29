// client/src/games/dumbcharades/movies.ts

export interface TollywoodCharadesMovie {
  id: string;
  title: string;
  year: number;
  wordCount: number;
  starring: string;
  director: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  actingCues: string[];
}

export const TOLLYWOOD_CHARADES_MOVIES: TollywoodCharadesMovie[] = [
  {
    id: 'dc-1',
    title: 'Baahubali: The Beginning',
    year: 2015,
    wordCount: 3,
    starring: 'Prabhas, Rana Daggubati',
    director: 'S.S. Rajamouli',
    difficulty: 'Easy',
    actingCues: ['Lift an imaginary giant Shiva Lingam onto your shoulder', 'Draw a huge bow and arrow', 'Show huge biceps']
  },
  {
    id: 'dc-2',
    title: 'Pushpa: The Rise',
    year: 2021,
    wordCount: 3,
    starring: 'Allu Arjun, Rashmika Mandanna',
    director: 'Sukumar',
    difficulty: 'Easy',
    actingCues: ['Do the iconic raised shoulder shrug', 'Stroke your chin / beard ("Thaggede Le")', 'Drive an imaginary red sanders lorry']
  },
  {
    id: 'dc-3',
    title: 'Eega',
    year: 2012,
    wordCount: 1,
    starring: 'Nani, Samantha, Sudeep',
    director: 'S.S. Rajamouli',
    difficulty: 'Easy',
    actingCues: ['Buzz your hands like tiny fly wings', 'Rub your front fly paws together', 'Do miniature fly karate kicks']
  },
  {
    id: 'dc-4',
    title: 'RRR',
    year: 2022,
    wordCount: 1,
    starring: 'NTR Jr, Ram Charan',
    director: 'S.S. Rajamouli',
    difficulty: 'Easy',
    actingCues: ['Fast Naatu Naatu suspender dance step', 'Imitate a roaring tiger', 'Ride an imaginary horse and motorcycle']
  },
  {
    id: 'dc-5',
    title: 'Jersey',
    year: 2019,
    wordCount: 1,
    starring: 'Nani, Shraddha Srinath',
    director: 'Gowtam Tinnanuri',
    difficulty: 'Medium',
    actingCues: ['Batting stance and hit a cover drive', 'Scream with joy at a train station', 'Show a cricket jersey']
  },
  {
    id: 'dc-6',
    title: 'Mayabazar',
    year: 1957,
    wordCount: 1,
    starring: 'NTR, ANR, S.V. Ranga Rao, Savitri',
    director: 'K.V. Reddy',
    difficulty: 'Medium',
    actingCues: ['Eat huge imaginary laddus like Ghatotkacha', 'Rub a huge round belly and laugh heartily', 'Show a magical wooden box']
  },
  {
    id: 'dc-7',
    title: 'Rangasthalam',
    year: 2018,
    wordCount: 1,
    starring: 'Ram Charan, Samantha',
    director: 'Sukumar',
    difficulty: 'Medium',
    actingCues: ['Cup your hand behind your ear to show hearing difficulty', 'Drive an irrigation water motor pump', 'Villager mass lungi dance']
  },
  {
    id: 'dc-8',
    title: 'Kalki 2898 AD',
    year: 2024,
    wordCount: 3,
    starring: 'Prabhas, Amitabh Bachchan, Kamal Haasan',
    director: 'Nag Ashwin',
    difficulty: 'Hard',
    actingCues: ['Drive a futuristic AI car (Bujji)', 'Swing an ancient divine staff / mace', 'Show a futuristic laser gun']
  },
  {
    id: 'dc-9',
    title: 'Arjun Reddy',
    year: 2017,
    wordCount: 2,
    starring: 'Vijay Deverakonda, Shalini Pandey',
    director: 'Sandeep Reddy Vanga',
    difficulty: 'Easy',
    actingCues: ['Stethoscope around neck as angry doctor', 'Ride a Royal Enfield bullet aggressively', 'Put on sunglasses and look furious']
  },
  {
    id: 'dc-10',
    title: 'Ala Vaikunthapurramuloo',
    year: 2020,
    wordCount: 1,
    starring: 'Allu Arjun, Pooja Hegde',
    director: 'Trivikram Srinivas',
    difficulty: 'Medium',
    actingCues: ['Do the Butta Bomma hand wave step', 'Flip your coat over your shoulder', 'Boardroom dance meeting']
  }
];

export function getRandomCharadesMovie(): TollywoodCharadesMovie {
  return TOLLYWOOD_CHARADES_MOVIES[Math.floor(Math.random() * TOLLYWOOD_CHARADES_MOVIES.length)];
}
