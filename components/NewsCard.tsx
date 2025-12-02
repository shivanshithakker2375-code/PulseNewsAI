import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { BookmarkIcon, ShareIcon } from './Icons';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
        className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 cursor-pointer"
        onClick={() => onClick(article)}
    >
      {/* Image Container */}
      <div className={`relative h-48 overflow-hidden ${imageError ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gray-200'}`}>
        {!imageError ? (
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
              onError={() => setImageError(true)}
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center p-6 text-center">
                <span className="text-gray-400 font-serif text-2xl italic opacity-20">Pulse.</span>
            </div>
        )}
        
        <div className="absolute top-3 left-3">
           <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-gray-900 shadow-sm uppercase tracking-wide">
             {article.category || "News"}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider">{article.source}</span>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-xs text-gray-500">{article.publishedTime}</span>
        </div>
        
        <div className="block mb-3">
           <h3 className="font-serif font-bold text-lg md:text-xl text-gray-900 leading-tight group-hover:text-accent-600 transition-colors line-clamp-3">
            {article.title}
          </h3>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
          {article.summary}
        </p>

        {/* Footer / Actions */}
        <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-accent-600 group-hover:underline">
                Read Full Story
            </span>
            
            <div className="flex items-center gap-3 text-gray-400">
                <button 
                    className="hover:text-gray-900 transition-colors p-1" 
                    title="Bookmark"
                    onClick={(e) => { e.stopPropagation(); /* Logic for bookmark */ }}
                >
                    <BookmarkIcon className="h-4 w-4" />
                </button>
                <button 
                    className="hover:text-gray-900 transition-colors p-1" 
                    title="Share"
                    onClick={(e) => { e.stopPropagation(); /* Logic for share */ }}
                >
                    <ShareIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;