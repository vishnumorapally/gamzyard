// client/src/games/mostlikelyto/MostLikelyToGame.tsx
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Bot,
  Flame,
  Sparkles,
  Vote,
  RotateCcw
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { getRandomMLTPrompts } from './prompts';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface MLTPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  votesReceived: number;
}

interface MostLikelyToGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const MostLikelyToGame: React.FC<MostLikelyToGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [prompts, setPrompts] = useState<string[]>(() => getRandomMLTPrompts(6));
  const [currentIdx, setCurrentIdx] = useState(0);

  const initialPlayers: MLTPlayer[] = useMemo(() => {
    if (mode === 'room' && multiplayerData?.allPlayers && multiplayerData.allPlayers.length > 0) {
      return multiplayerData.allPlayers.map(p => ({
        id: p.socketId,
        name: p.name,
        avatar: p.avatar || 'fox',
        isBot: !!p.isBot,
        votesReceived: 0
      }));
    }

    const count = Math.max(2, Math.min(8, playerCount));
    const list: MLTPlayer[] = [
      { id: 'player_1', name: 'You', avatar: 'fox', isBot: false, votesReceived: 0 }
    ];

    const botNames = ['Bramhi Bot', 'Allu Bot', 'Mahesh AI', 'Samantha Bot', 'Vijay AI'];
    for (let i = 1; i < count; i++) {
      list.push({
        id: `bot_${i + 1}`,
        name: botNames[i - 1] || `Player ${i + 1}`,
        avatar: 'robot',
        isBot: true,
        votesReceived: 0
      });
    }
    return list;
  }, [mode, multiplayerData, playerCount]);

  const [players, setPlayers] = useState<MLTPlayer[]>(initialPlayers);
  const [roundVotes, setRoundVotes] = useState<Record<string, string>>({}); // voterId -> candidateId
  const [myVote, setMyVote] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const isMultiplayer = mode !== 'bot';
  const myPlayerId = isMultiplayer ? multiplayerData?.you?.id || '' : 'player_1';
  const currentPrompt = prompts[currentIdx] || prompts[0];

  // Cast vote
  const handleVote = (candidateId: string) => {
    if (myVote || isRevealed) return;
    setMyVote(candidateId);
    sound.play('click');

    const votesMap: Record<string, string> = { [myPlayerId]: candidateId };

    // Simulate bot votes
    players.forEach(p => {
      if (p.isBot) {
        const randomTarget = players[Math.floor(Math.random() * players.length)].id;
        votesMap[p.id] = randomTarget;
      }
    });

    setRoundVotes(votesMap);

    setTimeout(() => {
      setIsRevealed(true);
      sound.play('win');

      // Update total votes
      setPlayers(prev =>
        prev.map(p => {
          const count = Object.values(votesMap).filter(v => v === p.id).length;
          return { ...p, votesReceived: p.votesReceived + count };
        })
      );
    }, 1200);
  };

  const handleNextPrompt = () => {
    if (currentIdx + 1 >= prompts.length) {
      setGameOver(true);
      recordGameResult('win');
      confetti({ particleCount: 75, spread: 80 });
    } else {
      setCurrentIdx(prev => prev + 1);
      setRoundVotes({});
      setMyVote(null);
      setIsRevealed(false);
    }
  };

  const handleRematch = () => {
    setPrompts(getRandomMLTPrompts(6));
    setCurrentIdx(0);
    setRoundVotes({});
    setMyVote(null);
    setIsRevealed(false);
    setGameOver(false);
    setPlayers(initialPlayers);
  };

  // Find round winner (who got most votes this round)
  const roundWinnerId = useMemo(() => {
    if (!isRevealed) return null;
    const tallies: Record<string, number> = {};
    Object.values(roundVotes).forEach(candId => {
      tallies[candId] = (tallies[candId] || 0) + 1;
    });
    let maxVotes = -1;
    let winnerId: string | null = null;
    Object.entries(tallies).forEach(([cId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = cId;
      }
    });
    return winnerId;
  }, [isRevealed, roundVotes]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-red-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-black tracking-wider text-rose-400 uppercase">
              Most Likely To · Round {currentIdx + 1} of {prompts.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {players.length} Players
          </span>
        </div>

        {/* Big Question Prompt */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
            <Vote className="w-3.5 h-3.5" /> Point Your Finger!
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white max-w-xl leading-relaxed">
            "{currentPrompt}"
          </h2>
        </div>

        {/* Candidates to vote for */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
          {players.map(p => {
            const votesThisRound = Object.values(roundVotes).filter(candId => candId === p.id).length;
            const isWinner = isRevealed && roundWinnerId === p.id;
            const isMyTarget = myVote === p.id;

            return (
              <button
                key={p.id}
                disabled={isRevealed || myVote !== null}
                onClick={() => handleVote(p.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-between gap-2 ${
                  isWinner
                    ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105'
                    : isMyTarget
                    ? 'bg-amber-950/80 border-amber-500'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate max-w-[120px]">
                  {p.isBot ? <Bot className="w-3 h-3 text-cyan-400" /> : <Users className="w-3 h-3 text-amber-400" />}
                  {p.name}
                </div>

                {isRevealed && (
                  <div className="text-xs font-black font-mono text-rose-400">
                    {votesThisRound} Votes!
                  </div>
                )}
                {!isRevealed && (
                  <div className="text-[10px] text-slate-500">
                    Click to Vote
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {isRevealed && (
          <button
            onClick={handleNextPrompt}
            className="mt-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
          >
            Next Prompt ▶
          </button>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-rose-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">Most Likely To Champion!</h2>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
              {[...players].sort((a, b) => b.votesReceived - a.votesReceived).map((p, rank) => (
                <div key={p.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold">#{rank + 1} {p.name}</span>
                  <span className="font-mono font-bold text-rose-400">{p.votesReceived} votes received</span>
                </div>
              ))}
            </div>
            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="rose"
            />
          </div>
        </div>
      )}
    </div>
  );
};
