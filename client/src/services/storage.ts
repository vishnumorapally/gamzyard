// client/src/services/storage.ts
import { UserProfile } from '../types';

const PROFILE_KEY = 'gamzyard_user_profile';

const DEFAULT_AVATARS = [
  { id: 'fox', name: 'Cyber Fox', emoji: '🦊', color: 'from-orange-500 to-amber-500' },
  { id: 'dragon', name: 'Neon Dragon', emoji: '🐲', color: 'from-emerald-500 to-cyan-500' },
  { id: 'robot', name: 'Mecha Bot', emoji: '🤖', color: 'from-blue-500 to-indigo-500' },
  { id: 'cat', name: 'Cosmic Cat', emoji: '🐱', color: 'from-pink-500 to-purple-500' },
  { id: 'panda', name: 'Zen Panda', emoji: '🐼', color: 'from-teal-400 to-emerald-600' },
  { id: 'ninja', name: 'Shadow Ninja', emoji: '🥷', color: 'from-purple-600 to-indigo-900' },
  { id: 'wizard', name: 'Arcane Mage', emoji: '🧙', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'skull', name: 'Phantom Ghost', emoji: '💀', color: 'from-rose-500 to-red-700' },
  { id: 'alien', name: 'Vortex Alien', emoji: '👾', color: 'from-cyan-400 to-blue-600' },
  { id: 'tiger', name: 'Saber Tiger', emoji: '🐯', color: 'from-amber-500 to-red-500' },
  { id: 'falcon', name: 'Thunder Falcon', emoji: '🦅', color: 'from-sky-400 to-indigo-600' },
  { id: 'bear', name: 'Grizzly Bear', emoji: '🐻', color: 'from-yellow-600 to-amber-800' },
];

export { DEFAULT_AVATARS };

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'guest_1001',
      name: 'Guest Player',
      avatar: 'fox',
      isGuest: true,
      stats: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 }
    };
  }

  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  // Create initial guest
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const initial: UserProfile = {
    id: `guest_${randNum}`,
    name: `Player_${randNum}`,
    avatar: 'fox',
    isGuest: true,
    stats: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 }
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loginWithGoogle(email?: string, name?: string): UserProfile {
  const current = getStoredProfile();
  const googleName = name || (current.isGuest ? 'Gamer Pro' : current.name);
  const googleEmail = email || `${googleName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
  
  const updated: UserProfile = {
    ...current,
    id: `goog_${Date.now().toString(36)}`,
    name: googleName,
    email: googleEmail,
    isGuest: false,
    provider: 'google'
  };
  saveProfile(updated);
  return updated;
}

export function logoutToGuest(): UserProfile {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const guest: UserProfile = {
    id: `guest_${randNum}`,
    name: `Player_${randNum}`,
    avatar: 'fox',
    isGuest: true,
    provider: 'guest',
    stats: { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 }
  };
  saveProfile(guest);
  return guest;
}

export function recordGameResult(result: 'win' | 'loss' | 'draw'): UserProfile {
  const profile = getStoredProfile();
  profile.stats.gamesPlayed += 1;
  if (result === 'win') profile.stats.wins += 1;
  else if (result === 'loss') profile.stats.losses += 1;
  else if (result === 'draw') profile.stats.draws += 1;
  saveProfile(profile);
  return profile;
}
