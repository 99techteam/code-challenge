
import { Info } from 'lucide-react';
import type { EnrichedToken } from '@/types/swap';

import { formatAmountForDisplay } from '@/lib/precision';

interface ExchangeRateDisplayProps {
  exchangeRate: string | null;
  fromToken: EnrichedToken | null;
  toToken: EnrichedToken | null;
}
export const ExchangeRateDisplay = ({ exchangeRate, fromToken, toToken }: ExchangeRateDisplayProps) => {
  return (
    <div className="glass-card p-4 space-y-2 border border-accent/20">
      <div className="flex items-center gap-2 text-sm text-accent">
        <Info className="h-4 w-4" />
        <span className="font-medium">Exchange Rate</span>
      </div>
      <div className="text-sm font-mono">
        {exchangeRate && fromToken && toToken ? (
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            1 {fromToken.currency} = {formatAmountForDisplay(exchangeRate, toToken.decimals)} {toToken.currency}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Select tokens to see exchange rate
          </span>
        )}
      </div>
    </div>
  );
};