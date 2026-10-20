import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Token } from '../types/swap';
import { TokenIcon } from './TokenIcon';
import { formatNumber, formatUsd } from '../services/priceService';
import { Search, X, Check, Flame } from 'lucide-react';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  selectedToken: Token;
  otherToken: Token;
  onSelectToken: (token: Token) => void;
  walletBalances: Record<string, number>;
}

const POPULAR_SYMBOLS = ['ETH', 'USDC', 'WBTC', 'ATOM', 'SWTH', 'BUSD'];

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
  isOpen,
  onClose,
  tokens,
  selectedToken,
  otherToken,
  onSelectToken,
  walletBalances
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tokens;
    return tokens.filter(
      t =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query)
    );
  }, [tokens, search]);

  const popularTokens = useMemo(() => {
    return tokens.filter(t => POPULAR_SYMBOLS.includes(t.symbol));
  }, [tokens]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-md transition-opacity duration-200 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp text-slate-900 dark:text-slate-100 z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Select a Token</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose from {tokens.length} verified assets</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 pb-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search token name or symbol..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Popular tokens chips */}
        {!search && popularTokens.length > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Flame className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Popular:
            </span>
            {popularTokens.map(t => {
              const isSelected = t.symbol === selectedToken.symbol;
              const isOther = t.symbol === otherToken.symbol;
              return (
                <button
                  key={t.symbol}
                  onClick={() => {
                    onSelectToken(t);
                    onClose();
                  }}
                  disabled={isOther}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-300 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : isOther
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <TokenIcon symbol={t.symbol} size="sm" />
                  <span>{t.symbol}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Token List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredTokens.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No tokens found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try searching another token symbol or name</p>
            </div>
          ) : (
            filteredTokens.map(token => {
              const isSelected = token.symbol === selectedToken.symbol;
              const isOther = token.symbol === otherToken.symbol;
              const balance = walletBalances[token.symbol] || 0;
              const balanceUsd = balance * token.price;

              return (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onSelectToken(token);
                    onClose();
                  }}
                  disabled={isOther}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition group ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30'
                      : isOther
                      ? 'opacity-35 cursor-not-allowed bg-transparent'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <TokenIcon symbol={token.symbol} size="md" />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                          {token.symbol}
                        </span>
                        {isSelected && (
                          <span className="flex items-center text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded font-medium">
                            <Check className="w-3 h-3 mr-0.5" /> Selected
                          </span>
                        )}
                        {isOther && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                            Paired
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                        {token.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatUsd(token.price)}
                    </div>
                    {balance > 0 ? (
                      <div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                          {formatNumber(balance, 4)} {token.symbol}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          ~{formatUsd(balanceUsd)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        Bal: 0
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          Prices synchronized with Switcheo On-Chain Oracle
        </div>
      </div>
    </div>
  );
};
