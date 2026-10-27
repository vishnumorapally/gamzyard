// client/src/components/profile/ProfileModal.tsx
import React, { useState } from 'react';
import { X, Trophy, Swords, ShieldAlert, Award, Check, LogOut, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';
import { DEFAULT_AVATARS, saveProfile, loginWithGoogle, logoutToGuest } from '../../services/storage';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'guest' | 'save'>(profile.isGuest ? 'guest' : 'save');
  const [name, setName] = useState<string>(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile.avatar);
  const [googleEmailInput, setGoogleEmailInput] = useState<string>(profile.email || '');

  if (!isOpen) return null;

  const isGoogleLoggedIn = !profile.isGuest && profile.provider === 'google';

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Guest Player',
      avatar: selectedAvatar,
      isGuest: true,
      provider: 'guest'
    };
    saveProfile(updated);
    onUpdateProfile(updated);

    const socket = getSocket();
    socket.emit('update_profile', updated);

    sound.play('win');
    onClose();
  };

  const handleSaveGoogleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      avatar: selectedAvatar,
      isGuest: false,
      provider: 'google',
      email: googleEmailInput || profile.email || 'player@gmail.com'
    };
    saveProfile(updated);
    onUpdateProfile(updated);

    const socket = getSocket();
    socket.emit('update_profile', updated);

    sound.play('win');
    onClose();
  };

  const handleGoogleLogin = () => {
    sound.play('match');
    const enteredEmail = googleEmailInput.trim() || `${(name || 'player').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`;
    const updated = loginWithGoogle(enteredEmail, name || 'Gamer Pro');
    setName(updated.name);
    setGoogleEmailInput(updated.email || '');
    setActiveTab('save');
    onUpdateProfile(updated);

    const socket = getSocket();
    socket.emit('update_profile', updated);
  };

  const handleLogout = () => {
    sound.play('click');
    const guest = logoutToGuest();
    setName(guest.name);
    setSelectedAvatar(guest.avatar);
    setActiveTab('guest');
    onUpdateProfile(guest);

    const socket = getSocket();
    socket.emit('update_profile', guest);
  };

  const winRate = profile.stats.gamesPlayed > 0
    ? Math.round((profile.stats.wins / profile.stats.gamesPlayed) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow Background Gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>Player Profile</span>
              <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                isGoogleLoggedIn
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}>
                {isGoogleLoggedIn ? 'Google Account' : 'Guest Mode'}
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isGoogleLoggedIn ? `Signed in as ${profile.email}` : 'Track wins, personalize your avatar, and save your account'}
            </p>
          </div>
          <button
            onClick={() => { onClose(); sound.play('click'); }}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Career Stats Dashboard (Wins & Losses) */}
        <div className="grid grid-cols-4 gap-2 my-4">
          <div className="bg-gray-950/70 p-2.5 sm:p-3 rounded-2xl border border-gray-800/80 text-center">
            <Swords className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-base sm:text-lg font-black text-white">{profile.stats.gamesPlayed}</div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Played</div>
          </div>
          <div className="bg-gray-950/70 p-2.5 sm:p-3 rounded-2xl border border-gray-800/80 text-center">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-base sm:text-lg font-black text-amber-400">{profile.stats.wins}</div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Wins</div>
          </div>
          <div className="bg-gray-950/70 p-2.5 sm:p-3 rounded-2xl border border-gray-800/80 text-center">
            <ShieldAlert className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <div className="text-base sm:text-lg font-black text-rose-400">{profile.stats.losses}</div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Losses</div>
          </div>
          <div className="bg-gray-950/70 p-2.5 sm:p-3 rounded-2xl border border-gray-800/80 text-center">
            <Award className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-base sm:text-lg font-black text-cyan-400">{winRate}%</div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Win Rate</div>
          </div>
        </div>

        {/* Profile Mode Tabs: Play as Guest vs Save Profile (Google) */}
        <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-800 mb-4">
          <button
            type="button"
            onClick={() => { setActiveTab('guest'); sound.play('click'); }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'guest'
                ? 'bg-gray-800 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Play as Guest
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('save'); sound.play('click'); }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'save'
                ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white shadow-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Save Profile</span>
            {isGoogleLoggedIn && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        {/* TAB 1: PLAY AS GUEST */}
        {activeTab === 'guest' && (
          <form onSubmit={handleSaveGuest} className="space-y-4 animate-fade-in">
            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Guest Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Enter guest name..."
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white font-semibold focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
              />
            </div>

            {/* Choose Avatar Grid */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Select Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {DEFAULT_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => { setSelectedAvatar(av.id); sound.play('click'); }}
                      className={`relative p-2 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-purple-950/60 border-cyan-400 ring-2 ring-cyan-400/50 shadow-neon-cyan scale-105'
                          : 'bg-gray-950/50 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-2xl mb-1">{av.emoji}</span>
                      <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center">
                        {av.name.split(' ')[0]}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-black font-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prominent Google Link banner */}
            <div className="p-3 bg-gradient-to-r from-blue-950/40 to-purple-950/40 rounded-xl border border-blue-800/40 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-300">
                <strong className="block text-white">Save your wins permanently</strong>
                Sign in with Google to keep records & unlock future levels.
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="py-1.5 px-3 bg-white text-gray-900 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 hover:bg-gray-100 transition-all shadow"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-extrabold rounded-2xl border border-gray-700 transition-all text-xs sm:text-sm uppercase tracking-wider"
            >
              Continue Playing as Guest
            </button>
          </form>
        )}

        {/* TAB 2: SAVE PROFILE (LOGIN WITH GOOGLE) */}
        {activeTab === 'save' && (
          <div className="space-y-4 animate-fade-in">
            {!isGoogleLoggedIn ? (
              /* User not yet logged in with Google: Show Login with Google Option */
              <div className="bg-gray-950/80 p-5 rounded-2xl border border-gray-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto border border-white/20">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white">Save Profile with Google</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Link your account to preserve your wins and losses across all devices and qualify for future player levels and achievements!
                  </p>
                </div>

                {/* Optional Google Email / Name Input for immediate connection */}
                <div className="space-y-2 text-left max-w-sm mx-auto">
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="Enter Google email (e.g. yourname@gmail.com)"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full max-w-sm py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 mx-auto active:scale-95 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </div>
            ) : (
              /* Already Logged In: Show Google Account details, Avatar selector, and customization */
              <form onSubmit={handleSaveGoogleProfile} className="space-y-4">
                {/* Google Account Status Badge */}
                <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-300 flex items-center space-x-1">
                        <span>Connected to Google</span>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-gray-300 truncate max-w-[200px]">
                        {profile.email || 'player@gmail.com'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                    title="Sign Out to Guest"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* In-Game Display Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Gamer Tag / Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={20}
                    placeholder="Enter gamer tag..."
                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white font-semibold focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                {/* Choose Avatar Grid (Available for logged-in users) */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Gamer Avatar Character
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {DEFAULT_AVATARS.map((av) => {
                      const isSelected = selectedAvatar === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => { setSelectedAvatar(av.id); sound.play('click'); }}
                          className={`relative p-2 rounded-2xl flex flex-col items-center justify-center border transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-purple-950/60 border-cyan-400 ring-2 ring-cyan-400/50 shadow-neon-cyan scale-105'
                              : 'bg-gray-950/50 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <span className="text-2xl mb-1">{av.emoji}</span>
                          <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center">
                            {av.name.split(' ')[0]}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-black font-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Future Feature Teaser (Levels & XP) */}
                <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-800/40 flex items-center space-x-2 text-xs text-purple-200">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-none" />
                  <span>
                    <strong>Level Progression & XP</strong> will sync directly to your Google account in Version 2!
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-neon-purple active:scale-95 transition-all text-xs sm:text-sm uppercase tracking-wider"
                >
                  Save Profile Changes
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
