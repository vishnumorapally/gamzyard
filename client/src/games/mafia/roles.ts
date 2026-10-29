// client/src/games/mafia/roles.ts

export type MafiaRole = 'mafia' | 'detective' | 'doctor' | 'villager';

export interface RoleInfo {
  role: MafiaRole;
  name: string;
  team: 'mafia' | 'town';
  icon: string;
  description: string;
}

export const ROLE_INFOS: Record<MafiaRole, RoleInfo> = {
  mafia: {
    role: 'mafia',
    name: 'Underworld Don (Mafia)',
    team: 'mafia',
    icon: '🔪',
    description: 'You strike in the shadows. Each night, choose a citizen to eliminate.'
  },
  detective: {
    role: 'detective',
    name: 'Police Inspector (Detective)',
    team: 'town',
    icon: '🔍',
    description: 'Each night, investigate one suspect to find out if they are Mafia.'
  },
  doctor: {
    role: 'doctor',
    name: 'Doctor (Medic)',
    team: 'town',
    icon: '💉',
    description: 'Each night, choose one player to protect from the Mafia strike.'
  },
  villager: {
    role: 'villager',
    name: 'Innocent Citizen',
    team: 'town',
    icon: '👥',
    description: 'Survive the night. During the day, debate and vote to lynch suspected Mafia.'
  }
};
