import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnrichedToken } from "@/types/swap";
import { TokenInputSection } from "./TokenInputSection";
import { ExchangeRateDisplay } from "./ExchangeRateDisplay";
import { SwapButton } from "./SwapButton";
import { useSwapForm } from "@/hooks/useSwapForm";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useTokenAutoSelect } from "@/hooks/useTokenAutoSelect";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { calculateExchangeAmount, formatAmountForDisplay } from "@/lib/precision";

interface SwapCardProps {
  tokens: EnrichedToken[];
}

export const SwapCard = ({ tokens }: SwapCardProps) => {
  const {
    formData,
    updateFromToken,
    updateToToken,
    updateFromAmount,
    swapTokens,
    resetAmounts,
    setTokens,
    validateForm,
    handleAmountChange,
    handleKeyDown,
    isValid,
  } = useSwapForm();

  const { exchangeRate } = useExchangeRate(
    formData.fromToken,
    formData.toToken
  );
  
  // Calculate toAmount based on exchange rate using precise arithmetic
  const toAmount = formData.fromAmount && exchangeRate && formData.fromToken && formData.toToken
    ? formatAmountForDisplay(
        calculateExchangeAmount(
          formData.fromAmount,
          formData.fromToken.price,
          formData.toToken.price,
        ),
        formData.toToken.decimals
      )
    : '';

  const { isLoading, executeSwap } = useSwapExecution();

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = handleAmountChange(e.target.value);
    updateFromAmount(formattedValue);
  };

  const handleSwap = async () => {
    await executeSwap(formData, validateForm(), resetAmounts);
  };

  // Auto-select first two tokens
  useTokenAutoSelect(
    tokens,
    !!formData.fromToken,
    !!formData.toToken,
    setTokens
  );


  return (
    <Card className="glass-card w-full max-w-md mx-auto pulse-glow border-2">
      <CardHeader className="pb-6 text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Swap Tokens
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Exchange tokens instantly with the best rates
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* From Token Section */}
        <TokenInputSection
          label="From"
          token={formData.fromToken}
          amount={formData.fromAmount}
          onTokenSelect={updateFromToken}
          onAmountChange={handleFromAmountChange}
          onKeyDown={handleKeyDown}
          tokens={tokens}
          autoFocus
        />

        {/* Swap Icon */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={swapTokens}
            className="swap-icon h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
          >
            <ArrowUpDown className="h-6 w-6 text-primary" />
          </Button>
        </div>

        {/* To Token Section */}
        <TokenInputSection
          label="To"
          token={formData.toToken}
          amount={toAmount}
          onTokenSelect={updateToToken}
          tokens={tokens}
          readOnly
        />

        {/* Exchange Rate Info */}
        <ExchangeRateDisplay
          exchangeRate={exchangeRate}
          fromToken={formData.fromToken}
          toToken={formData.toToken}
        />

        {/* Swap Button */}
        <SwapButton
          onClick={handleSwap}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};