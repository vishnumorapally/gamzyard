// client/src/components/layout/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Gamepad2, Menu, X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sound } from '../../services/sound';
import { UserProfile } from '../../types';
import { DEFAULT_AVATARS } from '../../services/storage';
import { getSocket } from '../../services/socket';

interface NavbarProps {
  profile: UserProfile;
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onOpenProfile: () => void;
  onOpenComingSoon: (feature: 'multiplayer' | 'leaderboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeNav,
  onSelectNav,
  onOpenProfile,
  onOpenComingSoon
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);

  useEffect(() => {
    const socket = getSocket();
    const handleCount = (data: { count: number }) => {
      if (typeof data?.count === 'number') {
        setOnlineCount(Math.max(1, data.count));
      }
    };

    socket.on('online_count', handleCount);

    const requestCount = () => {
      if (socket.connected) {
        socket.emit('get_online_count');
      } else {
        fetch('/api/health')
          .then(res => res.json())
          .then(data => {
            if (data?.activeUsers) setOnlineCount(Math.max(1, data.activeUsers));
          })
          .catch(() => {});
      }
    };

    socket.on('connect', requestCount);
    requestCount();

    // Heartbeat sync every 3 seconds
    const interval = setInterval(requestCount, 3000);

    return () => {
      socket.off('online_count', handleCount);
      socket.off('connect', requestCount);
      clearInterval(interval);
    };
  }, []);

  const handleToggleSound = () => {
    const newMuted = sound.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) sound.play('click');
  };

  const avatarObj = DEFAULT_AVATARS.find(a => a.id === profile.avatar) || DEFAULT_AVATARS[0];

  return (
    <header className="sticky top-0 z-40 pt-4 px-2 sm:px-0">
      <div className="glass shell flex items-center justify-between min-h-[72px] rounded-[19px] px-4 sm:px-6 py-2.5 relative">
        {/* Brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onSelectNav('home');
            sound.play('click');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2.5 text-white no-underline font-extrabold text-[22px] tracking-[-0.065em] whitespace-nowrap cursor-pointer select-none"
        >
          <span className="brand-mark">
            <Gamepad2 className="w-5 h-5 text-[#0c1027]" />
          </span>
          <span className="text-white font-extrabold text-xl tracking-tight">Gamzyard</span>
        </a>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => { setIsMenuOpen(!isMenuOpen); sound.play('click'); }}
          className="block md:hidden border-0 text-white bg-transparent p-2 cursor-pointer ml-auto"
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop & Mobile Navigation Links */}
        <nav
          className={`${
            isMenuOpen
              ? 'flex absolute left-4 right-4 top-[80px] flex-col items-stretch p-4 border border-[#aaa3d448] rounded-2xl bg-[#171c36] shadow-[0_20px_45px_#0009] z-50'
              : 'hidden'
          } md:flex md:static md:flex-row md:items-center md:p-0 md:bg-transparent md:border-0 md:shadow-none gap-4 lg:gap-7`}
        >
          {/* Home Link */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onSelectNav('home');
              setIsMenuOpen(false);
              sound.play('click');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`text-sm font-bold no-underline transition-colors flex items-center gap-1.5 ${
              activeNav === 'home' ? 'text-[#75eeee]' : 'text-[#b8bfd6] hover:text-[#65edf1]'
            }`}
          >
            <span>Home</span>
            {activeNav === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-[#75eeee] animate-pulse" />}
          </a>

          {/* All Games Link */}
          <a
            href="#games"
            onClick={(e) => {
              e.preventDefault();
              onSelectNav('games');
              setIsMenuOpen(false);
              sound.play('click');
              document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`text-sm font-bold no-underline transition-colors flex items-center gap-1.5 ${
              activeNav === 'games' ? 'text-[#75eeee]' : 'text-[#b8bfd6] hover:text-[#65edf1]'
            }`}
          >
            <span>All Games</span>
            {activeNav === 'games' && <span className="w-1.5 h-1.5 rounded-full bg-[#75eeee] animate-pulse" />}
          </a>

          {/* Multiplayer Link (Coming Soon) */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              sound.play('match');
              onOpenComingSoon('multiplayer');
            }}
            className="text-sm font-bold no-underline transition-colors flex items-center gap-1.5 text-[#b8bfd6] hover:text-[#75eeee] bg-transparent border-0 p-0 cursor-pointer"
          >
            <span>Multiplayer</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Soon
            </span>
          </button>

          {/* Leaderboard Link (Coming Soon) */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              sound.play('match');
              onOpenComingSoon('leaderboard');
            }}
            className="text-sm font-bold no-underline transition-colors flex items-center gap-1.5 text-[#b8bfd6] hover:text-[#75eeee] bg-transparent border-0 p-0 cursor-pointer"
          >
            <span>Leaderboard</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Soon
            </span>
          </button>

          {/* Sound FX Button in Mobile menu */}
          <button
            onClick={handleToggleSound}
            className="md:hidden flex items-center justify-between py-2 text-xs font-bold text-[#b8bfd6] border-t border-gray-700/60 mt-2 pt-2"
          >
            <span>Sound FX</span>
            <span className="text-cyan-400">{isMuted ? 'Muted' : 'Active'}</span>
          </button>
        </nav>

        {/* Right side utilities: Sound + Online counter + Sign In / Profile button */}
        <div className="hidden md:flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#5be9ed]" />
            )}
            <span className="text-[11px] font-bold text-[#a8b0cd]">
              {isMuted ? 'Muted' : 'Sound ON'}
            </span>
          </button>

          {/* Canva Sign In Button */}
          <button
            onClick={() => { onOpenProfile(); sound.play('click'); }}
            className="sign-btn flex items-center gap-2 cursor-pointer"
            style={{
              border: profile.provider === 'google' ? '1px solid rgba(52, 168, 83, 0.6)' : '1px solid #9d81ef88',
              background: profile.provider === 'google' ? 'rgba(52, 168, 83, 0.15)' : '#a77bff1f',
              color: '#f3edff',
              borderRadius: '11px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800
            }}
          >
            <span>{avatarObj.emoji}</span>
            <span className="max-w-[110px] truncate">{profile.name}</span>
            {profile.provider === 'google' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Google Connected" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
