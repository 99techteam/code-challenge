import { useState, useMemo, useCallback } from 'react';
import { ArrowDown, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Token } from '@/types';
import TokenInput from './TokenInput';
import SwapDetails from './SwapDetails';
import TokenSelectDialog from './TokenSelectDialog';
import SlippageConfigDialog from './SlippageConfigDialog';
import SuccessDialog from './SuccessDialog';

const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', price: 1645.9337373737374 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 26002.82202020202 },
  { symbol: 'USDC', name: 'USD Coin', price: 0.9998782611186441 },
  { symbol: 'USDT', name: 'Tether USD', price: 1 },
  { symbol: 'ATOM', name: 'Cosmos', price: 7.186657333333334 },
  { symbol: 'OSMO', name: 'Osmosis', price: 0.3772974333333333 },
  { symbol: 'LUNA', name: 'Terra', price: 0.40955638983050846 },
  { symbol: 'wstETH', name: 'Wrapped stETH', price: 1872.2579742372882 },
  { symbol: 'GMX', name: 'GMX', price: 36.345114372881355 },
  { symbol: 'BLUR', name: 'Blur', price: 0.20811525423728813 },
  { symbol: 'BUSD', name: 'Binance USD', price: 0.9998782611186441 },
  { symbol: 'axlUSDC', name: 'Axelar USDC', price: 0.989832 },
  { symbol: 'KUJI', name: 'Kujira', price: 0.675 },
  { symbol: 'EVMOS', name: 'Evmos', price: 0.06246181355932203 },
  { symbol: 'STRD', name: 'Stride', price: 0.7386553389830508 },
  { symbol: 'OKB', name: 'OKB', price: 42.97562059322034 },
  { symbol: 'IBCX', name: 'IBC Index', price: 41.26811355932203 },
  { symbol: 'SWTH', name: 'Switcheo', price: 0.004039850455012084 },
  { symbol: 'ZIL', name: 'Zilliqa', price: 0.01651813559322034 }
];

const FEE_RATE = 0.0025;
const LIQUIDITY_MULTIPLIER = 0.9975;

