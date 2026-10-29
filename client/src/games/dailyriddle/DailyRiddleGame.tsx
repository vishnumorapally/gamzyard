// client/src/games/dailyriddle/DailyRiddleGame.tsx
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Key, HelpCircle, Flame, Trophy } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';

interface RiddleItem {
  id: number;
  riddle: string;
  answer: string;
  hint1: string;
  hint2: string;
  category: string;
}

const RIDDLES: RiddleItem[] = [
  {
    id: 1,
    riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "ECHO",
    hint1: "It bounces back in canyons and empty halls.",
    hint2: "Starts with the letter 'E'",
    category: "Classic Enigma"
  },
  {
    id: 2,
    riddle: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?",
    answer: "KEYBOARD",
    hint1: "You use it every day to write messages and code.",
    hint2: "Has letters, numbers, and an Enter key.",
    category: "Modern Puzzle"
  },
  {
    id: 3,
    riddle: "I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost every person. What am I?",
    answer: "PENCIL LEAD",
    hint1: "Found inside writing instruments.",
    hint2: "Made of graphite.",
    category: "Everyday Riddle"
  },
  {
    id: 4,
    riddle: "I fly without wings, I cry without eyes. Whenever I lead, darkness flies. What am I?",
    answer: "CLOUD",
    hint1: "Floating high above the earth, bringing rain.",
    hint2: "White and fluffy or dark and stormy.",
    category: "Nature"
  },
  {
    id: 5,
    riddle: "In Tollywood epics, I am lifted by a mighty prince at the waterfall to fulfill a mother's wish. What sacred idol am I?",
    answer: "SHIVA LINGAM",
    hint1: "Baahubali lifts this on his shoulders.",
    hint2: "Placed under the cascading waters.",
    category: "Tollywood Legend"
  },
  {
    id: 6,
    riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "MAP",
    hint1: "Travellers consult me on journeys.",
    hint2: "A 2D representation of the world.",
    category: "Geography"
  },
  {
    id: 7,
    riddle: "The person who makes it has no need of it; the person who buys it has no use for it. The person who uses it can neither see nor feel it. What is it?",
    answer: "COFFIN",
    hint1: "Associated with resting in peace.",
    hint2: "Buried underground.",
    category: "Dark Riddle"
  }
];

interface DailyRiddleGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const DailyRiddleGame: React.FC<DailyRiddleGameProps> = ({
  mode,
  onExit
}) => {
  const [riddleIndex, setRiddleIndex] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set());
  const [activeHint, setActiveHint] = useState<number>(0);
  const [solved, setSolved] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('gamzyard_riddle_streak') || '1', 10);
  });
  const [errorShake, setErrorShake] = useState<boolean>(false);

  const riddle = RIDDLES[riddleIndex];
  const cleanAns = riddle.answer.replace(/\s+/g, '');

  const handleRevealLetter = () => {
    sound.play('click');
    const unrevealed: number[] = [];
    for (let i = 0; i < cleanAns.length; i++) {
      if (!revealedLetters.has(i)) unrevealed.push(i);
    }
    if (unrevealed.length > 0) {
      const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedLetters(prev => new Set(prev).add(idx));
    }
  };

  const handleShowHint = () => {
    sound.play('click');
    setActiveHint(prev => Math.min(2, prev + 1));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guess.trim() || solved) return;

    const normalizedGuess = guess.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normalizedTarget = riddle.answer.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (normalizedGuess === normalizedTarget) {
      sound.play('win');
      setSolved(true);
      confetti({ particleCount: 75, spread: 65 });
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('gamzyard_riddle_streak', newStreak.toString());
      recordGameResult('win');
    } else {
      sound.play('loss');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const nextRiddle = () => {
    setRiddleIndex(prev => (prev + 1) % RIDDLES.length);
    setGuess('');
    setRevealedLetters(new Set());
    setActiveHint(0);
    setSolved(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] p-4 text-white max-w-xl mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900/90 p-4 rounded-3xl border border-amber-500/30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200">
              Daily Riddle
            </h2>
            <div className="text-xs text-slate-400 font-medium">
              {riddle.category} • Riddle #{riddle.id}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-2xl">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase leading-none">Streak</span>
            <span className="text-base font-black text-amber-300">{streak} Days</span>
          </div>
        </div>
      </div>

      {/* Main Riddle Container */}
      <div className="w-full relative bg-slate-950/90 rounded-3xl border border-amber-500/30 p-6 flex flex-col items-center shadow-2xl backdrop-blur-xl">
        <div className="text-amber-400/90 text-xs font-bold uppercase tracking-widest mb-3">
          Solve the Enigma
        </div>

        {/* Riddle Text */}
        <div className="py-6 px-6 bg-slate-900/80 rounded-2xl border border-slate-800/80 mb-6 w-full text-center shadow-inner">
          <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed italic">
            "{riddle.riddle}"
          </p>
        </div>

        {/* Hints Box */}
        {activeHint > 0 && (
          <div className="w-full mb-5 space-y-2 animate-fade-in">
            {activeHint >= 1 && (
              <div className="text-xs p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong className="text-amber-300">Hint 1:</strong> {riddle.hint1}</span>
              </div>
            )}
            {activeHint >= 2 && (
              <div className="text-xs p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong className="text-cyan-300">Hint 2:</strong> {riddle.hint2}</span>
              </div>
            )}
          </div>
        )}

        {/* Answer Boxes display */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {riddle.answer.split(' ').map((word, wIdx) => (
            <div key={wIdx} className="flex gap-1.5 mr-3 last:mr-0">
              {word.split('').map((char, cIdx) => {
                const globalIdx = riddle.answer.slice(0, riddle.answer.indexOf(word) + cIdx).replace(/\s+/g, '').length;
                const isRevealed = solved || revealedLetters.has(globalIdx);

                return (
                  <div
                    key={cIdx}
                    className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xl transition-all ${
                      isRevealed
                        ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {isRevealed ? char : '_'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Input & Form */}
        {!solved ? (
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div className={`flex gap-2 ${errorShake ? 'animate-shake' : ''}`}>
              <input
                type="text"
                value={guess}
                onChange={e => setGuess(e.target.value)}
                placeholder="Type your answer..."
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-slate-500 font-semibold"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-bold rounded-2xl text-slate-950 text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                Submit
              </button>
            </div>

            {/* Hint & Reveal buttons */}
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={handleShowHint}
                disabled={activeHint >= 2}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-all"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                {activeHint === 0 ? 'Need a Clue?' : activeHint === 1 ? 'Unlock Clue 2' : 'All Clues Unlocked'}
              </button>

              <button
                type="button"
                onClick={handleRevealLetter}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-all"
              >
                <Key className="w-4 h-4 text-cyan-400" />
                Reveal Letter
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full bg-emerald-950/80 border-2 border-emerald-500/50 p-6 rounded-2xl text-center animate-fade-in flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-emerald-300">BRILLIANT MINDBENDER!</h3>
            <p className="text-xs text-slate-300">
              The answer is indeed <span className="font-bold text-amber-400 uppercase">{riddle.answer}</span>!
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={nextRiddle}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 font-bold rounded-xl text-slate-950 text-xs shadow-lg active:scale-95 transition-all"
              >
                Next Riddle Challenge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DailyRiddleGame;
