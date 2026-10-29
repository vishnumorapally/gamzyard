// client/src/games/imposterword/ImposterWordGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Users,
  Bot,
  Eye,
  EyeOff,
  Skull,
  Shield,
  Vote,
  Sparkles,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { WordPair, getRandomImposterPair } from './words';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface ImposterPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  role: 'civilian' | 'imposter';
  assignedWord: string;
  clueSubmitted?: string;
  votesReceived: number;
}

interface ImposterWordGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const ImposterWordGame: React.FC<ImposterWordGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 4,
  multiplayerData,
  onExit
}) => {
  const [pair, setPair] = useState<WordPair>(() => getRandomImposterPair());
  const [phase, setPhase] = useState<'reveal' | 'clues' | 'voting' | 'result'>('reveal');
  const [showSecretWord, setShowSecretWord] = useState(false);
  const [myClueInput, setMyClueInput] = useState('');
  const [myVote, setMyVote] = useState<string | null>(null);

  const initialPlayers: ImposterPlayer[] = useMemo(() => {
    const count = Math.max(3, Math.min(8, playerCount));
    const imposterIdx = Math.floor(Math.random() * count);

    const botNames = ['Bramhi Bot', 'Nani AI', 'Mahesh AI', 'Samantha Bot', 'Vijay AI'];
    const list: ImposterPlayer[] = [];

    for (let i = 0; i < count; i++) {
      const isImposter = i === imposterIdx;
      const isMe = i === 0;
      list.push({
        id: isMe ? 'player_1' : `bot_${i + 1}`,
        name: isMe ? 'You' : botNames[i - 1] || `Player ${i + 1}`,
        avatar: isMe ? 'fox' : 'robot',
        isBot: !isMe,
        role: isImposter ? 'imposter' : 'civilian',
        assignedWord: isImposter ? pair.imposterWord : pair.civilianWord,
        votesReceived: 0
      });
    }
    return list;
  }, [playerCount, pair]);

  const [players, setPlayers] = useState<ImposterPlayer[]>(initialPlayers);
  const [gameOver, setGameOver] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState<'civilians' | 'imposter' | null>(null);

  const me = players.find(p => p.id === 'player_1') || players[0];
  const imposterPlayer = players.find(p => p.role === 'imposter');

  // Submit human clue
  const handleSubmitClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myClueInput.trim()) return;

    sound.play('click');
    const updated = players.map(p => {
      if (p.id === 'player_1') return { ...p, clueSubmitted: myClueInput.trim() };
      if (p.isBot) {
        const pool = pair.sampleClues;
        const randomClue = pool[Math.floor(Math.random() * pool.length)];
        return { ...p, clueSubmitted: randomClue };
      }
      return p;
    });

    setPlayers(updated);
    setPhase('voting');
  };

  // Submit human vote
  const handleVote = (candidateId: string) => {
    if (myVote) return;
    setMyVote(candidateId);
    sound.play('click');

    // Simulate bot votes
    const votesTallies: Record<string, number> = { [candidateId]: 1 };
    players.forEach(p => {
      if (p.isBot) {
        const targets = players.filter(t => t.id !== p.id);
        const randomTarget = targets[Math.floor(Math.random() * targets.length)].id;
        votesTallies[randomTarget] = (votesTallies[randomTarget] || 0) + 1;
      }
    });

    // Determine convicted player
    let maxVotes = -1;
    let convictedId: string | null = null;
    Object.entries(votesTallies).forEach(([id, vCount]) => {
      if (vCount > maxVotes) {
        maxVotes = vCount;
        convictedId = id;
      }
    });

    setTimeout(() => {
      setPhase('result');
      const isImposterCaught = convictedId === imposterPlayer?.id;
      if (isImposterCaught) {
        setWinnerTeam('civilians');
        sound.play('win');
        confetti({ particleCount: 75, spread: 80 });
      } else {
        setWinnerTeam('imposter');
        sound.play('loss');
      }
      setGameOver(true);
      recordGameResult(isImposterCaught ? 'win' : 'loss');
    }, 1200);
  };

  const handleRematch = () => {
    const newPair = getRandomImposterPair();
    setPair(newPair);
    setPhase('reveal');
    setShowSecretWord(false);
    setMyClueInput('');
    setMyVote(null);
    setGameOver(false);
    setWinnerTeam(null);

    const count = players.length;
    const imposterIdx = Math.floor(Math.random() * count);
    setPlayers(prev =>
      prev.map((p, idx) => {
        const isImp = idx === imposterIdx;
        return {
          ...p,
          role: isImp ? 'imposter' : 'civilian',
          assignedWord: isImp ? newPair.imposterWord : newPair.civilianWord,
          clueSubmitted: undefined,
          votesReceived: 0
        };
      })
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className="w-full bg-slate-950/95 border-2 border-red-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(239,68,68,0.25)] flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md">
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-black tracking-wider text-rose-400 uppercase">
              Imposter Among Us · Word Clash ({pair.category})
            </span>
          </div>
          <span className="text-xs text-amber-400 font-bold uppercase">
            Phase: {phase}
          </span>
        </div>

        {/* Secret Word Card */}
        <div className="w-full bg-slate-900 border-2 border-rose-500/30 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Your Secret Word Card
            </span>
            <button
              onClick={() => setShowSecretWord(!showSecretWord)}
              className="text-slate-400 hover:text-white p-1"
            >
              {showSecretWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="my-2">
            {showSecretWord ? (
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-wide">
                {me.assignedWord}
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-500 italic">
                (Click eye icon to reveal your secret word safely)
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            One of you is the Imposter with a slightly different word or no clue!
          </div>
        </div>

        {/* Phase 1: Reveal to Clues transition */}
        {phase === 'reveal' && (
          <button
            onClick={() => setPhase('clues')}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
          >
            I Have Seen My Word ▶ Proceed to Clues
          </button>
        )}

        {/* Phase 2: Enter Clue */}
        {phase === 'clues' && (
          <form onSubmit={handleSubmitClue} className="w-full max-w-md flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">
              Give a 1-Word Subtle Clue to prove you belong:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={myClueInput}
                onChange={e => setMyClueInput(e.target.value)}
                placeholder="e.g. Aroma, Kingdom, Royal..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!myClueInput.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                Submit Clue
              </button>
            </div>
          </form>
        )}

        {/* Phase 3: Voting on who is Imposter */}
        {phase === 'voting' && (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Vote className="w-4 h-4" /> Who is the Imposter? Inspect Clues & Vote:
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {players.map(p => {
                const isSelected = myVote === p.id;
                return (
                  <button
                    key={p.id}
                    disabled={myVote !== null}
                    onClick={() => handleVote(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                      isSelected ? 'bg-rose-950/90 border-rose-500 text-rose-200' : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-rose-500/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        {p.isBot ? <Bot className="w-3 h-3 text-cyan-400" /> : <Users className="w-3 h-3 text-amber-400" />}
                        {p.name}
                      </div>
                      <div className="text-xs text-amber-300 font-mono mt-0.5">
                        Clue: "{p.clueSubmitted || 'Thinking...'}"
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {isSelected ? 'VOTED' : 'Vote Out'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase 4: Results */}
        {phase === 'result' && (
          <div className="w-full bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 text-center flex flex-col items-center gap-2 animate-fadeIn">
            <h3 className="text-xl font-black text-amber-300">
              {winnerTeam === 'civilians' ? '🎉 CIVILIANS WIN! Imposter Discovered!' : '💀 IMPOSTER WINS! They Blended In!'}
            </h3>
            <div className="text-xs text-slate-300">
              The Imposter was: <strong className="text-rose-400">{imposterPlayer?.name}</strong> (Assigned: "{pair.imposterWord}")
            </div>
            <div className="text-xs text-slate-400">
              Civilians Secret Word was: <strong className="text-emerald-400">{pair.civilianWord}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-rose-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">
              {winnerTeam === 'civilians' ? 'Civilians Victory!' : 'Imposter Triumph!'}
            </h2>
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
