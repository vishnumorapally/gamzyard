// client/src/components/home/CategoryChips.tsx
import React from 'react';
import { sound } from '../../services/sound';

interface CategoryChipsProps {
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

const CATEGORIES = ['Puzzle', 'Arcade', 'Strategy', 'Trivia', 'Party', 'Multiplayer'];

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

        {/* Category Pills */}
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory?.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(isActive ? null : cat);
                sound.play('click');
              }}
              className={`chip-btn ${isActive ? 'chip-btn-active' : 'chip-btn-inactive'}`}
              aria-pressed={isActive}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
