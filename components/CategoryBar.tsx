import React from 'react';
import { Category } from '../types';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full border-b border-gray-200 bg-white sticky top-[60px] sm:top-[72px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-3">
          {Object.values(Category).map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`
                  whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gray-900 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;