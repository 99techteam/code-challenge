import React from 'react';
import { WalletRowProps } from '../types/wallet';

const CHAIN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Osmosis: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Ethereum: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Arbitrum: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  Zilliqa: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Neo: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' }
};

export const WalletRow: React.FC<WalletRowProps> = ({
  className = '',
  amount: _amount,
  usdValue,
  formattedAmount,
  currency,
  blockchain
}) => {
  const chainStyle = (blockchain && CHAIN_COLORS[blockchain]) || {
    bg: 'bg-slate-800',
    text: 'text-slate-400',
    border: 'border-slate-700'
  };

  const formattedUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(usdValue);

  return (
    <div
      className={`p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-4 group ${className}`}
    >
      {/* Left: Token info & Blockchain */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-white group-hover:scale-105 transition-transform">
          {currency ? currency.slice(0, 3) : 'TOK'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base tracking-tight">{currency}</span>
            {blockchain && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${chainStyle.bg} ${chainStyle.text} ${chainStyle.border}`}
              >
                {blockchain}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            On-chain asset
          </div>
        </div>
      </div>

      {/* Right: Balance amount and USD value */}
      <div className="text-right">
        <div className="font-mono font-bold text-white text-base">
          {formattedAmount} <span className="text-slate-400 text-xs font-normal">{currency}</span>
        </div>
        <div className="font-mono text-xs text-emerald-400 font-medium">
          ~{formattedUsd}
        </div>
      </div>
    </div>
  );
};

export default WalletRow;

