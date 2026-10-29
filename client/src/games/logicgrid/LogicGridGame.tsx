// client/src/games/logicgrid/LogicGridGame.tsx
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Brain, Check, RotateCcw, Trophy, Sparkles, BookOpen } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { recordGameResult } from '../../services/storage';

interface LogicPuzzle {
  title: string;
  story: string;
  category1: string;
  category2: string;
  category3: string;
  items1: string[];
  items2: string[];
  items3: string[];
  clues: string[];
  solution: {
    [item1: string]: { item2: string; item3: string };
  };
}

const PUZZLES: LogicPuzzle[] = [
  {
    title: 'The Legends Assembly',
    story: 'Three iconic champions from different realms have arrived with their signature artifacts at distinct citadels.',
    category1: 'Hero',
    category2: 'Weapon',
    category3: 'Citadel',
    items1: ['Batman', 'Iron Man', 'Baahubali'],
    items2: ['Batarang', 'Arc Reactor', 'Royal Sword'],
    items3: ['Gotham', 'New York', 'Mahishmati'],
    clues: [
      '1. The protector of Gotham relies on the precision Batarang.',
      '2. Baahubali wields the heavy Royal Sword in combat.',
      '3. The billionaire with the Arc Reactor operates out of New York.',
      '4. Neither the Royal Sword nor the Batarang belongs to New York.'
    ],
    solution: {
      'Batman': { item2: 'Batarang', item3: 'Gotham' },
      'Iron Man': { item2: 'Arc Reactor', item3: 'New York' },
      'Baahubali': { item2: 'Royal Sword', item3: 'Mahishmati' }
    }
  },
  {
    title: 'Tollywood Cine Squad',
    story: 'Three legendary filmmakers are shooting their next magnum opuses across distinct scenic locations.',
    category1: 'Director',
    category2: 'Genre',
    category3: 'Location',
    items1: ['Rajamouli', 'Sukumar', 'Prashanth Neel'],
    items2: ['Period Epic', 'Rustic Crime', 'Coal Mine Action'],
    items3: ['Hyderabad', 'Seshachalam', 'KGF Mines'],
    clues: [
      '1. Sukumar is shooting his intense Rustic Crime saga in Seshachalam.',
      '2. Rajamouli is helming the grand Period Epic in Hyderabad.',
      '3. Prashanth Neel is not filming in Seshachalam.',
      '4. The Coal Mine Action film is being staged at KGF Mines.'
    ],
    solution: {
      'Rajamouli': { item2: 'Period Epic', item3: 'Hyderabad' },
      'Sukumar': { item2: 'Rustic Crime', item3: 'Seshachalam' },
      'Prashanth Neel': { item2: 'Coal Mine Action', item3: 'KGF Mines' }
    }
  }
];

