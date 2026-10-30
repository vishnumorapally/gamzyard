// client/src/components/home/PromoBanner.tsx
import React from 'react';
import { sound } from '../../services/sound';

interface PromoBannerProps {
  onPlayWithFriends: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onPlayWithFriends }) => {
  return (
    <section
      id="multiplayer"
      className="promo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      aria-labelledby="promo-title"
      style={{
        margin: '28px auto 70px',
        padding: '36px 44px',
        borderRadius: '22px',
        border: '1px solid rgba(167, 122, 255, 0.45)',
        background: 'radial-gradient(circle at 75% 60%, rgba(118, 69, 170, 0.47), transparent 42%), linear-gradient(120deg, rgb(35, 32, 74), rgb(18, 27, 56))',
        boxShadow: '0 18px 60px rgba(5, 6, 24, 0.47)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="eyebrow"
          style={{
            color: '#75e9ed',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            margin: '0 0 6px'
          }}
        >
          SQUAD CLASH · BETTER TOGETHER
        </p>
        <h2
          id="promo-title"
          style={{
            color: '#f7f7ff',
            fontWeight: 800,
            fontSize: 'clamp(22px, 2.6vw, 32px)',
            letterSpacing: '-0.05em',
            margin: '4px 0 0'
          }}
        >
          Assemble The Squad. Settle The Beef.
        </h2>
        <p
          style={{
            color: '#c7c5dd',
            lineHeight: 1.6,
            margin: '8px 0 0',
            fontSize: '14.5px',
            maxWidth: '720px'
          }}
        >
          Drop an instant 1-click room code in your squad chat and find out who's actually cracked and who was getting carried. Strict 30-second blitz turn clocks—zero stalling, zero excuses, pure chaotic fun!
        </p>
      </div>

      <button
        type="button"
        onClick={() => { onPlayWithFriends(); sound.play('match'); }}
        className="primary-cta flex-shrink-0"
        style={{
          whiteSpace: 'nowrap',
          background: '#b394ff',
          borderColor: '#b394ff',
          color: '#100f28',
          fontWeight: 800,
          fontSize: '15px',
          padding: '13px 26px',
          borderRadius: '13px',
          cursor: 'pointer'
        }}
      >
        <span>Play With Friends</span>
        <span aria-hidden="true">↗</span>
      </button>
    </section>
  );
};
