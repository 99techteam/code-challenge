import type { FC, ReactNode } from 'react';
import { RefreshCw, Wallet, Trophy, Database } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'swap' | 'wallet' | 'scoreboard' | 'coins';
  onTabChange: (tab: 'swap' | 'wallet' | 'scoreboard' | 'coins') => void;
  username?: string;
  score?: number;
}

export const Layout: FC<LayoutProps> = ({ children, activeTab, onTabChange, username, score }) => {
  const tabs = [
    { id: 'swap', label: 'Swap', icon: RefreshCw },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'scoreboard', label: 'Scoreboard', icon: Trophy },
    { id: 'coins', label: 'Coins', icon: Database },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <RefreshCw className="text-cyan-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              CryptoDash
            </span>
          </div>
          
          <div className="hidden md:flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-sm">
            {username && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-slate-300 font-medium">{username}</span>
                <span className="text-cyan-400 font-bold ml-1">{score} pts</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 z-0">
        {children}
      </main>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-white/10 pb-safe z-50">
        <div className="flex justify-around p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 w-16 ${
                  activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
