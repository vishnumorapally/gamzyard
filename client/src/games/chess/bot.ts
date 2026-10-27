// client/src/games/chess/bot.ts
import { Chess, Square } from 'chess.js';
import { BotDifficulty } from '../../types';

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Positional bonus for piece advancement/center control
function evaluateBoard(game: Chess, botColor: 'w' | 'b'): number {
  let score = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        let val = PIECE_VALUES[piece.type] || 0;
        // Central bonus
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
          val += 15;
        }

        if (piece.color === botColor) {
          score += val;
        } else {
          score -= val;
        }
      }
    }
  }

  if (game.isCheckmate()) {
    return game.turn() === botColor ? -99999 : 99999;
  }

  return score;
}

export function getChessBotMove(game: Chess, difficulty: BotDifficulty): { from: Square; to: Square; promotion?: string } | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const botColor = game.turn();

  // 1. Easy: Mostly random, slight capture bias
  if (difficulty === 'easy') {
    const captures = moves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.4) {
      const chosen = captures[Math.floor(Math.random() * captures.length)];
      return { from: chosen.from, to: chosen.to, promotion: 'q' };
    }
    const chosen = moves[Math.floor(Math.random() * moves.length)];
    return { from: chosen.from, to: chosen.to, promotion: 'q' };
  }

  // 2. Medium: 1-Ply Lookahead
  if (difficulty === 'medium') {
    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      game.move(move);
      const score = evaluateBoard(game, botColor);
      game.undo();

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { from: bestMove.from, to: bestMove.to, promotion: 'q' };
  }

  // 3. Hard: 2-ply Minimax with Alpha-Beta Pruning
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    game.move(move);

    let minOpponentScore = Infinity;
    const opponentMoves = game.moves({ verbose: true });

    if (opponentMoves.length === 0) {
      if (game.isCheckmate()) minOpponentScore = -99999;
      else minOpponentScore = 0;
    } else {
      for (const opMove of opponentMoves) {
        game.move(opMove);
        const evalScore = evaluateBoard(game, botColor);
        game.undo();
        if (evalScore < minOpponentScore) {
          minOpponentScore = evalScore;
        }
      }
    }

    game.undo();

    if (minOpponentScore > bestScore) {
      bestScore = minOpponentScore;
      bestMove = move;
    }
  }

  return { from: bestMove.from, to: bestMove.to, promotion: 'q' };
}
