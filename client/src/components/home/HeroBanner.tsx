// client/src/components/home/HeroBanner.tsx
import React from 'react';
import { sound } from '../../services/sound';

interface HeroBannerProps {
  onExploreGames: () => void;
  onPlayWithFriends: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreGames,
  onPlayWithFriends
}) => {
  return (
    <section className="hero" aria-labelledby="hero-title" style={{
      minHeight: '600px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      alignItems: 'center',
      gap: '48px',
      padding: '70px 0 60px'
    }}>
      {/* Left Column: Heading and CTAs */}
      <div>
        <p className="eyebrow" style={{
          color: '#75e9ed',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          WELCOME TO YOUR PLAYGROUND
        </p>

        <h1
          id="hero-title"
          style={{
            color: '#f7f7ff',
            fontSize: 'clamp(44px, 5.5vw, 76px)',
            lineHeight: 1.06,
            fontWeight: 800,
            letterSpacing: '-0.075em',
            maxWidth: '670px',
            margin: '20px 0'
          }}
        >
          Your Next Favorite Game Is Here
        </h1>

        <p
          className="hero-copy"
          style={{
            color: '#b8c0d8',
            fontSize: 'clamp(16px, 1.5vw, 19px)',
            lineHeight: 1.7,
            maxWidth: '540px',
            marginBottom: '32px'
          }}
        >
          Discover quick challenges, brain teasers, arcade classics, and multiplayer fun—all in one place with 30-second blitz turn timers.
        </p>

        <div className="cta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '13px' }}>
          <button
            onClick={() => { onExploreGames(); sound.play('click'); }}
            className="primary-cta"
            style={{
              background: '#72ecee',
              color: '#10142b',
              fontWeight: 800,
              fontSize: '15px'
            }}
          >
            <span>Explore Games</span>
            <span aria-hidden="true">↗</span>
          </button>

          <button
            onClick={() => { onPlayWithFriends(); sound.play('match'); }}
            className="secondary-cta"
            style={{
              color: '#f5f3ff',
              fontWeight: 800,
              fontSize: '15px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(166, 165, 198, 0.28)'
            }}
          >
            <span>Play With Friends</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>

      {/* Right Column: 3 Layered Floating Cards (Interactive 3D Hover Visual - no click trigger) */}
      <div
        className="hero-scene"
        role="img"
        aria-label="Illustrated neon arcade game cards"
        style={{ userSelect: 'none', cursor: 'default' }}
      >
        {/* Main Center Card */}
        <div className="scene-card scene-main">
          <div className="scene-label">
            <small>FEATURED ARENA</small>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>
              Gamzyard Live
            </span>
          </div>
        </div>

        {/* Top-Right Tilted Card */}
        <div className="scene-card scene-top" aria-hidden="true">
          ✷
        </div>

        {/* Bottom-Left Tilted Card */}
        <div className="scene-card scene-bottom" aria-hidden="true">
          ◆
        </div>
      </div>
    </section>
  );
};
