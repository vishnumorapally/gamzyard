// client/src/components/home/GameCard.tsx
import React from 'react';
import { Users, Zap } from 'lucide-react';
import { CanvaGameItem } from '../../data/games';
import { sound } from '../../services/sound';
import { AnimatedGameArtwork } from './AnimatedGameArtwork';
import { getGameGenre, getPlayerCountBadge } from '../../utils/gameCategories';

interface GameCardProps {
  item: CanvaGameItem;
  onSelect: (item: CanvaGameItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ item, onSelect }) => {
  const genre = getGameGenre(item.gameEngineId);
  const playerCount = getPlayerCountBadge(item.meta);
  const GenreIcon = genre.icon;

  return (
    <article
      onClick={() => { onSelect(item); sound.play('click'); }}
      className="game-card group"
      data-category={genre.name}
      data-game={item.title}
      style={{
        background: '#151a32',
        border: '1px solid rgba(169, 183, 239, 0.15)',
        borderRadius: '19px',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* Animated Interactive Game Artwork */}
      <AnimatedGameArtwork
        gameEngineId={item.gameEngineId}
        artClass={item.artClass}
      />

      {/* Card Content */}
      <div style={{ padding: '19px 19px 18px' }}>
        <div className="flex items-center justify-between mb-1">
          <span
            className="category-label"
            style={{
              color: genre.color,
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.11em',
              display: 'inline-block'
            }}
          >
            {genre.name} ▶
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300">
            PvP & Bot
          </span>
        </div>

        <h3
          style={{
            fontSize: '19px',
            letterSpacing: '-0.03em',
            margin: '6px 0 4px',
            color: '#f7f7ff',
            fontWeight: 800
          }}
        >
          {item.title}
        </h3>

        {item.quickSubtitle && (
          <p
            style={{
              color: '#8e97b8',
              fontSize: '12px',
              margin: '0 0 10px',
              fontWeight: 500,
              lineHeight: 1.3
            }}
          >
            {item.quickSubtitle}
          </p>
        )}

        {/* Feature Badges Strip (dynamic Player Count and Category Genre) */}
        <div className="flex items-center flex-wrap gap-1.5 mb-4 text-[11px] font-semibold text-[#8e97b8]">
          <span className="flex items-center gap-1 bg-[#1a213f] px-2 py-0.5 rounded-md text-[#81e7ee] border border-white/5">
            <Users className="w-3 h-3 text-[#81e7ee]" /> {playerCount}
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-md border"
            style={{
              color: genre.color,
              backgroundColor: genre.bgColor,
              borderColor: genre.borderColor
            }}
          >
            <GenreIcon className="w-3 h-3" style={{ color: genre.color }} /> {genre.name}
          </span>
          <span className="flex items-center gap-1 bg-[#1a213f] px-2 py-0.5 rounded-md text-[#f472b6] border border-white/5">
            <Zap className="w-3 h-3 text-[#f472b6]" /> Ranked
          </span>
        </div>

        {/* Canva Play Now Button with purple hover */}
        <button
          className="play-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item);
            sound.play('click');
          }}
          style={{
            color: '#f7f6ff',
            fontWeight: 800
          }}
        >
          <span>Play Now</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
};
