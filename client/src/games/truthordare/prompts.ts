// client/src/games/truthordare/prompts.ts

export interface PromptItem {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  category: 'Party' | 'Tollywood' | 'Spicy' | 'Crazy';
  teluguMovieReference?: string;
}

export const TRUTH_PROMPTS: PromptItem[] = [
  { id: 't-1', type: 'truth', text: 'Which Tollywood movie is your absolute guilty pleasure that you have watched more than 5 times?', category: 'Tollywood' },
  { id: 't-2', type: 'truth', text: 'If you had to switch lives with any Telugu film celebrity for 24 hours, who would it be and why?', category: 'Tollywood' },
  { id: 't-3', type: 'truth', text: 'What is the most embarrassing thing you have ever done in front of a crush?', category: 'Spicy' },
  { id: 't-4', type: 'truth', text: 'Have you ever secretly eaten the last piece of Hyderabadi Biryani and blamed someone else?', category: 'Party' },
  { id: 't-5', type: 'truth', text: 'Which Tollywood mass dialogue do you repeat in front of the bathroom mirror when nobody is watching?', category: 'Tollywood' },
  { id: 't-6', type: 'truth', text: 'What is the biggest lie you have told your parents to go out with friends?', category: 'Spicy' },
  { id: 't-7', type: 'truth', text: 'If you could erase one movie you paid to watch in theaters from your memory, which would it be?', category: 'Party' },
  { id: 't-8', type: 'truth', text: 'Who in this room/game do you think would be the first to get eliminated in a Squid Game situation?', category: 'Party' },
  { id: 't-9', type: 'truth', text: 'What is your weirdest habit that no one in your family knows about?', category: 'Crazy' },
  { id: 't-10', type: 'truth', text: 'If you were cast in an S.S. Rajamouli magnum opus, would you play the hero, heroine, villain, or comic sidekick?', category: 'Tollywood' },
  { id: 't-11', type: 'truth', text: 'What is the most ridiculous excuse you ever made to skip college or work?', category: 'Party' },
  { id: 't-12', type: 'truth', text: 'Which Telugu actor\'s dance step have you tried and miserably failed at?', category: 'Tollywood' }
];

export const DARE_PROMPTS: PromptItem[] = [
  { id: 'd-1', type: 'dare', text: 'Do the signature hook step of "Naatu Naatu" or "Butta Bomma" with full energy!', category: 'Tollywood' },
  { id: 'd-2', type: 'dare', text: 'Deliver Balakrishna\'s "Flute jinka mundu oodali, simham mundu kaadu" dialogue with maximum roar!', category: 'Tollywood' },
  { id: 'd-3', type: 'dare', text: 'Send a message to your best friend saying: "Bava... nenu Bigg Boss Telugu ki select ayya!" and do not explain for 2 minutes.', category: 'Crazy' },
  { id: 'd-4', type: 'dare', text: 'Act like Brahmanandam in "Venky" (Gajala from Washington DC) for the next 45 seconds.', category: 'Tollywood' },
  { id: 'd-5', type: 'dare', text: 'Sing the chorus of "Oo Antava" or "Samajavaragamana" in an ultra-dramatic opera singer voice!', category: 'Tollywood' },
  { id: 'd-6', type: 'dare', text: 'Imitate Allu Arjun\'s "Thaggede Le" shoulder shrug pose and keep it for 30 seconds.', category: 'Tollywood' },
  { id: 'd-7', type: 'dare', text: 'Talk in slow-motion robot voice until your next turn arrives.', category: 'Crazy' },
  { id: 'd-8', type: 'dare', text: 'Deliver Mahesh Babu\'s iconic "Evadu kodithe dimma thirigi mind block aipoddo..." with intense eye contact!', category: 'Tollywood' },
  { id: 'd-9', type: 'dare', text: 'Do 10 rapid squats while chanting "Tollywood Rocks!" on every squat.', category: 'Crazy' },
  { id: 'd-10', type: 'dare', text: 'Act like Kota Srinivasa Rao or Ali in your favorite comedy scene.', category: 'Tollywood' }
];

export function getRandomPrompt(type: 'truth' | 'dare'): PromptItem {
  const pool = type === 'truth' ? TRUTH_PROMPTS : DARE_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
