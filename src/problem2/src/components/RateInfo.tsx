import type { Token } from '../types';
import { formatRate } from '../utils/format';

interface RateInfoProps {
  fromToken: Token | null;
  toToken: Token | null;
  exchangeRate: number | null;
  priceImpact: number;
}

export default function RateInfo({ fromToken, toToken, exchangeRate, priceImpact }: RateInfoProps) {
  if (!fromToken || !toToken || !exchangeRate) return null;

  return (
    <div className="space-y-2 pt-2 pb-1">
      {/* Exchange rate */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs font-medium">Exchange Rate</span>
        <span className="text-gray-600 text-xs font-medium">
          1 {fromToken.currency} = {formatRate(exchangeRate)} {toToken.currency}
        </span>
      </div>

      {/* Price impact */}
      {priceImpact > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs font-medium">Price Impact</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            priceImpact < 1
              ? 'text-emerald-600 bg-emerald-50'
              : priceImpact < 5
              ? 'text-amber-600 bg-amber-50'
              : 'text-red-600 bg-red-50'
          }`}>
            ~{priceImpact.toFixed(2)}%
          </span>
        </div>
      )}

      {priceImpact >= 5 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-600 text-xs flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          High price impact! Consider reducing the amount.
        </div>
      )}
    </div>
  );
}
