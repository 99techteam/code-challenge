import React, { useState } from 'react';
import { Token, SwapQuote } from '../types/swap';
import { formatNumber, formatUsd } from '../services/priceService';
import { ArrowLeftRight, ChevronDown, ChevronUp, Info, Fuel, ShieldCheck } from 'lucide-react';

interface SwapDetailsProps {
  fromToken: Token;
  toToken: Token;
  quote: SwapQuote;
  slippage: number;
}

export const SwapDetails: React.FC<SwapDetailsProps> = ({
  fromToken,
  toToken,
  quote,
  slippage
}) => {
  const [invertRate, setInvertRate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayRate = invertRate
    ? `1 ${toToken.symbol} = ${formatNumber(quote.inverseRate, 6)} ${fromToken.symbol}`
    : `1 ${fromToken.symbol} = ${formatNumber(quote.rate, 6)} ${toToken.symbol}`;

  const rateUsd = invertRate ? toToken.price : fromToken.price;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 overflow-hidden text-xs transition">
      {/* Rate Banner */}
      <div className="p-3 flex items-center justify-between text-slate-700 dark:text-slate-300">
        <button
          type="button"
          onClick={() => setInvertRate(!invertRate)}
          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition font-mono font-medium text-left"
          title="Click to invert exchange rate"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{displayRate}</span>
          <span className="text-slate-400 dark:text-slate-500 font-sans">({formatUsd(rateUsd)})</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition rounded"
          aria-label="Toggle details"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-200 dark:border-slate-800/80 space-y-2 text-slate-500 dark:text-slate-400 animate-fadeIn">
          {/* Minimum received */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              Minimum received
              <span title="The least amount of tokens you will receive, based on your slippage tolerance.">
                <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </span>
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
              {formatNumber(quote.minimumReceived, 6)} {toToken.symbol}
            </span>
          </div>

          {/* Price impact */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              Price Impact
              <span title="Estimated change in price due to your trade size.">
                <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </span>
            </span>
            <span
              className={`font-mono font-medium ${
                quote.priceImpact > 2.0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {quote.priceImpact < 0.01 ? '< 0.01%' : `${quote.priceImpact.toFixed(2)}%`}
            </span>
          </div>

          {/* Slippage */}
          <div className="flex items-center justify-between">
            <span>Slippage Tolerance</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{slippage}%</span>
          </div>

          {/* Network Fee */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Fuel className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              Network Fee
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">~{formatUsd(quote.estimatedFeeUsd)}</span>
          </div>

          {/* Routing */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              Order Routing
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Switcheo Liquidity Router v2</span>
          </div>
        </div>
      )}
    </div>
  );
};
