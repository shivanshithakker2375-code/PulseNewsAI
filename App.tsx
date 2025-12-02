import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import NewsCard from './components/NewsCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import ArticleModal from './components/ArticleModal';
import LiveScoreboard from './components/LiveScoreboard';
import ScoreboardModal from './components/ScoreboardModal';
import Footer from './components/Footer';
import { fetchNewsArticles, fetchLiveScores } from './services/geminiService';
import { NewsArticle, Category, FetchStatus, LiveMatch } from './types';
import { RefreshIcon, TrendingIcon } from './components/Icons';

const App: React.FC = () => {
  const [category, setCategory] = useState<string>(Category.TOP_STORIES);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [scoreStatus, setScoreStatus] = useState<FetchStatus>('idle');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  
  // Ref for interval to clear it properly
  const scoreIntervalRef = useRef<number | null>(null);
  
  // State for the modal
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);

  // Handle Scroll for Header Styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Logic
  const loadNews = useCallback(async (cat: string, query?: string) => {
    setStatus('loading');
    setArticles([]);
    try {
      const news = await fetchNewsArticles(cat, query);
      setArticles(news);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }, []);

  // Fetch Live Scores
  const loadScores = useCallback(async () => {
    setScoreStatus('loading');
    try {
      const scores = await fetchLiveScores();
      setLiveMatches(scores);
      setScoreStatus('success');
    } catch (error) {
      console.error(error);
      setScoreStatus('error');
    }
  }, []);

  // Initial Load & Category Change
  useEffect(() => {
    // Clear existing score interval
    if (scoreIntervalRef.current) {
        window.clearInterval(scoreIntervalRef.current);
        scoreIntervalRef.current = null;
    }

    // If search query is active, ignore category change effect unless we explicitly want to clear search
    if (!searchQuery) {
        loadNews(category);
    }
    
    // Special handling for Sports category
    if (category === Category.SPORTS) {
        loadScores(); // Initial load
        // Set up auto-refresh every 60 seconds
        scoreIntervalRef.current = window.setInterval(() => {
            loadScores(); // Silent update, maybe don't set loading state to avoid UI flicker? 
            // For now, we reuse the function which sets loading state. 
            // Ideally, we'd have a silent refresh mode.
        }, 60000);
    } else {
        setLiveMatches([]);
    }

    return () => {
        if (scoreIntervalRef.current) {
            window.clearInterval(scoreIntervalRef.current);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCategory("Search Results"); // Visual feedback
    loadNews("General", query);
    setLiveMatches([]); // Clear scores on search
  };

  const handleCategorySelect = (cat: string) => {
      setSearchQuery(undefined);
      setCategory(cat);
      // loadNews triggered by effect
  };

  const handleRefresh = () => {
      loadNews(category, searchQuery);
      if (category === Category.SPORTS) {
          loadScores();
      }
  };

  const handleArticleClick = (article: NewsArticle) => {
      setSelectedArticle(article);
  };

  const handleMatchClick = (match: LiveMatch) => {
      setSelectedMatch(match);
  };

  const handleCloseArticleModal = () => {
      setSelectedArticle(null);
  };

  const handleCloseMatchModal = () => {
      setSelectedMatch(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fafafa]">
      
      <Header onSearch={handleSearch} isScrolled={isScrolled} />
      
      <CategoryBar 
        selectedCategory={category} 
        onSelectCategory={handleCategorySelect} 
      />

      <main className="flex-grow pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Live Scoreboard (Only for Sports) */}
          {category === Category.SPORTS && (
              <LiveScoreboard 
                matches={liveMatches} 
                loading={scoreStatus === 'loading' && liveMatches.length === 0} 
                onRefresh={loadScores}
                onMatchClick={handleMatchClick}
              />
          )}

          {/* Section Header */}
          <div className="flex items-end justify-between mb-8 pb-2 border-b border-gray-200">
             <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    {category === Category.TOP_STORIES && <TrendingIcon className="h-6 w-6 text-accent-600" />}
                    {category}
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                    {status === 'success' 
                        ? `Latest updates ${searchQuery ? `for "${searchQuery}"` : 'curated for you'}.` 
                        : 'Fetching the latest headlines...'}
                </p>
             </div>
             <button 
                onClick={handleRefresh}
                className="text-gray-400 hover:text-accent-600 transition-colors p-2"
                title="Refresh News"
             >
                <RefreshIcon className={`h-5 w-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
             </button>
          </div>

          {/* Content Grid */}
          {status === 'loading' ? (
            <LoadingSkeleton />
          ) : status === 'error' ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Something went wrong while fetching the news.</p>
              <button 
                onClick={handleRefresh}
                className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-black transition-all"
              >
                Try Again
              </button>
            </div>
          ) : articles.length === 0 ? (
             <div className="text-center py-20">
              <p className="text-gray-500">No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {articles.map((article, idx) => (
                <div key={article.id} className={idx === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                    {/* Featured Article Logic: First item is bigger on desktop */}
                    <div className="h-full">
                        <NewsCard article={article} onClick={handleArticleClick} />
                    </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModal 
            article={selectedArticle} 
            onClose={handleCloseArticleModal} 
        />
      )}

      {/* Scoreboard Modal */}
      {selectedMatch && (
        <ScoreboardModal 
            match={selectedMatch} 
            onClose={handleCloseMatchModal} 
        />
      )}

      <Footer />
    </div>
  );
};

export default App;