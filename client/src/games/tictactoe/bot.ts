// client/src/games/tictactoe/bot.ts
import { BotDifficulty } from '../../types';

export type BoardState = (string | null)[];

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export function checkWinner(board: BoardState): { winner: string | null; line: number[] | null } {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}

export function isBoardFull(board: BoardState): boolean {
  return board.every(cell => cell !== null);
}

function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  botSymbol: string,
  humanSymbol: string
): { score: number; index?: number } {
  const { winner } = checkWinner(board);
  if (winner === botSymbol) return { score: 10 - depth };
  if (winner === humanSymbol) return { score: depth - 10 };
  if (isBoardFull(board)) return { score: 0 };

  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestIndex = emptyIndices[0];

    for (const idx of emptyIndices) {
      board[idx] = botSymbol;
      const result = minimax(board, depth + 1, false, botSymbol, humanSymbol);
      board[idx] = null;
      if (result.score > maxScore) {
        maxScore = result.score;
        bestIndex = idx;
      }
    }
    return { score: maxScore, index: bestIndex };
  } else {
    let minScore = Infinity;
    let bestIndex = emptyIndices[0];

    for (const idx of emptyIndices) {
      board[idx] = humanSymbol;
      const result = minimax(board, depth + 1, true, botSymbol, humanSymbol);
      board[idx] = null;
      if (result.score < minScore) {
        minScore = result.score;
        bestIndex = idx;
      }
    }
    return { score: minScore, index: bestIndex };
  }
}

export function getTicTacToeBotMove(
  board: BoardState,
  difficulty: BotDifficulty,
  botSymbol: string = 'O',
  humanSymbol: string = 'X'
): number {
  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (emptyIndices.length === 0) return -1;

  if (difficulty === 'easy') {
    // 80% random, 20% smart
    if (Math.random() < 0.8) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
  } else if (difficulty === 'medium') {
    // 40% random, 60% smart
    if (Math.random() < 0.4) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
  }

  // Master / Unbeatable Minimax
  const { index } = minimax([...board], 0, true, botSymbol, humanSymbol);
  return index !== undefined ? index : emptyIndices[0];
}
