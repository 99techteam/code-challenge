import React, { useState, useMemo } from 'react';
import { WalletPage, getPriority } from './WalletPage';
import { useWalletBalances, INITIAL_BALANCES } from './hooks/useWalletBalances';
import { usePrices } from './hooks/usePrices';
import { IssuesAuditModal } from './components/IssuesAuditModal';
import {
  Wallet,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Code2,
  ChevronDown,
  ChevronUp,
  Layers,
  Bug,
  Sparkles
} from 'lucide-react';

export const App: React.FC = () => {
  const balances = useWalletBalances();
  const prices = usePrices();
  const [showRawData, setShowRawData] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Calculate total portfolio value
  const totalValueUsd = useMemo(() => {
    return balances.reduce((acc, b) => {
      if (getPriority(b.blockchain) > -99 && b.amount > 0) {
        const price = prices[b.currency] ?? 0;
        return acc + price * b.amount;
      }
      return acc;
    }, 0);
  }, [balances, prices]);

  const activeCount = balances.filter(b => getPriority(b.blockchain) > -99 && b.amount > 0).length;
  const filteredCount = balances.length - activeCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl opacity-80" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Top Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Switcheo<span className="text-indigo-400">Wallet</span>
                </h1>
                <p className="text-xs text-slate-400">Problem 3 — Refactored React Architecture Demo</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Refactored & Verified
              </span>
            </div>
          </div>

          {/* Portfolio Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Portfolio Balance
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1">
                  ${totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400">Active Assets</div>
                  <div className="text-base font-bold text-white font-mono">{activeCount} tokens</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400">Filtered Out</div>
                  <div className="text-base font-bold text-amber-400 font-mono">{filteredCount} invalid</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Priority Rule Indicator */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-white mb-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Active Sorting Hierarchy:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
              1. Osmosis (100)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
              2. Ethereum (50)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">
              3. Arbitrum (30)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
              4. Zilliqa (20)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
              4. Neo (20)
            </span>
          </div>
        </div>

        {/* Main Wallet Page List */}
        <main className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sorted & Filtered Holdings
            </h2>
            <span className="text-xs text-slate-500">Live prices auto-updating</span>
          </div>

          <WalletPage className="shadow-lg" />
        </main>

        {/* Diagnostic Inspector Accordion */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setShowRawData(!showRawData)}
            className="w-full p-4 flex items-center justify-between text-left text-slate-400 hover:text-white transition"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">Verify Filter Logic: Raw Input Balances ({INITIAL_BALANCES.length})</span>
            </div>
            {showRawData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRawData && (
            <div className="p-4 pt-1 border-t border-slate-800 space-y-2">
              <p className="text-[11px] text-slate-400 mb-2">
                This table lists the raw data before filtering. Notice how 0 amount, negative amount, and unsupported blockchain are excluded in the main list:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1 px-2">Currency</th>
                      <th className="py-1 px-2">Amount</th>
                      <th className="py-1 px-2">Blockchain</th>
                      <th className="py-1 px-2">Priority</th>
                      <th className="py-1 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
                    {INITIAL_BALANCES.map((item, idx) => {
                      const priority = getPriority(item.blockchain);
                      const isIncluded = priority > -99 && item.amount > 0;
                      return (
                        <tr key={idx} className={isIncluded ? 'text-slate-200' : 'text-rose-400/80 bg-rose-950/10'}>
                          <td className="py-1.5 px-2 font-bold">{item.currency}</td>
                          <td className="py-1.5 px-2">{item.amount}</td>
                          <td className="py-1.5 px-2">{item.blockchain}</td>
                          <td className="py-1.5 px-2">{priority}</td>
                          <td className="py-1.5 px-2">
                            {isIncluded ? (
                              <span className="text-emerald-400 font-sans flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Included
                              </span>
                            ) : (
                              <span className="text-rose-400 font-sans flex items-center gap-1">
                                <Filter className="w-3 h-3" /> Filtered Out
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Button to inspect bugs in original prompt code */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-500 via-indigo-600 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-white/10 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Bug className="w-4 h-4 text-white" />
            </div>
            <span>View Code Audit: 15 Bugs, Inefficiencies & Anti-Patterns Breakdown</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> 15 Issues
            </span>
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-500">
          Switcheo Code Challenge Problem 3 • Fully Runnable Vite + React + TypeScript Implementation
        </footer>
      </div>

      {/* Audit Modal Breakdown */}
      <IssuesAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};

export default App;

