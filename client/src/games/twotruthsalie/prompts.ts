// client/src/games/twotruthsalie/prompts.ts

export interface TwoTruthsSet {
  id: string;
  topic: string;
  statements: string[];
  lieIndex: number; // 0, 1, or 2
  explanation: string;
}

export const TWO_TRUTHS_SETS: TwoTruthsSet[] = [
  {
    id: 'tt-1',
    topic: 'Tollywood Legends & Records',
    statements: [
      'S.S. Rajamouli has never directed a commercial box office failure in his entire career.',
      'Prabhas did not sign any other movie for nearly 5 full years while dedicating himself to Baahubali.',
      'Allu Arjun made his very first film appearance as an adult lead in "Gangotri".'
    ],
    lieIndex: 2,
    explanation: 'LIE! Allu Arjun actually debuted as a child artist in Megastar Chiranjeevi\'s 1985 classic film "Vijetha" at age 3!'
  },
  {
    id: 'tt-2',
    topic: 'Oscar Glories & Hyderabad Pride',
    statements: [
      'Ramoji Film City in Hyderabad is officially certified by Guinness World Records as the world\'s largest film studio.',
      'Music director M.M. Keeravani and director S.S. Rajamouli are first cousins.',
      'The Oscar-winning song "Naatu Naatu" from RRR was shot in front of the White House in Washington D.C.'
    ],
    lieIndex: 2,
    explanation: 'LIE! "Naatu Naatu" was shot in front of the Mariinskyi Palace (the official ceremonial residence of the President of Ukraine) in Kyiv!'
  },
  {
    id: 'tt-3',
    topic: 'Tollywood Blockbusters',
    statements: [
      'Mahesh Babu\'s blockbuster "Pokiri" ran for 100 days in more than 200 centers across AP and Telangana.',
      'Nani worked as an assistant director under Srinu Vaitla and Bapu before becoming a natural star lead actor.',
      'Rana Daggubati used a real live wild bull for the iconic arena wrestling sequence in Baahubali.'
    ],
    lieIndex: 2,
    explanation: 'LIE! The ferocious charging bull in Baahubali was entirely crafted using cutting-edge CGI visual effects!'
  },
  {
    id: 'tt-4',
    topic: 'Cinema Trivia & Secrets',
    statements: [
      'The fly in "Eega" had 3D computer models built with over 200,000 polygons to capture realistic micro-expressions.',
      'Allu Arjun\'s "Pushpa: The Rise" was originally planned as a two-part web series before turning into a pan-India movie.',
      'Samantha Ruth Prabhu made her Telugu film acting debut in "Attarintiki Daredi".'
    ],
    lieIndex: 2,
    explanation: 'LIE! Samantha made her iconic debut in Gautham Vasudev Menon\'s "Ye Maaya Chesave" opposite Naga Chaitanya!'
  },
  {
    id: 'tt-5',
    topic: 'Tollywood Music & Cult Hits',
    statements: [
      'Devi Sri Prasad (DSP) composed music for his first feature film "Devi" at the young age of just 19.',
      'Pawan Kalyan choreographed his own martial arts fight sequences in "Badri" and "Thammudu".',
      'The iconic dialogue "Evadu kodithe dimma thirigi..." was originally written for Pawan Kalyan before Mahesh Babu.'
    ],
    lieIndex: 2,
    explanation: 'LIE! Director Puri Jagannadh wrote "Pokiri" (initially titled Uttam Singh) specifically for Ravi Teja and then pitched it directly to Mahesh Babu!'
  }
];

export function getRandomTwoTruths(count: number = 5): TwoTruthsSet[] {
  return [...TWO_TRUTHS_SETS].sort(() => 0.5 - Math.random()).slice(0, count);
}
