// client/src/components/home/CategoryChips.tsx
import React from 'react';
import { sound } from '../../services/sound';
import { GENRE_METAS, GameGenre } from '../../utils/gameCategories';

interface CategoryChipsProps {
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

const CATEGORIES: GameGenre[] = [
  'Brain',
  'Puzzle',
  'Action',
  'Sports',
  'Strategy',
  'Board',
  'Party',
  'Word',
  'Trivia'
];

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div
      className="category-chips-container w-full"
      role="group"
      aria-label="Filter games by category"
    >
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto sm:flex-wrap pb-2 pt-1 no-scrollbar select-none">
        {/* 'All Games' Default Pill */}
        <button
          type="button"
          onClick={() => { onSelectCategory(null); sound.play('click'); }}
          className={`chip-btn ${activeCategory === null ? 'chip-btn-active' : 'chip-btn-inactive'}`}
          aria-pressed={activeCategory === null}
        >
          All Games
        </button>

        {/* Category Pills with Icons */}
        {CATEGORIES.map((cat) => {
          const meta = GENRE_METAS[cat];
          const Icon = meta.icon;
          const isActive = activeCategory?.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(isActive ? null : cat);
                sound.play('click');
              }}
              className={`chip-btn flex items-center gap-1.5 ${isActive ? 'chip-btn-active' : 'chip-btn-inactive'}`}
              aria-pressed={isActive}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#080b1c' : meta.color }} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
