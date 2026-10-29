// client/src/games/rapidfire/questions.ts

export interface RapidFireQuestion {
  id: string;
  prompt: string;
  option1: string;
  option2: string;
}

export const RAPID_FIRE_QUESTIONS: RapidFireQuestion[] = [
  { id: 'rf-1', prompt: 'Which Tollywood Titan?', option1: 'Mahesh Babu', option2: 'Allu Arjun' },
  { id: 'rf-2', prompt: 'Director Style?', option1: 'Rajamouli Grand Epic', option2: 'Puri Jagannadh Raw Mass' },
  { id: 'rf-3', prompt: 'Iconic Telugu Food?', option1: 'Hyderabadi Dum Biryani', option2: 'Andhra Gongura Mutton' },
  { id: 'rf-4', prompt: 'Magnum Opus Matchup?', option1: 'Baahubali: The Beginning', option2: 'RRR (Roudram Ranam Rudhiram)' },
  { id: 'rf-5', prompt: 'Music Maestro?', option1: 'Devi Sri Prasad (DSP)', option2: 'M.M. Keeravani' },
  { id: 'rf-6', prompt: 'Legendary Comedy King?', option1: 'Brahmanandam', option2: 'Ali' },
  { id: 'rf-7', prompt: 'Theater Vibe?', option1: 'Screaming FDFS 4 AM Show', option2: 'Peaceful Weekend Multiplex' },
  { id: 'rf-8', prompt: 'Cult Mass Film?', option1: 'Pokiri', option2: 'Magadheera' },
  { id: 'rf-9', prompt: 'Daily Chai Ritual?', option1: 'Morning Masala Chai', option2: 'Midnight Old City Irani Chai' },
  { id: 'rf-10', prompt: 'Dance Anthem?', option1: 'Naatu Naatu', option2: 'Butta Bomma' }
];

export function getRandomRapidFireQuestions(count: number = 8): RapidFireQuestion[] {
  return [...RAPID_FIRE_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, count);
}
