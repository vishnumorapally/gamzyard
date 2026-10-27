// client/src/games/trivia/questions.ts

export interface TriviaQuestion {
  id: string;
  category: 'Gaming' | 'Tech & AI' | 'Science & Cosmos' | 'Pop Culture' | 'History';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // --- GAMING ---
  {
    id: 'g1',
    category: 'Gaming',
    question: 'In Minecraft, what special item is required to brew potions of Invisibility?',
    options: ['Fermented Spider Eye', 'Ghast Tear', 'Blaze Powder', 'Nether Wart'],
    correctIndex: 0,
    explanation: 'Fermented Spider Eye corrupts Night Vision potion into an Invisibility potion.'
  },
  {
    id: 'g2',
    category: 'Gaming',
    question: 'What is the highest achievable level in the classic 1980 arcade version of Pac-Man before the kill screen?',
    options: ['Level 100', 'Level 256', 'Level 500', 'Level 999'],
    correctIndex: 1,
    explanation: 'Level 256 causes an 8-bit integer overflow, rendering the right half of the screen unplayable.'
  },
  {
    id: 'g3',
    category: 'Gaming',
    question: 'In the Witcher franchise, what is the legendary steel and silver sword school Geralt belongs to?',
    options: ['School of the Viper', 'School of the Cat', 'School of the Wolf', 'School of the Griffin'],
    correctIndex: 2,
    explanation: 'Geralt of Rivia is a master witcher from the School of the Wolf.'
  },
  {
    id: 'g4',
    category: 'Gaming',
    question: 'Which iconic video game hero made their first appearance under the name "Jumpman"?',
    options: ['Mega Man', 'Sonic the Hedgehog', 'Mario', 'Crash Bandicoot'],
    correctIndex: 2,
    explanation: 'Mario was originally named Jumpman in the 1981 arcade hit Donkey Kong.'
  },
  {
    id: 'g5',
    category: 'Gaming',
    question: 'In Valorant, which agent possesses the ultimate ability known as "Empress"?',
    options: ['Jett', 'Reyna', 'Raze', 'Viper'],
    correctIndex: 1,
    explanation: 'Reyna enters an enhanced frenzy state when activating her ultimate "Empress".'
  },
  {
    id: 'g6',
    category: 'Gaming',
    question: 'What is the maximum number of players that can compete simultaneously in standard Battle Royale Fortnite?',
    options: ['50', '64', '100', '150'],
    correctIndex: 2,
    explanation: 'Fortnite Battle Royale matches feature 100 players dropping onto the island.'
  },

  // --- TECH & AI ---
  {
    id: 't1',
    category: 'Tech & AI',
    question: 'What does the abbreviation "LLM" stand for in modern Artificial Intelligence?',
    options: ['Logical Learning Machine', 'Large Language Model', 'Linked Logic Matrix', 'Linear Language Module'],
    correctIndex: 1,
    explanation: 'Large Language Model (LLM) refers to transformer models trained on massive text corpuses.'
  },
  {
    id: 't2',
    category: 'Tech & AI',
    question: 'Who is recognized as the world\'s first computer programmer for their work on Babbage\'s Analytical Engine?',
    options: ['Alan Turing', 'Ada Lovelace', 'Grace Hopper', 'Claude Shannon'],
    correctIndex: 1,
    explanation: 'Ada Lovelace published the first algorithm designed to be processed by a machine in 1843.'
  },
  {
    id: 't3',
    category: 'Tech & AI',
    question: 'In computer networking, which default port is used for secure encrypted HTTPS web traffic?',
    options: ['Port 21', 'Port 80', 'Port 443', 'Port 8080'],
    correctIndex: 2,
    explanation: 'Port 443 is the standard registered port for secure SSL/TLS HTTPS communication.'
  },
  {
    id: 't4',
    category: 'Tech & AI',
    question: 'Which quantum mechanical property allows quantum computers to represent 0 and 1 simultaneously?',
    options: ['Superposition', 'Quantum Tunneling', 'Atomic Decay', 'Thermal Fluctuations'],
    correctIndex: 0,
    explanation: 'Superposition allows a quantum qubit to exist in a linear combination of states |0⟩ and |1⟩.'
  },
  {
    id: 't5',
    category: 'Tech & AI',
    question: 'What revolutionary AI architecture was introduced in Google\'s 2017 paper "Attention Is All You Need"?',
    options: ['Recurrent Neural Network', 'Transformer', 'Convolutional Network', 'Hopfield Network'],
    correctIndex: 1,
    explanation: 'The Transformer architecture revolutionized NLP, LLMs, and modern generative AI.'
  },
  {
    id: 't6',
    category: 'Tech & AI',
    question: 'Which popular programming language was originally called "Oak" during its inception at Sun Microsystems?',
    options: ['Java', 'Python', 'C++', 'Ruby'],
    correctIndex: 0,
    explanation: 'James Gosling originally named Java "Oak" after an oak tree standing outside his office.'
  },

