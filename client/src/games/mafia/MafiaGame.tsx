// client/src/games/mafia/MafiaGame.tsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Moon,
  Sun,
  Shield,
  Eye,
  EyeOff,
  Skull,
  Vote,
  Sparkles,
  Users,
  Bot
} from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import { MafiaRole, ROLE_INFOS } from './roles';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { RematchActions } from '../../components/game/RematchActions';

interface MafiaPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  role: MafiaRole;
  isAlive: boolean;
}

interface MafiaGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const MafiaGame: React.FC<MafiaGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 5,
  multiplayerData,
  onExit
}) => {
  const [dayNight, setDayNight] = useState<'night' | 'day'>('night');
  const [roundNumber, setRoundNumber] = useState(1);
  const [nightTarget, setNightTarget] = useState<string | null>(null);
  const [nightDoctorTarget, setNightDoctorTarget] = useState<string | null>(null);
  const [nightDetectiveTarget, setNightDetectiveTarget] = useState<string | null>(null);
  const [detectiveResult, setDetectiveResult] = useState<string | null>(null);
  const [dayVote, setDayVote] = useState<string | null>(null);
  const [narratorLogs, setNarratorLogs] = useState<string[]>([
    'Night has fallen over the town. Close your eyes. Mafia is hunting...'
  ]);
  const [showRoleSecret, setShowRoleSecret] = useState(false);

  // Initialize roles
  const initialPlayers: MafiaPlayer[] = useMemo(() => {
    const count = Math.max(4, Math.min(8, playerCount));
    const botNames = ['Bramhi Bot', 'Nani AI', 'Mahesh AI', 'Samantha Bot', 'Vijay AI', 'Prabhas Bot', 'Pooja AI'];
    const rolesPool: MafiaRole[] = ['mafia', 'detective', 'doctor'];
    while (rolesPool.length < count) {
      rolesPool.push('villager');
    }
    const shuffledRoles = [...rolesPool].sort(() => 0.5 - Math.random());

    const list: MafiaPlayer[] = [];
    for (let i = 0; i < count; i++) {
      const isMe = i === 0;
      list.push({
        id: isMe ? 'player_1' : `bot_${i + 1}`,
        name: isMe ? 'You' : botNames[i - 1] || `Player ${i + 1}`,
        avatar: isMe ? 'fox' : 'robot',
        isBot: !isMe,
        role: shuffledRoles[i],
        isAlive: true
      });
    }
    return list;
  }, [playerCount]);

  const [players, setPlayers] = useState<MafiaPlayer[]>(initialPlayers);
  const [gameOver, setGameOver] = useState(false);
  const [winningTeam, setWinningTeam] = useState<'town' | 'mafia' | null>(null);

  const me = players.find(p => p.id === 'player_1') || players[0];
  const livingPlayers = players.filter(p => p.isAlive);
  const livingMafia = players.filter(p => p.isAlive && p.role === 'mafia');
  const livingTown = players.filter(p => p.isAlive && p.role !== 'mafia');

  // Check win conditions
  const checkWinCondition = (currentPlayers: MafiaPlayer[]) => {
    const activeMafia = currentPlayers.filter(p => p.isAlive && p.role === 'mafia');
    const activeTown = currentPlayers.filter(p => p.isAlive && p.role !== 'mafia');

    if (activeMafia.length === 0) {
      setWinningTeam('town');
      setGameOver(true);
      sound.play('win');
      confetti({ particleCount: 80, spread: 90 });
      recordGameResult('win');
      return true;
    }
    if (activeMafia.length >= activeTown.length) {
      setWinningTeam('mafia');
      setGameOver(true);
      sound.play('loss');
      recordGameResult(me.role === 'mafia' ? 'win' : 'loss');
      return true;
    }
    return false;
  };

  // Night phase execution
  const handleNightAction = (targetId: string) => {
    if (me.role === 'mafia') {
      setNightTarget(targetId);
    } else if (me.role === 'doctor') {
      setNightDoctorTarget(targetId);
    } else if (me.role === 'detective') {
      setNightDetectiveTarget(targetId);
      const targetP = players.find(p => p.id === targetId);
      setDetectiveResult(targetP?.role === 'mafia' ? '🚨 IS MAFIA!' : '✅ Innocent Town Member');
    }
    sound.play('click');
  };

  // Resolve night and transition to day
  const resolveNightPhase = () => {
    sound.play('click');
    let mafiaVictimId = nightTarget;
    let doctorSaveId = nightDoctorTarget;

    // If bot was mafia or doctor, simulate their choices
    if (me.role !== 'mafia') {
      const targets = livingTown;
      if (targets.length > 0) {
        mafiaVictimId = targets[Math.floor(Math.random() * targets.length)].id;
      }
    }
    if (me.role !== 'doctor') {
      const living = livingPlayers;
      if (living.length > 0) {
        doctorSaveId = living[Math.floor(Math.random() * living.length)].id;
      }
    }

    let updated = [...players];
    let announceText = '';

    if (mafiaVictimId && mafiaVictimId === doctorSaveId) {
      announceText = '💉 Dawn arrives! The Doctor heroically saved the victim from the Mafia strike!';
    } else if (mafiaVictimId) {
      const victim = players.find(p => p.id === mafiaVictimId);
      announceText = `💀 Morning arrives with tragedy! ${victim?.name} was eliminated by the Mafia in the dark!`;
      updated = updated.map(p => (p.id === mafiaVictimId ? { ...p, isAlive: false } : p));
    }

    setNarratorLogs(prev => [announceText, ...prev.slice(0, 4)]);
    setPlayers(updated);

    if (checkWinCondition(updated)) return;

    // Transition to Day
    setDayNight('day');
    setNightTarget(null);
    setNightDoctorTarget(null);
    setNightDetectiveTarget(null);
  };

  // Day phase vote
  const handleDayVote = (suspectId: string) => {
    if (dayVote) return;
    setDayVote(suspectId);
    sound.play('click');

    // Simulate town voting
    const votes: Record<string, number> = { [suspectId]: 1 };
    players.forEach(p => {
      if (p.isAlive && p.isBot) {
        const candidates = players.filter(c => c.isAlive && c.id !== p.id);
        const rand = candidates[Math.floor(Math.random() * candidates.length)]?.id;
        if (rand) votes[rand] = (votes[rand] || 0) + 1;
      }
    });

    // Find lynch target
    let maxV = -1;
    let lynchedId: string | null = null;
    Object.entries(votes).forEach(([id, c]) => {
      if (c > maxV) {
        maxV = c;
        lynchedId = id;
      }
    });

    const lynchedPlayer = players.find(p => p.id === lynchedId);
    const announceLynch = `⚖️ The town tribunal voted! ${lynchedPlayer?.name} was executed! They were: ${ROLE_INFOS[lynchedPlayer?.role || 'villager'].name}`;

    const updated = players.map(p => (p.id === lynchedId ? { ...p, isAlive: false } : p));
    setNarratorLogs(prev => [announceLynch, ...prev.slice(0, 4)]);
    setPlayers(updated);

    if (checkWinCondition(updated)) return;

    // Transition back to night
    setTimeout(() => {
      setDayNight('night');
      setDayVote(null);
      setDetectiveResult(null);
      setRoundNumber(prev => prev + 1);
      setNarratorLogs(prev => ['Night falls once again. The remaining players sleep...', ...prev.slice(0, 4)]);
    }, 2800);
  };

  const handleRematch = () => {
    setDayNight('night');
    setRoundNumber(1);
    setNightTarget(null);
    setNightDoctorTarget(null);
    setNightDetectiveTarget(null);
    setDetectiveResult(null);
    setDayVote(null);
    setGameOver(false);
    setWinningTeam(null);
    setPlayers(initialPlayers);
    setNarratorLogs(['Night has fallen over the town. Close your eyes. Mafia is hunting...']);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-3 py-2 sm:px-4 sm:py-4 select-none">
      <div className={`w-full border-2 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-md transition-colors duration-700 ${
        dayNight === 'night' ? 'bg-slate-950/95 border-indigo-500/40 shadow-[0_0_35px_rgba(99,102,241,0.25)]' : 'bg-slate-900/95 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
      }`}>
        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            {dayNight === 'night' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className={`text-xs font-black tracking-wider uppercase ${dayNight === 'night' ? 'text-indigo-400' : 'text-amber-400'}`}>
              Mafia · {dayNight.toUpperCase()} Phase (Round {roundNumber})
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Alive: <strong className="text-white">{livingPlayers.length}</strong> / {players.length}
          </div>
        </div>

        {/* Secret Role Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Your Secret Identity
            </div>
            <div className="text-sm sm:text-base font-black text-white flex items-center gap-2 mt-0.5">
              <span>{ROLE_INFOS[me.role].icon}</span>
              <span>{ROLE_INFOS[me.role].name}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xs text-right hidden sm:block">
            {ROLE_INFOS[me.role].description}
          </p>
        </div>

        {/* Players Circle Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {players.map(p => {
            const isMe = p.id === 'player_1';
            let cardBg = p.isAlive ? 'bg-slate-900 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-40 line-through';

            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${cardBg}`}
              >
                <div className="text-xs font-bold text-white flex items-center gap-1 truncate max-w-[120px]">
                  {p.isBot ? <Bot className="w-3 h-3 text-cyan-400" /> : <Users className="w-3 h-3 text-amber-400" />}
                  {p.name}
                </div>
                <div className="text-[10px] font-mono mt-1 text-slate-400">
                  {p.isAlive ? 'ALIVE' : '💀 DEAD'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase Specific Interaction */}
        {dayNight === 'night' && (
          <div className="w-full bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 flex flex-col items-center text-center gap-3">
            <h3 className="text-sm font-bold text-indigo-300">
              {me.role === 'mafia' && '🔪 Choose your target to eliminate:'}
              {me.role === 'doctor' && '💉 Choose one player to protect with medicine:'}
              {me.role === 'detective' && '🔍 Choose a suspect to investigate secretly:'}
              {me.role === 'villager' && '😴 You are sleeping peacefully. Waiting for the morning bell...'}
            </h3>

            {/* Target Select Buttons for Night Active Roles */}
            {me.isAlive && me.role !== 'villager' && (
              <div className="flex flex-wrap justify-center gap-2">
                {livingPlayers.filter(p => p.id !== 'player_1' || me.role === 'doctor').map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleNightAction(p.id)}
                    className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-bold text-white transition-all active:scale-95"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {detectiveResult && (
              <div className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-xl">
                Investigation Result: {detectiveResult}
              </div>
            )}

            <button
              onClick={resolveNightPhase}
              className="mt-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md"
            >
              Sleep & Awaken the Town ▶
            </button>
          </div>
        )}

        {dayNight === 'day' && (
          <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center text-center gap-3">
            <h3 className="text-sm font-bold text-amber-300">
              ⚖️ Town Hall Voting: Who do you suspect is in the Mafia?
            </h3>

            {me.isAlive && !dayVote && (
              <div className="flex flex-wrap justify-center gap-2">
                {livingPlayers.filter(p => p.id !== 'player_1').map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleDayVote(p.id)}
                    className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-xs font-bold text-white transition-all active:scale-95"
                  >
                    Vote {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Town Hall Announcer Chronicle */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Town Chronicler Log:
          </div>
          <div className="flex flex-col gap-1 text-xs font-mono text-slate-300">
            {narratorLogs.slice(0, 3).map((log, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">▶</span>
                <span className={index === 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border-2 border-indigo-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white">
              {winningTeam === 'town' ? 'Town Citizens Win!' : 'Underworld Mafia Wins!'}
            </h2>
            <RematchActions
              gameOver={gameOver}
              mode={mode}
              multiplayerData={multiplayerData}
              onReset={handleRematch}
              onExit={onExit}
              themeColor="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
};
