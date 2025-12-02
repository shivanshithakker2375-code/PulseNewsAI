import React, { useEffect, useState } from 'react';
import { LiveMatch, MatchDetails } from '../types';
import { fetchMatchDetails } from '../services/geminiService';
import { CloseIcon, RefreshIcon } from './Icons';

interface ScoreboardModalProps {
  match: LiveMatch;
  onClose: () => void;
}

const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ match, onClose }) => {
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'stats'>('scorecard');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchMatchDetails(match);
      setDetails(data);
      
      // Default to stats if scorecard is empty, otherwise scorecard
      if (data.scorecard.length === 0 && data.stats.length > 0) {
        setActiveTab('stats');
      } else {
        setActiveTab('scorecard');
      }
      setLoading(false);
    };

    loadDetails();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [match]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Match Info */}
        <div className="bg-[#1a202c] text-white p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
             <div>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{match.league}</span>
                 <div className="flex items-center gap-2 mt-1">
                     {match.isLive && (
                         <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                         </span>
                     )}
                     <span className={`text-sm font-semibold ${match.isLive ? 'text-red-400' : 'text-gray-300'}`}>
                        {match.status}
                     </span>
                 </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                 <CloseIcon className="h-5 w-5 text-white" />
             </button>
        </div>

        {/* Scoreboard Area - Visual Summary */}
        <div className="bg-gradient-to-b from-[#1a202c] to-[#2d3748] text-white p-6 sm:p-8 flex-shrink-0">
            <div className="flex justify-between items-center max-w-lg mx-auto">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-3 w-1/3 text-center">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold border-2 border-white/20 shadow-lg">
                        {match.homeTeam.substring(0, 1).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-sm sm:text-lg leading-tight">{match.homeTeam}</h3>
                </div>

                {/* Scores */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="text-3xl sm:text-5xl font-black tracking-tighter tabular-nums whitespace-nowrap">
                        {match.homeScore} <span className="text-gray-500 text-2xl mx-1">-</span> {match.awayScore}
                    </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-3 w-1/3 text-center">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold border-2 border-white/20 shadow-lg">
                        {match.awayTeam.substring(0, 1).toUpperCase()}
                    </div>
                     <h3 className="font-bold text-sm sm:text-lg leading-tight">{match.awayTeam}</h3>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('scorecard')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'scorecard' ? 'text-accent-600 border-b-2 border-accent-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Scorecard
            </button>
            <button 
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'stats' ? 'text-accent-600 border-b-2 border-accent-600 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Statistics
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-0 relative">
             {loading ? (
                <div className="p-6 space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-6"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mt-4"></div>
                </div>
             ) : !details ? (
                <div className="p-8 text-center text-gray-500">
                    Failed to load match details.
                </div>
             ) : (
                <>
                    {/* STATS VIEW */}
                    {activeTab === 'stats' && (
                        <div className="p-6">
                            {details.stats.length > 0 ? (
                                <div className="space-y-6">
                                    {details.stats.map((stat, idx) => (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <div className="flex justify-between text-sm font-semibold text-gray-800 px-1">
                                                <span>{stat.home}</span>
                                                <span className="text-gray-400 uppercase text-xs tracking-wider">{stat.label}</span>
                                                <span>{stat.away}</span>
                                            </div>
                                            <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                                                <div className="bg-accent-600 h-full w-1/2 border-r border-white"></div>
                                                <div className="bg-gray-300 h-full w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400 italic">
                                    No statistical data available for this match yet.
                                </div>
                            )}
                        </div>
                    )}

                    {/* SCORECARD VIEW - Tables */}
                    {activeTab === 'scorecard' && (
                        <div className="pb-8">
                             {details.scorecard.length > 0 ? (
                                <div className="flex flex-col">
                                    {details.scorecard.map((section, sIdx) => (
                                        <div key={sIdx} className="border-b border-gray-100 last:border-0 mb-4">
                                            <h4 className="px-6 py-3 bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider border-y border-gray-100">
                                                {section.title}
                                            </h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left whitespace-nowrap">
                                                    <thead>
                                                        <tr className="bg-white text-gray-500 border-b border-gray-100">
                                                            {section.headers.map((h, i) => (
                                                                <th key={i} className={`px-6 py-3 font-semibold text-xs uppercase tracking-wide ${i===0 ? 'text-gray-900 w-1/3' : 'text-center'}`}>
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {section.rows.map((row, rIdx) => (
                                                            <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                                                                {row.map((cell, cIdx) => (
                                                                    <td key={cIdx} className={`px-6 py-3 ${cIdx===0 ? 'font-medium text-gray-900' : 'text-center text-gray-600'}`}>
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="p-8 text-center text-gray-400 italic">
                                    <p>Detailed scorecard tables not available for this match.</p>
                                    <p className="text-xs mt-2">Try the Statistics tab.</p>
                                </div>
                             )}
                        </div>
                    )}
                </>
             )}
        </div>
         <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-400 border-t border-gray-200 flex-shrink-0">
            Powered by Gemini AI • Data verified via Google Search
        </div>
      </div>
    </div>
  );
};

export default ScoreboardModal;