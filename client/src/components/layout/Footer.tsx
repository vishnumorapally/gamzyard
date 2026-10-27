// client/src/components/layout/Footer.tsx
import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { sound } from '../../services/sound';

interface FooterProps {
  onOpenProfile: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenProfile }) => {
  return (
    <footer id="footer" style={{ borderTop: '1px solid rgba(167, 173, 209, 0.17)', padding: '34px 0 42px' }}>
      <div className="shell footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <a
            className="brand"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              sound.play('click');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '11px', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.065em' }}
          >
            <span className="brand-mark" aria-hidden="true" style={{ width: '34px', height: '34px' }}>
              <Gamepad2 className="w-4 h-4 text-[#0c1027]" />
            </span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>
              Gamzyard
            </span>
          </a>
          <p className="footer-caption" style={{ color: '#8992af', fontSize: '13px', margin: '8px 0 0' }}>
            Multiplayer & Smart AI Gaming Hub • 30s Blitz Turns
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: '22px', fontSize: '13px' }}>
          <a
            href="#games"
            onClick={(e) => {
              e.preventDefault();
              sound.play('click');
              document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: '#b8bfd6', textDecoration: 'none' }}
          >
            Games
          </a>

          <a
            href="#categories"
            onClick={(e) => {
              e.preventDefault();
              sound.play('click');
              document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: '#b8bfd6', textDecoration: 'none' }}
          >
            Categories
          </a>

          <a
            href="#multiplayer"
            onClick={(e) => {
              e.preventDefault();
              sound.play('click');
              document.getElementById('multiplayer')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ color: '#b8bfd6', textDecoration: 'none' }}
          >
            Multiplayer
          </a>

          <button
            type="button"
            onClick={() => { onOpenProfile(); sound.play('click'); }}
            style={{ border: 0, background: 'none', color: '#b8bfd6', padding: 0, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Gamer Passport
          </button>
        </nav>
      </div>
    </footer>
  );
};
