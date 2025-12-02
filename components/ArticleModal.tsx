import React, { useEffect, useState, useRef } from 'react';
import { NewsArticle } from '../types';
import { fetchArticleDetails } from '../services/geminiService';
import { CloseIcon, ExternalLinkIcon, ShareIcon } from './Icons';

interface ArticleModalProps {
  article: NewsArticle;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    const loadDetails = async () => {
      setLoading(true);
      const text = await fetchArticleDetails(article.title, article.source);
      setContent(text);
      setLoading(false);
    };

    loadDetails();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [article.title, article.source]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const mainLink = article.groundingUrls.length > 0 ? article.groundingUrls[0].uri : null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white w-full max-w-3xl h-[90vh] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
      >
        {/* Header Actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
                onClick={onClose} 
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
            >
                <CloseIcon className="h-5 w-5" />
            </button>
        </div>

        {/* Hero Image */}
        <div className={`relative h-56 sm:h-72 flex-shrink-0 ${imageError ? 'bg-gray-900' : 'bg-gray-200'}`}>
             {!imageError ? (
                 <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                    <span className="text-white font-serif text-4xl italic">Pulse.</span>
                </div>
             )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-24">
                 <div className="flex items-center gap-3 text-white/90 text-sm mb-3">
                    <span className="bg-accent-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                        {article.category}
                    </span>
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span>{article.publishedTime}</span>
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight drop-shadow-sm">
                    {article.title}
                 </h2>
            </div>
        </div>

        {/* Scrollable Content */}
        <div ref={modalContentRef} className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white">
            {loading ? (
                <div className="space-y-6 animate-pulse max-w-2xl mx-auto">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    </div>
                    <div className="h-32 bg-gray-50 rounded-lg"></div>
                    <div className="space-y-2">
                         <div className="h-4 bg-gray-100 rounded w-full"></div>
                         <div className="h-4 bg-gray-100 rounded w-full"></div>
                         <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                    </div>
                </div>
            ) : (
                <article className="prose prose-lg prose-gray max-w-2xl mx-auto">
                    {content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-6 text-gray-800 leading-relaxed text-lg font-serif">
                            {paragraph.trim()}
                        </p>
                    ))}
                    <div className="flex items-center gap-2 mt-8 py-6 border-t border-gray-100">
                        <span className="text-sm text-gray-500 italic">
                            Generated by AI based on real-time search results.
                        </span>
                    </div>
                </article>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                <ShareIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Share Article</span>
            </button>
            
            {mainLink && (
                <a 
                    href={mainLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors shadow-sm"
                >
                    Read on {article.source} <ExternalLinkIcon className="h-4 w-4" />
                </a>
            )}
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;