// client/src/components/home/QuickPlaySection.tsx
import React, { useMemo, useState } from 'react';
import { Dices } from 'lucide-react';
import { CanvaGameItem } from '../../data/games';
import { sound } from '../../services/sound';

interface QuickPlaySectionProps {
  items: CanvaGameItem[];
  onSelect: (item: CanvaGameItem) => void;
}

const ONE_PLAYER_ENGINE_IDS = new Set([
  'sudoku',
  'minesweeper',
  'simon-says',
  'mastermind',
  'bulls-and-cows',
  'nonogram',
  'lights-out',
  'logic-grid',
  'pattern-recognition',
  'daily-riddle'
]);

export const QuickPlaySection: React.FC<QuickPlaySectionProps> = ({ items, onSelect }) => {
  const [shuffleKey, setShuffleKey] = useState(0);

  // Filter only 1-player games and pick 3 random ones
  const quickItems = useMemo(() => {
    const onePlayerGames = items.filter((item) => {
      const count = item.meta?.split('·')[0].trim().toLowerCase() || '';
      return count === '1 player' || ONE_PLAYER_ENGINE_IDS.has(item.gameEngineId);
    });

    const pool = onePlayerGames.length >= 3 ? onePlayerGames : items;
    // Random shuffle
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [items, shuffleKey]);

  return (
    <section className="section" aria-labelledby="quick-title" style={{ padding: '34px 0 50px' }}>
      <div className="section-heading flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <p
            className="eyebrow"
            style={{
              color: '#75e9ed',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}
          >
            SOLO BLITZ · 1-PLAYER ARENA
          </p>
          <h2
            id="quick-title"
            style={{
              color: '#f7f7ff',
              fontWeight: 800,
              fontSize: 'clamp(26px, 3vw, 36px)',
              letterSpacing: '-0.06em',
              margin: '6px 0 0'
            }}
          >
            Pick up and play
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            setShuffleKey(k => k + 1);
            sound.play('click');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[#75e9ed] bg-white/5 hover:bg-white/10 border border-[#75e9ed]/30 px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95"
          title="Roll 3 random 1-player games"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Shuffle 🎲</span>
        </button>
      </div>

      <div
        className="quick-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '17px'
        }}
      >
        {quickItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => { onSelect(item); sound.play('click'); }}
            className="quick-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'left',
              width: '100%',
              padding: '17px',
              color: 'white',
              background: '#191e3a',
              border: '1px solid rgba(153, 164, 214, 0.21)',
              borderRadius: '17px',
              transition: '0.2s',
              cursor: 'pointer'
            }}
          >
            <span
              className={`quick-icon ${item.artClass}`}
              aria-hidden="true"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '13px',
                display: 'grid',
                placeItems: 'center',
                fontSize: '26px',
                flex: 'none'
              }}
            >
              {item.artSymbol}
            </span>

            <span>
              <strong style={{ display: 'block', fontSize: '15px', color: '#fff' }}>
                {item.title}
              </strong>
              <small style={{ color: '#aeb6d1', fontSize: '12px' }}>
                {item.quickSubtitle || 'A quick fun round'}
              </small>
            </span>

            <span
              className="quick-arrow"
              aria-hidden="true"
              style={{ marginLeft: 'auto', color: '#76eeee', fontWeight: 800, fontSize: '18px' }}
            >
              ↗
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
