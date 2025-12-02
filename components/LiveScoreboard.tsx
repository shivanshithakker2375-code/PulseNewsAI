import React from 'react';
import { LiveMatch } from '../types';

interface LiveScoreboardProps {
  matches: LiveMatch[];
  loading: boolean;
  onRefresh: () => void;
  onMatchClick: (match: LiveMatch) => void;
}

const LiveScoreboard: React.FC<LiveScoreboardProps> = ({ matches, loading, onRefresh, onMatchClick }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight uppercase">Live Scores</h2>
        </div>
        <button 
          onClick={onRefresh}
          className="text-xs font-medium text-gray-500 hover:text-accent-600 transition-colors flex items-center gap-1"
          disabled={loading}
        >
           {loading ? 'Updating...' : 'Auto-updating'}
        </button>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4 min-w-max">
          {loading && matches.length === 0 ? (
             // Skeleton Loading
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="w-64 h-24 bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-col justify-center animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
               </div>
             ))
          ) : matches.length === 0 ? (
             <div className="w-full text-gray-400 text-sm italic py-4">No live games currently found.</div>
          ) : (
            matches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => onMatchClick(match)}
                className="w-64 bg-white rounded-lg border border-gray-200 shadow-sm p-3 hover:shadow-md transition-all hover:scale-[1.02] hover:border-accent-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[120px]">{match.league}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${match.isLive ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {match.status}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-sm truncate w-40">{match.homeTeam}</span>
                    <span className={`font-bold text-sm ${match.isLive ? 'text-red-600' : 'text-gray-900'}`}>{match.homeScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-sm truncate w-40">{match.awayTeam}</span>
                    <span className={`font-bold text-sm ${match.isLive ? 'text-red-600' : 'text-gray-900'}`}>{match.awayScore}</span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-50 text-[10px] text-center text-accent-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Match Center
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveScoreboard;