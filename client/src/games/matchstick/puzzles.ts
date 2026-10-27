// client/src/games/matchstick/puzzles.ts

export interface MatchstickPuzzle {
  id: string;
  initialEquation: string; // e.g. "6 + 4 = 4"
  rule: string; // "Move 1 matchstick to fix the equation"
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export const MATCHSTICK_PUZZLES: MatchstickPuzzle[] = [
  {
    id: 'm1',
    initialEquation: '6 + 4 = 4',
    rule: 'Move 1 matchstick to make the equation true',
    options: [
      { text: '0 + 4 = 4', isCorrect: true, explanation: 'Move the middle horizontal matchstick of 6 to the side to make 0 + 4 = 4!' },
      { text: '5 + 4 = 9', isCorrect: true, explanation: 'Take the vertical stick from 6 to make 5, and add to the last 4 to make 9!' },
      { text: '6 - 4 = 2', isCorrect: false, explanation: 'Requires moving 2 matchsticks, not 1.' },
      { text: '8 - 4 = 4', isCorrect: false, explanation: 'Requires adding a matchstick.' }
    ]
  },
  {
    id: 'm2',
    initialEquation: '5 + 7 = 2',
    rule: 'Move 1 matchstick to make the equation true',
    options: [
      { text: '9 - 7 = 2', isCorrect: true, explanation: 'Move the vertical stick from the + sign to the 5 to form 9 - 7 = 2!' },
      { text: '5 + 1 = 6', isCorrect: false, explanation: 'Requires moving 2 matchsticks.' },
      { text: '5 - 3 = 2', isCorrect: false, explanation: 'Cannot form 3 with 1 move.' },
      { text: '3 + 7 = 10', isCorrect: false, explanation: 'Cannot form 10 with 1 move.' }
    ]
  },
  {
    id: 'm3',
    initialEquation: '9 - 5 = 9',
    rule: 'Move 1 matchstick to make the equation true',
    options: [
      { text: '3 + 5 = 8', isCorrect: true, explanation: 'Turn 9 into 3 and move stick to the - sign to make +!' },
      { text: '8 - 5 = 3', isCorrect: true, explanation: 'Move top right of last 9 to the first 9 to make 8 - 5 = 3!' },
      { text: '9 - 0 = 9', isCorrect: false, explanation: 'Requires adding matchsticks.' },
      { text: '9 - 5 = 4', isCorrect: false, explanation: 'Requires moving 2 matchsticks.' }
    ]
  },
  {
    id: 'm4',
    initialEquation: '3 + 3 = 8',
    rule: 'Move 1 matchstick to make the equation true',
    options: [
      { text: '3 + 5 = 8', isCorrect: true, explanation: 'Move the bottom-right stick of the second 3 to the top-left to make 3 + 5 = 8!' },
      { text: '5 + 3 = 8', isCorrect: true, explanation: 'Move the bottom-right stick of the first 3 to the top-left to make 5 + 3 = 8!' },
      { text: '3 + 3 = 6', isCorrect: false, explanation: 'Requires removing 2 matchsticks.' },
      { text: '9 - 3 = 6', isCorrect: false, explanation: 'Requires moving 2 matchsticks.' }
    ]
  },
  {
    id: 'm5',
    initialEquation: '8 - 3 = 9',
    rule: 'Move 1 matchstick to make the equation true',
    options: [
      { text: '6 + 3 = 9', isCorrect: true, explanation: 'Move the top-right stick from 8 to turn - into + to make 6 + 3 = 9!' },
      { text: '8 - 3 = 5', isCorrect: false, explanation: 'Requires removing 2 sticks.' },
      { text: '9 - 0 = 9', isCorrect: false, explanation: 'Requires moving 2 sticks.' },
      { text: '8 - 2 = 6', isCorrect: false, explanation: 'Requires moving 2 sticks.' }
    ]
  },
  {
    id: 'm6',
    initialEquation: '0 + 2 = 8',
    rule: 'Move 1 matchstick to make the equation true',
    options: [
      { text: '6 + 2 = 8', isCorrect: true, explanation: 'Move the middle horizontal stick from 8 into 0 to make 6 + 2 = 8!' },
      { text: '0 + 8 = 8', isCorrect: false, explanation: 'Requires adding 2 sticks.' },
      { text: '9 - 1 = 8', isCorrect: false, explanation: 'Requires moving 3 sticks.' },
      { text: '0 + 2 = 2', isCorrect: false, explanation: 'Requires removing 3 sticks.' }
    ]
  }
];

export function getRandomMatchstickSet(count: number = 3): MatchstickPuzzle[] {
  const shuffled = [...MATCHSTICK_PUZZLES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
