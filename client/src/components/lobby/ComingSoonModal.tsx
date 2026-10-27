// client/src/components/lobby/ComingSoonModal.tsx
import React from 'react';
import { X, Globe, Trophy, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { sound } from '../../services/sound';

interface ComingSoonModalProps {
  feature: 'multiplayer' | 'leaderboard' | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPlayWithFriends: () => void;
  onOpenProfile: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  feature,
  isOpen,
  onClose,
  onOpenPlayWithFriends,
  onOpenProfile
}) => {
  if (!isOpen || !feature) return null;

  const isMultiplayer = feature === 'multiplayer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-center">
        {/* Glow Ambient */}
        <div
          className={`absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-30 ${
            isMultiplayer ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={() => { onClose(); sound.play('click'); }}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Feature Icon Header */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mt-2">
          <div
            className={`absolute inset-0 rounded-2xl blur-md opacity-50 ${
              isMultiplayer ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <div
            className={`relative w-full h-full rounded-2xl border flex items-center justify-center ${
              isMultiplayer
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-400'
            }`}
          >
            {isMultiplayer ? <Globe className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 border ${
            isMultiplayer
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Coming Soon in Version 2</span>
        </span>

        {/* Feature Title & Copy */}
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
          {isMultiplayer ? 'Global Ranked Multiplayer' : 'World Leaderboards & XP'}
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 max-w-sm mx-auto">
          {isMultiplayer
            ? 'Global matchmaking, Elo-based competitive ladder, and cross-country tourneys are launching in Version 2! In the meantime, you can create Private Friend Rooms and challenge players with custom invite codes!'
            : 'Season 1 Global Rankings, Tier Badges, and Regional Hall of Fame are launching in Version 2! All your current match wins and losses are being recorded to seed your rank!'
          }
        </p>

        {/* Features Checklist */}
        <div className="bg-gray-950/70 p-3.5 rounded-2xl border border-gray-800 text-left mb-6 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-300 font-semibold">
            <ShieldCheck className={`w-4 h-4 ${isMultiplayer ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isMultiplayer ? 'Private 1v1 Friend Rooms are 100% LIVE now' : 'Career Wins & Losses actively tracked'}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-300 font-semibold">
            <ShieldCheck className={`w-4 h-4 ${isMultiplayer ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isMultiplayer ? 'Bot battles across 3 difficulty tiers active' : 'Google Account profile syncing enabled'}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2.5">
          {isMultiplayer ? (
            <button
              onClick={() => {
                onClose();
                onOpenPlayWithFriends();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-gray-950 font-black rounded-2xl shadow-neon-emerald transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Create Friend Room Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-gray-950 font-black rounded-2xl shadow-neon-amber transition-all text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              <span>View My Profile Stats</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => { onClose(); sound.play('click'); }}
            className="w-full py-2.5 text-xs text-gray-400 hover:text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