const TokenSwapForm = () => {
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromUsdValue, setFromUsdValue] = useState('0.00');
  const [toUsdValue, setToUsdValue] = useState('0.00');
  const [slippage, setSlippage] = useState(0.5);
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  const [showSlippageConfig, setShowSlippageConfig] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);
  const [lastSwapData, setLastSwapData] = useState<{
    fromToken: Token;
    toToken: Token;
    fromAmount: string;
    toAmount: string;
  } | null>(null);

  const calculateExchangeRate = useCallback((from: Token, to: Token): number => {
    if (!from.price || !to.price) return 0;
    return from.price / to.price;
  }, []);

  const calculateSwapOutput = useCallback((amountIn: number, from: Token, to: Token): number => {
    if (!amountIn || amountIn <= 0) return 0;
    
    const rate = calculateExchangeRate(from, to);
    if (rate === 0) return 0;
    
    const amountAfterFee = amountIn * LIQUIDITY_MULTIPLIER;
    const baseOutput = amountAfterFee * rate;
    const tradeSize = amountIn * from.price;
    const impactPercent = Math.min((tradeSize / 100000) * 0.5, 5);
    
    setPriceImpact(impactPercent);
    return baseOutput * (1 - impactPercent / 100);
  }, [calculateExchangeRate]);

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
    
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      setToAmount('');
      setFromUsdValue('0.00');
      setToUsdValue('0.00');
      setPriceImpact(0);
      return;
    }
    
    const amount = parseFloat(value);
    const output = calculateSwapOutput(amount, fromToken, toToken);
    
    setToAmount(output > 0 ? output.toFixed(6) : '0');
    setFromUsdValue((amount * fromToken.price).toFixed(2));
    setToUsdValue((output * toToken.price).toFixed(2));
    setExchangeRate(calculateExchangeRate(fromToken, toToken));
  }, [fromToken, toToken, calculateSwapOutput, calculateExchangeRate]);

  const handleSwapTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFromUsdValue(toUsdValue);
    setToUsdValue(fromUsdValue);
    setExchangeRate(calculateExchangeRate(toToken, fromToken));
  }, [fromToken, toToken, fromAmount, toAmount, fromUsdValue, toUsdValue, calculateExchangeRate]);

  const selectFromToken = useCallback((token: Token) => {
    if (token.symbol === toToken.symbol) {
      handleSwapTokens();
    } else {
      setFromToken(token);
      if (fromAmount) {
        setTimeout(() => {
          const amount = parseFloat(fromAmount);
          const output = calculateSwapOutput(amount, token, toToken);
          setToAmount(output > 0 ? output.toFixed(6) : '0');
          setFromUsdValue((amount * token.price).toFixed(2));
          setToUsdValue((output * toToken.price).toFixed(2));
          setExchangeRate(calculateExchangeRate(token, toToken));
        }, 0);
      }
    }
    setShowFromSelect(false);
  }, [toToken, fromAmount, handleSwapTokens, calculateSwapOutput, calculateExchangeRate]);

  const selectToToken = useCallback((token: Token) => {
    if (token.symbol === fromToken.symbol) {
      handleSwapTokens();
    } else {
      setToToken(token);
      if (fromAmount) {
        setTimeout(() => {
          const amount = parseFloat(fromAmount);
          const output = calculateSwapOutput(amount, fromToken, token);
          setToAmount(output > 0 ? output.toFixed(6) : '0');
          setToUsdValue((output * token.price).toFixed(2));
          setExchangeRate(calculateExchangeRate(fromToken, token));
        }, 0);
      }
    }
    setShowToSelect(false);
  }, [fromToken, fromAmount, handleSwapTokens, calculateSwapOutput, calculateExchangeRate]);

  const handleSwap = useCallback(() => {
    if (!fromAmount || !toAmount || isSwapping) return;
    
    setIsSwapping(true);
    
    setTimeout(() => {
      setLastSwapData({
        fromToken,
        toToken,
        fromAmount,
        toAmount
      });
      
      setShowSuccess(true);
      setIsSwapping(false);
      
      // Reset form
      setTimeout(() => {
        setFromAmount('');
        setToAmount('');
        setFromUsdValue('0.00');
        setToUsdValue('0.00');
        setPriceImpact(0);
      }, 300);
    }, 1000);
  }, [fromAmount, toAmount, fromToken, toToken, isSwapping]);

  const minimumReceived = useMemo(
    () => toAmount ? (parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6) : '0',
    [toAmount, slippage]
  );

  const liquidityFee = useMemo(
    () => fromAmount ? (parseFloat(fromAmount) * FEE_RATE).toFixed(6) : '0',
    [fromAmount]
  );

  const isSwapDisabled = !fromAmount || !toAmount || isSwapping;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="p-6 mb-6 bg-card border border-border rounded-lg shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Swap</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSlippageConfig(true)}
            className="group"
          >
            <Settings className="w-5 h-5 group-hover:scale-110 group-hover:rotate-90 transition-all" />
          </Button>
        </div>

        <TokenInput
          label="From"
          token={fromToken}
          amount={fromAmount}
          usdValue={fromUsdValue}
          onAmountChange={handleFromAmountChange}
          onTokenClick={() => setShowFromSelect(true)}
        />

        <div className="flex justify-center -my-1 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapTokens}
            className="border-4 border-background rounded-lg hover:scale-110"
          >
            <ArrowDown className="w-6 h-6 text-primary" />
          </Button>
        </div>

        <TokenInput
          label="To"
          token={toToken}
          amount={toAmount}
          usdValue={toUsdValue}
          onTokenClick={() => setShowToSelect(true)}
          readOnly
        />

        {fromAmount && toAmount && exchangeRate > 0 && (
          <SwapDetails
            fromToken={fromToken}
            toToken={toToken}
            exchangeRate={exchangeRate}
            priceImpact={priceImpact}
            minimumReceived={minimumReceived}
            liquidityFee={liquidityFee}
          />
        )}
      </div>

      <div className="p-6 mb-6 bg-card border border-border rounded-lg shadow-2xl hover:bg-card/80">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Slippage Tolerance</span>
          <Button
            variant="ghost"
            onClick={() => setShowSlippageConfig(true)}
            className="font-bold text-primary hover:scale-110"
          >
            {slippage}%
          </Button>
        </div>
      </div>

      <Button
        onClick={handleSwap}
        disabled={isSwapDisabled}
        className="w-full py-6 text-lg font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {isSwapping ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Swapping...
          </span>
        ) : !fromAmount || !toAmount ? (
          'Enter an amount'
        ) : (
          'Swap'
        )}
      </Button>

      <TokenSelectDialog
        open={showFromSelect}
        onOpenChange={setShowFromSelect}
        onSelect={selectFromToken}
        currentToken={fromToken}
        tokens={TOKENS}
      />

      <TokenSelectDialog
        open={showToSelect}
        onOpenChange={setShowToSelect}
        onSelect={selectToToken}
        currentToken={toToken}
        tokens={TOKENS}
      />

      <SlippageConfigDialog
        open={showSlippageConfig}
        onOpenChange={setShowSlippageConfig}
        slippage={slippage}
        setSlippage={setSlippage}
      />

      {lastSwapData && (
        <SuccessDialog
          open={showSuccess}
          onOpenChange={setShowSuccess}
          fromToken={lastSwapData.fromToken}
          toToken={lastSwapData.toToken}
          fromAmount={lastSwapData.fromAmount}
          toAmount={lastSwapData.toAmount}
        />
      )}
    </div>
  );
};

export default TokenSwapForm;