import type { Token } from "@/types";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

const SwapDetails = ({ 
  fromToken, 
  toToken, 
  exchangeRate, 
  priceImpact, 
  minimumReceived, 
  liquidityFee 
}: {
  fromToken: Token;
  toToken: Token;
  exchangeRate: number;
  priceImpact: number;
  minimumReceived: string;
  liquidityFee: string;
}) => {
  const priceImpactColor = useMemo(() => {
    if (priceImpact < 1) return 'text-green-500';
    if (priceImpact < 3) return 'text-yellow-500';
    return 'text-red-500';
  }, [priceImpact]);

  return (
    <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Rate</span>
        <span className="font-medium flex items-center gap-1">
          1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
          <TrendingUp className="w-3 h-3 text-green-500" />
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Price Impact</span>
        <span className={`font-medium ${priceImpactColor}`}>
          {priceImpact < 0.01 ? '<0.01' : priceImpact.toFixed(2)}%
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Minimum Received</span>
        <span className="font-medium">{minimumReceived} {toToken.symbol}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Liquidity Provider Fee</span>
        <span className="font-medium">{liquidityFee} {fromToken.symbol}</span>
      </div>
    </div>
  );
};


export default SwapDetails;