import React, { useState } from 'react';
import { SearchIcon, MenuIcon } from './Icons';

interface HeaderProps {
  onSearch: (query: string) => void;
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, isScrolled }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-200 bg-white/90 backdrop-blur-md ${isScrolled ? 'py-2 shadow-sm' : 'py-4'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-black text-white p-1.5 rounded-md">
              <span className="font-serif font-bold text-xl tracking-tighter">P</span>
            </div>
            <h1 className="font-serif font-bold text-2xl tracking-tight text-gray-900 hidden sm:block">
              Pulse<span className="text-accent-600">.</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="text"
                placeholder="Search topics, places, sources..."
                className="w-full bg-gray-100 text-gray-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:bg-white transition-all border border-transparent focus:border-gray-200"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
            </form>
          </div>

          {/* Actions (simplified for demo) */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Subscribe
            </button>
            <button className="hidden md:block bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Sign In
            </button>
            <button className="md:hidden p-2 text-gray-600">
               <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;