import type { FC } from 'react';
import type { Score } from '../types';
import { Trophy, Medal } from 'lucide-react';

interface ScoreboardPageProps {
  scores: Score[];
  currentUsername?: string;
}

export const ScoreboardPage: FC<ScoreboardPageProps> = ({ scores, currentUsername }) => {
  return (
    <div className="max-w-2xl mx-auto pt-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-4">
          <Trophy className="text-cyan-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Top Swappers</h1>
        <p className="text-slate-400">Compete with others by making swaps to earn points!</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/50 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-7">User</div>
          <div className="col-span-3 text-right">Score</div>
        </div>
        
        <div className="relative">
          {scores.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Loading scores...</div>
          ) : (
            scores.map((score, index) => {
              const isCurrentUser = score.username === currentUsername;
              return (
                <div 
                  key={score.username}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 last:border-0 transition-all duration-500 ${
                    isCurrentUser ? 'bg-cyan-500/10 relative' : 'hover:bg-white/5'
                  }`}
                >
                  {isCurrentUser && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
                  )}
                  
                  <div className="col-span-2 flex justify-center">
                    {index === 0 ? <Medal className="text-yellow-400" size={24} /> :
                     index === 1 ? <Medal className="text-slate-300" size={24} /> :
                     index === 2 ? <Medal className="text-amber-600" size={24} /> :
                     <span className="text-slate-500 font-bold">{index + 1}</span>}
                  </div>
                  
                  <div className="col-span-7 font-medium flex items-center gap-2">
                    <span className={isCurrentUser ? 'text-cyan-400 font-bold' : 'text-slate-200'}>
                      {score.username}
                    </span>
                    {isCurrentUser && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">You</span>}
                  </div>
                  
                  <div className="col-span-3 text-right font-mono font-bold text-white">
                    {score.score}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
