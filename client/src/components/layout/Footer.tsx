// client/src/components/layout/Footer.tsx
import React from 'react';
import { Gamepad2, ArrowUp, Heart, Sparkles, ShieldCheck, Zap, Trophy } from 'lucide-react';
import { sound } from '../../services/sound';

interface FooterProps {
  onOpenProfile: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenProfile }) => {
  const scrollToTop = () => {
    sound.play('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="footer"
      className="relative overflow-hidden mt-12"
      style={{
        borderTop: '1px solid rgba(167, 173, 209, 0.15)',
        background: 'linear-gradient(180deg, rgba(13, 16, 38, 0.6) 0%, rgba(8, 11, 28, 0.95) 100%)',
        padding: '52px 0 36px'
      }}
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="shell relative z-10">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="lg:col-span-1">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="inline-flex items-center gap-2.5 text-white no-underline font-extrabold text-[22px] tracking-[-0.065em] cursor-pointer select-none mb-3"
            >
              <span className="brand-mark w-9 h-9 rounded-xl flex items-center justify-center bg-[#72ecee]">
                <Gamepad2 className="w-5 h-5 text-[#0c1027]" />
              </span>
              <span className="text-white font-extrabold text-xl tracking-tight">Gamzyard</span>
            </a>
            <p className="text-[#8e98b7] text-[13px] leading-relaxed mb-4">
              The zero-download browser arena. 68+ classic board games, brain teasers, and party showdowns with 30s blitz timers.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Servers 100% Operational</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#72ecee] mb-4">
              Arena Hub
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-[#aeb6d1] list-none p-0 m-0">
              <li>
                <a
                  href="#games"
                  onClick={(e) => {
                    e.preventDefault();
                    sound.play('click');
                    document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#72ecee] transition-colors flex items-center gap-1.5"
                >
                  <span>All 68 Games</span>
                </a>
              </li>
              <li>
                <a
                  href="#multiplayer"
                  onClick={(e) => {
                    e.preventDefault();
                    sound.play('click');
                    document.getElementById('multiplayer')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#72ecee] transition-colors flex items-center gap-1.5"
                >
                  <span>Party Room Codes</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { onOpenProfile(); sound.play('click'); }}
                  className="hover:text-[#72ecee] transition-colors bg-transparent border-0 p-0 text-left cursor-pointer font-semibold text-[#aeb6d1]"
                >
                  <span>Gamer Passport & Stats</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Featured Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#c084fc] mb-4">
              Game Genres
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-[#aeb6d1] list-none p-0 m-0">
              <li>
                <span className="text-white/80">🧠 Brain & Puzzles</span>
                <span className="block text-[11px] text-[#717b9c]">Sudoku, Mastermind, Picross</span>
              </li>
              <li>
                <span className="text-white/80">🛡️ Strategy & Board</span>
                <span className="block text-[11px] text-[#717b9c]">Chess Master, Ludo, Battleship</span>
              </li>
              <li>
                <span className="text-white/80">✨ Party & Word</span>
                <span className="block text-[11px] text-[#717b9c]">Dumb Charades, Wordle, Imposter</span>
              </li>
            </ul>
          </div>

          {/* Platform Perks */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#f472b6] mb-4">
              Why Gamzyard?
            </h4>
            <div className="space-y-2 text-xs font-semibold text-[#94a0c2]">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Zero installation, instant play</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Strict 30s turn clocks (no stalls)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>100% Free, no paywalls or ads</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Smart AI bots for solo practice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs font-medium text-[#7d87a8]">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© 2026 Gamzyard. Built for gamers who hate waiting in queues. Cook your friends, touch grass occasionally.</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#72ecee] font-bold transition-all cursor-pointer active:scale-95 flex-shrink-0"
            title="Back to Top"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
