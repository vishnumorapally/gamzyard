// client/src/games/guessthesong/songs.ts

export interface TollywoodSongRiddle {
  id: string;
  songTitle: string;
  movie: string;
  singers: string;
  composer: string;
  lyricSnippet: string;
  blankWord: string;
  melodyNotes: number[]; // frequencies for Web Audio synth preview
  options: string[];
  correctIndex: number;
}

export const TOLLYWOOD_SONG_RIDDLES: TollywoodSongRiddle[] = [
  {
    id: 'gts-1',
    songTitle: 'Samajavaragamana',
    movie: 'Ala Vaikunthapurramuloo',
    singers: 'Sid Sriram',
    composer: 'S. Thaman',
    lyricSnippet: 'Nee kaallani pattuku vadalanannavi choode naa kallu... Aa choopulanalla thokkuku vellaku _____ Samajavaragamana!',
    blankWord: 'dayaleda',
    melodyNotes: [440, 494, 523, 587, 659, 587, 523],
    options: ['Samajavaragamana', 'Butta Bomma', 'Inkem Inkem', 'Adiga Adiga'],
    correctIndex: 0
  },
  {
    id: 'gts-2',
    songTitle: 'Naatu Naatu',
    movie: 'RRR',
    singers: 'Rahul Sipligunj, Kaala Bhairava',
    composer: 'M.M. Keeravani',
    lyricSnippet: 'Pola gattu dummu lona potharaju gaddalona, erra jonna rotti lona mirapa thokku kalipinattu... _____ Naatu Naatu!',
    blankWord: 'Naatu',
    melodyNotes: [330, 392, 440, 494, 587, 494, 440],
    options: ['Dosti', 'Komuram Bheemudo', 'Naatu Naatu', 'Raamam Raaghavam'],
    correctIndex: 2
  },
  {
    id: 'gts-3',
    songTitle: 'Oo Antava Mava.. Oo Oo Antava',
    movie: 'Pushpa: The Rise',
    singers: 'Indravathi Chauhan',
    composer: 'Devi Sri Prasad (DSP)',
    lyricSnippet: 'Koka koka kadithe oka laaga choostharu, potti gavunu vesthe inkolaaga choostharu... _____ mava oo oo antava!',
    blankWord: 'Oo Antava',
    melodyNotes: [261, 293, 330, 392, 330, 293, 261],
    options: ['Saami Saami', 'Srivalli', 'Oo Antava Mava', 'Eyy Bidda Idhi Naa Adda'],
    correctIndex: 2
  },
  {
    id: 'gts-4',
    songTitle: 'Butta Bomma',
    movie: 'Ala Vaikunthapurramuloo',
    singers: 'Armaan Malik',
    composer: 'S. Thaman',
    lyricSnippet: 'Inthakannaa manchi polikedhi naaku thattaleede, aunaunaunaunaunaunantoo vennelochhi thakene... _____ Butta Bomma!',
    blankWord: 'Butta Bomma',
    melodyNotes: [392, 440, 494, 523, 494, 440, 392],
    options: ['Ramuloo Ramulaa', 'Butta Bomma', 'OMG Daddy', 'He\'s So Cute'],
    correctIndex: 1
  },
  {
    id: 'gts-5',
    songTitle: 'Inkem Inkem Inkem Kaavaale',
    movie: 'Geetha Govindam',
    singers: 'Sid Sriram',
    composer: 'Gopi Sundar',
    lyricSnippet: 'Inkem inkem inkem kaavaale, chaale idhi chaale... Neekai nuvve vachhi vaalave _____ chelike!',
    blankWord: 'kalloki',
    melodyNotes: [440, 523, 587, 659, 587, 523, 440],
    options: ['Vachindamma', 'Inkem Inkem Inkem Kaavaale', 'Yenti Yenti', 'Kanureppala Kaalam'],
    correctIndex: 1
  },
  {
    id: 'gts-6',
    songTitle: 'Saranga Dariya',
    movie: 'Love Story',
    singers: 'Mangli',
    composer: 'Pawan Ch',
    lyricSnippet: 'Daani kunkuma bathuku daani cheera bathuku... Adhi ramasilaka laaga thirige daani kanti merupu _____!',
    blankWord: 'Saranga Dariya',
    melodyNotes: [523, 587, 659, 698, 659, 587, 523],
    options: ['Saranga Dariya', 'Ay Pilla', 'Evo Evo Kalalu', 'Nee Chitram Choosi'],
    correctIndex: 0
  }
];

export function getRandomSongRiddles(count: number = 5): TollywoodSongRiddle[] {
  return [...TOLLYWOOD_SONG_RIDDLES].sort(() => 0.5 - Math.random()).slice(0, count);
}
