// client/src/games/whoknowsmebest/questions.ts

export interface VIPQuestion {
  id: string;
  question: string;
  options: string[];
}

export const VIP_QUESTIONS: VIPQuestion[] = [
  {
    id: 'v-1',
    question: 'If the VIP was offered a dream lead role in a Tollywood movie, who would they choose to direct it?',
    options: ['S.S. Rajamouli', 'Sukumar', 'Trivikram Srinivas', 'Puri Jagannadh']
  },
  {
    id: 'v-2',
    question: 'What is the VIP\'s ultimate comfort food during a rainy evening in Hyderabad/AP?',
    options: ['Hot Mirchi Bajji & Irani Chai', 'Dum Biryani', 'Crispy Dosa with Ginger Chutney', 'Maggi Noodles']
  },
  {
    id: 'v-3',
    question: 'Which legendary Telugu mass movie would the VIP watch on repeat on a Sunday afternoon?',
    options: ['Athadu', 'Pokiri', 'Ala Vaikunthapurramuloo', 'Baahubali 2']
  },
  {
    id: 'v-4',
    question: 'What is the VIP\'s biggest pet peeve?',
    options: ['People who text "k"', 'Spoilers for new movies', 'Slow internet / buffering', 'Cold food']
  },
  {
    id: 'v-5',
    question: 'If the VIP won ₹10 Crores in a lottery tomorrow, what would be their very first purchase?',
    options: ['Luxury Beach Villa in Vizag', 'Supercar / Sports Car', 'World Tour with Friends', 'Produce their own Telugu movie']
  },
  {
    id: 'v-6',
    question: 'Which song would the VIP blast at full volume while on a highway road trip?',
    options: ['Naatu Naatu (RRR)', 'Samajavaragamana', 'Dheemthanana', 'Garam Garam (Saripodhaa Sanivaaram)']
  }
];

export function getRandomVIPQuestions(count: number = 5): VIPQuestion[] {
  return [...VIP_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, count);
}
