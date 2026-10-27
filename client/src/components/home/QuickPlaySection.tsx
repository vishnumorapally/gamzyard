// client/src/components/home/QuickPlaySection.tsx
import React from 'react';
import { CanvaGameItem } from '../../data/games';
import { sound } from '../../services/sound';

interface QuickPlaySectionProps {
  items: CanvaGameItem[];
  onSelect: (item: CanvaGameItem) => void;
}

export const QuickPlaySection: React.FC<QuickPlaySectionProps> = ({ items, onSelect }) => {
  const quickItems = items.slice(0, 3);

  return (
    <section className="section" aria-labelledby="quick-title" style={{ padding: '34px 0 50px' }}>
      <div className="section-heading" style={{ marginBottom: '24px' }}>
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
            GOT A MINUTE?
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
