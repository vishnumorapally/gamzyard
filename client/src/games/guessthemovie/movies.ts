// client/src/games/guessthemovie/movies.ts

export interface GuessMovieItem {
  id: string;
  title: string;
  emojis: string;
  iconicDialogue: string;
  plotRiddle: string;
  starring: string;
  options: string[];
  correctIndex: number;
}

export const GUESS_TELUGU_MOVIES: GuessMovieItem[] = [
  {
    id: 'gtm-1',
    title: 'Eega',
    emojis: '🪰 🥋 🪡 💥 💀',
    iconicDialogue: '"Nenu malli puttina... ninna champataanike!"',
    plotRiddle: 'A murdered lover reincarnates as a tiny insect with laser focus to drive his arrogant wealthy killer mad with sleepless terror.',
    starring: 'Nani, Samantha, Sudeep',
    options: ['Eega', 'Magadheera', 'Arundhati', 'Robo'],
    correctIndex: 0
  },
  {
    id: 'gtm-2',
    title: 'Pokiri',
    emojis: '🔫 🕶️ 👮 🏢 💣',
    iconicDialogue: '"Evadu kodithe dimma thirigi mind block aipoddo... aade Pandu gadu!"',
    plotRiddle: 'A ruthless gun-for-hire gangster terrorizes the mafia underworld until an explosive climax reveals his true undercover identity.',
    starring: 'Mahesh Babu, Ileana D\'Cruz',
    options: ['Businessman', 'Athadu', 'Pokiri', 'Dookudu'],
    correctIndex: 2
  },
  {
    id: 'gtm-3',
    title: 'Pushpa: The Rise',
    emojis: '🪵 🪓 🚚 🧔 🚔',
    iconicDialogue: '"Pushpa ante flower anukuntiva? Fire-u! Thaggede Le!"',
    plotRiddle: 'A fearless daily-wage coolie rises through the treacherous ranks of a red sandalwood smuggling syndicate in Seshachalam forests.',
    starring: 'Allu Arjun, Rashmika Mandanna, Fahadh Faasil',
    options: ['Rangasthalam', 'Pushpa: The Rise', 'Sarrainodu', 'Ala Vaikunthapurramuloo'],
    correctIndex: 1
  },
  {
    id: 'gtm-4',
    title: 'Jersey',
    emojis: '🏏 🚂 🎟️ 👨‍👦 💔',
    iconicDialogue: '"Never give up, Arjun. Nee gurinchi nuvvu aalochinchaku, nee kodukiki hero la undu!"',
    plotRiddle: 'A 36-year-old retired cricketer returns to the pitch against all medical and financial odds to fulfill his son\'s wish for a team jersey.',
    starring: 'Nani, Shraddha Srinath',
    options: ['Jersey', 'Majili', 'Goli Soda', 'Dear Comrade'],
    correctIndex: 0
  },
  {
    id: 'gtm-5',
    title: 'Baahubali 2: The Conclusion',
    emojis: '👑 ⚔️ 🏰 🗡️ 🩸',
    iconicDialogue: '"Kattappa... Baahubali ni enduku champavu?"',
    plotRiddle: 'A prince learns his true heritage, avenges his royal parents, and destroys the tyrannical king who betrayed his brother.',
    starring: 'Prabhas, Anushka Shetty, Rana Daggubati',
    options: ['Magadheera', 'Baahubali 2: The Conclusion', 'Kalki 2898 AD', 'Sye Raa Narasimha Reddy'],
    correctIndex: 1
  },
  {
    id: 'gtm-6',
    title: 'Arjun Reddy',
    emojis: '🩺 🏍️ 🕶️ 🍷 💔',
    iconicDialogue: '"Em maatladuthunnav ra madarchod! Nuvvu nannu vadilesi vellipothava?"',
    plotRiddle: 'A brilliant high-temper orthopedic surgeon spirals into severe self-destruction and addiction after his girlfriend is forced into marriage.',
    starring: 'Vijay Deverakonda, Shalini Pandey',
    options: ['Animal', 'Geetha Govindam', 'Arjun Reddy', 'Baby'],
    correctIndex: 2
  },
  {
    id: 'gtm-7',
    title: 'Ala Vaikunthapurramuloo',
    emojis: '💼 👶 🔄 🏰 👞',
    iconicDialogue: '"Madam Sir, Madam Anthe!"',
    plotRiddle: 'Two newborn baby boys are secretly swapped at birth by a jealous clerk, leading to a hilarious clash of destiny in a billionaire\'s mansion.',
    starring: 'Allu Arjun, Pooja Hegde',
    options: ['Ala Vaikunthapurramuloo', 'Attarintiki Daredi', 'Race Gurram', 'Srimanthudu'],
    correctIndex: 0
  },
  {
    id: 'gtm-8',
    title: 'Athadu',
    emojis: '🎯 🚂 🏡 🕶️ 🌾',
    iconicDialogue: '"Nenu okasari commit aithe na maata nene vinanu!"',
    plotRiddle: 'A framed professional sniper takes refuge in a traditional joint family village by pretending to be their long-lost grandson Pardhu.',
    starring: 'Mahesh Babu, Trisha',
    options: ['Khaleja', 'Athadu', 'Okkadu', 'Murari'],
    correctIndex: 1
  }
];

export function getRandomTeluguMovieQuestions(count: number = 6): GuessMovieItem[] {
  return [...GUESS_TELUGU_MOVIES].sort(() => 0.5 - Math.random()).slice(0, count);
}