interface LogicGridGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const LogicGridGame: React.FC<LogicGridGameProps> = ({
  mode,
  onExit
}) => {
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const puzzle = PUZZLES[puzzleIndex];

  const [gridState, setGridState] = useState<Record<string, 'O' | 'X' | null>>({});
  const [checkedClues, setCheckedClues] = useState<Record<number, boolean>>({});
  const [solved, setSolved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getCellKey = (a: string, b: string) => `${a}:::${b}`;

  const toggleCell = (a: string, b: string) => {
    sound.play('click');
    const key = getCellKey(a, b);
    const cur = gridState[key];
    const next = cur === null || cur === undefined ? 'X' : cur === 'X' ? 'O' : null;
    setGridState(prev => ({
      ...prev,
      [key]: next
    }));
    setErrorMsg(null);
  };

  const toggleClue = (idx: number) => {
    sound.play('click');
    setCheckedClues(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const verifySolution = () => {
    let allMatchesFound = true;

    for (const item1 of puzzle.items1) {
      const sol = puzzle.solution[item1];
      const hasItem2 = gridState[getCellKey(item1, sol.item2)] === 'O';
      const hasItem3 = gridState[getCellKey(item1, sol.item3)] === 'O';

      if (!hasItem2 || !hasItem3) {
        allMatchesFound = false;
        break;
      }
    }

    if (allMatchesFound) {
      sound.play('win');
      setSolved(true);
      confetti({ particleCount: 75, spread: 65 });
      recordGameResult('win');
    } else {
      sound.play('loss');
      setErrorMsg('Some deductions are incomplete or incorrect. Review the clues carefully!');
    }
  };

  const resetPuzzle = () => {
    setGridState({});
    setCheckedClues({});
    setSolved(false);
    setErrorMsg(null);
  };

  const nextPuzzle = () => {
    setPuzzleIndex(prev => (prev + 1) % PUZZLES.length);
    resetPuzzle();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4 text-white max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900/90 p-4 rounded-3xl border border-indigo-500/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Logic Grid Puzzle
            </h2>
            <p className="text-xs text-slate-400">{puzzle.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetPuzzle}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={nextPuzzle}
            className="px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Switch Puzzle
          </button>
        </div>
      </div>

      {/* Story & Clues Section */}
      <div className="w-full grid md:grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" /> Story & Mission
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">{puzzle.story}</p>
          <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            Click grid cells to cycle: <span className="text-rose-400 font-bold">X</span> (eliminated) → <span className="text-emerald-400 font-bold">O</span> (confirmed match) → Blank.
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Deductive Clues
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {puzzle.clues.map((clue, idx) => (
              <div
                key={idx}
                onClick={() => toggleClue(idx)}
                className={`p-2 rounded-xl text-xs cursor-pointer transition-all border flex items-start gap-2 ${
                  checkedClues[idx]
                    ? 'bg-emerald-950/40 text-slate-500 border-emerald-900/40 line-through'
                    : 'bg-slate-900/70 text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                  checkedClues[idx] ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-600'
                }`}>
                  {checkedClues[idx] && '✓'}
                </div>
                <span>{clue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logic Grid Table */}
      <div className="w-full overflow-x-auto bg-slate-950/90 p-5 rounded-3xl border border-indigo-500/30 shadow-xl backdrop-blur-xl mb-4">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 border border-slate-800 bg-slate-900 text-slate-400 font-bold">
                {puzzle.category1}
              </th>
              {puzzle.items2.map(i2 => (
                <th key={i2} className="p-2 border border-slate-800 bg-indigo-950/40 text-indigo-300 font-bold text-center">
                  {i2}
                </th>
              ))}
              {puzzle.items3.map(i3 => (
                <th key={i3} className="p-2 border border-slate-800 bg-purple-950/40 text-purple-300 font-bold text-center">
                  {i3}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {puzzle.items1.map(i1 => (
              <tr key={i1}>
                <td className="p-2 border border-slate-800 bg-slate-900/80 font-bold text-slate-200">
                  {i1}
                </td>
                {puzzle.items2.map(i2 => {
                  const val = gridState[getCellKey(i1, i2)];
                  return (
                    <td
                      key={i2}
                      onClick={() => toggleCell(i1, i2)}
                      className="p-3 border border-slate-800 text-center cursor-pointer hover:bg-slate-850 transition-all"
                    >
                      {val === 'O' && <span className="text-emerald-400 font-black text-lg">O</span>}
                      {val === 'X' && <span className="text-rose-400 font-black text-lg">✕</span>}
                    </td>
                  );
                })}
                {puzzle.items3.map(i3 => {
                  const val = gridState[getCellKey(i1, i3)];
                  return (
                    <td
                      key={i3}
                      onClick={() => toggleCell(i1, i3)}
                      className="p-3 border border-slate-800 text-center cursor-pointer hover:bg-slate-850 transition-all"
                    >
                      {val === 'O' && <span className="text-emerald-400 font-black text-lg">O</span>}
                      {val === 'X' && <span className="text-rose-400 font-black text-lg">✕</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errorMsg && (
        <div className="mb-4 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-xl animate-shake">
          {errorMsg}
        </div>
      )}

      {/* Verify Button */}
      {!solved ? (
        <button
          onClick={verifySolution}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center gap-2"
        >
          <Check className="w-5 h-5" /> Verify Deduction
        </button>
      ) : (
        <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl text-center animate-fade-in flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <span className="text-base font-black text-emerald-300">GENIUS DEDUCTION ACCOMPLISHED!</span>
          <p className="text-xs text-slate-300">You resolved all connections logically.</p>
          <button
            onClick={nextPuzzle}
            className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs"
          >
            Play Next Scenario
          </button>
        </div>
      )}
    </div>
  );
};
export default LogicGridGame;
