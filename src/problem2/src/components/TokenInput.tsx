import React from 'react';
import { Token } from '../types/swap';
import { TokenIcon } from './TokenIcon';
import { formatNumber, formatUsd } from '../services/priceService';
import { ChevronDown, Wallet } from 'lucide-react';

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  onChangeAmount?: (val: string) => void;
  onOpenTokenSelect: () => void;
  readOnly?: boolean;
  balance?: number;
  showPercentages?: boolean;
  onSelectPercentage?: (pct: number) => void;
  error?: string | null;
  id?: string;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  label,
  token,
  amount,
  onChangeAmount,
  onOpenTokenSelect,
  readOnly = false,
  balance = 0,
  showPercentages = false,
  onSelectPercentage,
  error,
  id
}) => {
  const numericAmount = parseFloat(amount) || 0;
  const estimatedUsd = numericAmount * (token?.price || 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, '.');
    // Sanitize input: allow only numbers and a single decimal point
    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
      // Prevent multiple leading zeroes like 000
      if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
        val = val.replace(/^0+/, '') || '0';
      }
      onChangeAmount?.(val);
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-200 border ${
        error
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/60 focus-within:border-rose-500'
          : 'bg-slate-50/90 dark:bg-slate-900/80 hover:bg-slate-100/80 dark:hover:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20'
      }`}
    >
      {/* Top row: Label & Balance */}
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center text-slate-500 dark:text-slate-400 gap-1">
            <Wallet className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <span>Balance:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
              {formatNumber(balance, 4)}
            </span>
          </div>

          {showPercentages && balance > 0 && onSelectPercentage && (
            <div className="flex items-center gap-1 ml-1">
              {[25, 50, 100].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onSelectPercentage(pct)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-600/40 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-xs transition"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Row: Input field & Token select button */}
      <div className="flex items-center justify-between gap-3">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          placeholder="0.0"
          value={amount}
          onChange={handleInputChange}
          readOnly={readOnly}
          className={`w-full bg-transparent text-2xl sm:text-3xl font-bold outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition tracking-tight font-mono ${
            readOnly ? 'cursor-default' : ''
          }`}
        />

        <button
          type="button"
          onClick={onOpenTokenSelect}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-95 border border-slate-200 dark:border-slate-700/80 shadow-sm transition group"
        >
          <TokenIcon symbol={token.symbol} size="sm" />
          <span className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
            {token.symbol}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition" />
        </button>
      </div>

      {/* Bottom row: USD value & Error message */}
      <div className="flex items-center justify-between mt-2 pt-1 min-h-[1.25rem]">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {numericAmount > 0 ? (
            <span>~{formatUsd(estimatedUsd)}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">$0.00</span>
          )}
        </div>

        {error && (
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-fadeIn">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
