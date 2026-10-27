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
      className="promo"
      aria-labelledby="promo-title"
      style={{
        margin: '28px auto 83px',
        padding: '47px 56px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '32px',
        borderRadius: '24px',
        border: '1px solid rgba(167, 122, 255, 0.45)',
        background: 'radial-gradient(circle at 75% 60%, rgba(118, 69, 170, 0.47), transparent 42%), linear-gradient(120deg, rgb(35, 32, 74), rgb(18, 27, 56))',
        boxShadow: '0 18px 60px rgba(5, 6, 24, 0.47)'
      }}
    >
      <div>
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
          BETTER TOGETHER
        </p>
        <h2
          id="promo-title"
          style={{
            color: '#f7f7ff',
            fontWeight: 800,
            fontSize: 'clamp(26px, 3.2vw, 38px)',
            letterSpacing: '-0.06em',
            margin: '7px 0 0'
          }}
        >
          Good games. Great company.
        </h2>
        <p
          style={{
            maxWidth: '530px',
            color: '#c7c5dd',
            lineHeight: 1.65,
            margin: '12px 0 0',
            fontSize: '15px'
          }}
        >
          The best moments are the ones you share. Generate 1-click private party room codes and battle your friends in real-time under strict 30-second move clocks!
        </p>
      </div>

      <button
        type="button"
        onClick={() => { onPlayWithFriends(); sound.play('match'); }}
        className="primary-cta"
        style={{
          whiteSpace: 'nowrap',
          background: '#b394ff',
          borderColor: '#b394ff',
          color: '#100f28',
          fontWeight: 800,
          fontSize: '15px'
        }}
      >
        <span>Play With Friends</span>
        <span aria-hidden="true">↗</span>
      </button>
    </section>
  );
};