  // --- SCIENCE & COSMOS ---
  {
    id: 's1',
    category: 'Science & Cosmos',
    question: 'What is the boundary around a black hole beyond which nothing, not even light, can escape called?',
    options: ['Singularity', 'Photon Sphere', 'Accretion Disk', 'Event Horizon'],
    correctIndex: 3,
    explanation: 'The event horizon is the critical threshold of a black hole where escape velocity exceeds light speed.'
  },
  {
    id: 's2',
    category: 'Science & Cosmos',
    question: 'Which planet in our solar system has the most extreme winds, reaching up to 2,100 km/h (1,300 mph)?',
    options: ['Jupiter', 'Saturn', 'Neptune', 'Venus'],
    correctIndex: 2,
    explanation: 'Neptune hosts the fiercest supersonic windstorms recorded anywhere in our solar system.'
  },
  {
    id: 's3',
    category: 'Science & Cosmos',
    question: 'What element on the periodic table has the highest melting point of all known metals at 3,422°C?',
    options: ['Titanium', 'Platinum', 'Tungsten', 'Osmium'],
    correctIndex: 2,
    explanation: 'Tungsten (W) possesses the highest melting point of all refractory metals.'
  },
  {
    id: 's4',
    category: 'Science & Cosmos',
    question: 'Approximately how long does it take for light emitted from the Sun to reach planet Earth?',
    options: ['8 seconds', '8 minutes 20 seconds', '1 hour', 'Instantaneous'],
    correctIndex: 1,
    explanation: 'Sunlight travels 150 million kilometers in approximately 8 minutes and 20 seconds.'
  },
  {
    id: 's5',
    category: 'Science & Cosmos',
    question: 'Which subatomic particle carries a negative electric charge?',
    options: ['Proton', 'Neutron', 'Electron', 'Positron'],
    correctIndex: 2,
    explanation: 'Electrons are fundamental leptons carrying an elementary charge of -1.'
  },

  // --- POP CULTURE ---
  {
    id: 'p1',
    category: 'Pop Culture',
    question: 'In the Marvel Cinematic Universe, what is the fictional African nation ruled by King T\'Challa?',
    options: ['Genosha', 'Wakanda', 'Latveria', 'Sokovia'],
    correctIndex: 1,
    explanation: 'Wakanda is the technologically advanced, vibranium-rich kingdom of Black Panther.'
  },
  {
    id: 'p2',
    category: 'Pop Culture',
    question: 'In the Lord of the Rings, what is the Elvish word spoken by Gandalf to open the doors of Moria?',
    options: ['Mellon', 'Edro', 'Namarie', 'Aiya'],
    correctIndex: 0,
    explanation: '"Mellon" translates to "Friend" in Sindarin, unlocking the West Gate of Moria.'
  },
  {
    id: 'p3',
    category: 'Pop Culture',
    question: 'Which film won the Academy Award for Best Picture in 2024?',
    options: ['Barbie', 'Oppenheimer', 'Poor Things', 'Killers of the Flower Moon'],
    correctIndex: 1,
    explanation: 'Christopher Nolan\'s epic biographical drama Oppenheimer swept Best Picture in 2024.'
  },
  {
    id: 'p4',
    category: 'Pop Culture',
    question: 'In the anime series "Attack on Titan", which Scout Regiment commander devised the Long-Range Scouting Formation?',
    options: ['Levi Ackerman', 'Erwin Smith', 'Hange Zoe', 'Dot Pyxis'],
    correctIndex: 1,
    explanation: 'Commander Erwin Smith engineered the tactical long-range scouting formation to minimize casualties.'
  },

  // --- HISTORY ---
  {
    id: 'h1',
    category: 'History',
    question: 'In which year did the Apollo 11 mission successfully land the first humans on the Moon?',
    options: ['1965', '1969', '1972', '1975'],
    correctIndex: 1,
    explanation: 'Neil Armstrong and Buzz Aldrin stepped onto the lunar surface on July 20, 1969.'
  },
  {
    id: 'h2',
    category: 'History',
    question: 'Which ancient wonder of the world is the only one still largely intact today?',
    options: ['Hanging Gardens of Babylon', 'Colossus of Rhodes', 'Great Pyramid of Giza', 'Lighthouse of Alexandria'],
    correctIndex: 2,
    explanation: 'The Great Pyramid of Giza in Egypt has stood preserved for over 4,500 years.'
  },
  {
    id: 'h3',
    category: 'History',
    question: 'Who was the first emperor of unified China, famous for commissioning the Terracotta Army?',
    options: ['Qin Shi Huang', 'Han Wudi', 'Kublai Khan', 'Sun Tzu'],
    correctIndex: 0,
    explanation: 'Qin Shi Huang founded the Qin dynasty and unified China in 221 BC.'
  }
];

export function getRandomTriviaRound(count: number = 5): TriviaQuestion[] {
  const shuffled = [...TRIVIA_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
