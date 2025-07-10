import { useState, useEffect } from "react";
import { SwapCard } from "@/components/SwapCard";
import { BalanceSidebar } from "@/components/BalanceSidebar";
import { SwapHeader } from "@/components/SwapHeader";
import { SwapButton } from "@/components/SwapButton";
import { ExchangeRate } from "@/components/ExchangeRate";
import { SwapActionButton } from "@/components/SwapActionButton";
import { LoadingState } from "@/components/LoadingState";
import { useTokens } from "@/hooks/useTokens";
import { useSwapForm } from "@/hooks/useSwapForm";
import { useSwapLogic } from "@/hooks/useSwapLogic";
import { useSwapSubmit } from "@/hooks/useSwapSubmit";
import { createSwapCardConfigs } from "@/utils/swapHelpers";
import { roundAmount } from "@/utils/roundAmount";

export function SwapInterface() {
  const [isBalanceSidebarOpen, setIsBalanceSidebarOpen] = useState(false);

  const {
    tokens,
    setTokens,
    sellToken,
    setSellToken,
    buyToken,
    setBuyToken,
    isLoading,
    error,
  } = useTokens();

  const {
    register,
    handleSubmit,
    setValue,
    errors,
    isValid,
    reset,
    trigger,
    sellAmount,
    buyAmount,
  } = useSwapForm();

  const {
    getExchangeRate,
    handleAmountChange,
    handleSwapTokens,
    handleMaxClick,
    handleTokenSelect,
    formatExchangeRate,
  } = useSwapLogic({
    sellToken,
    buyToken,
    setSellToken,
    setBuyToken,
    setValue,
    trigger,
    sellAmount,
    buyAmount,
  });

  const { isSwapping, swapSuccess, onSwapSubmit, getButtonState } =
    useSwapSubmit({
      sellToken,
      buyToken,
      setTokens,
      setSellToken,
      setBuyToken,
      reset,
      setValue,
    });

  const getButtonContent = () => {
    const state = getButtonState();
    if (state === "swapping")
      return (
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Swapping...
        </div>
      );
    if (state === "success")
      return (
        <div className="flex items-center gap-2">
          <span className="h-4 w-4">✓</span>
          Swap Successful!
        </div>
      );
    return "Swap";
  };

  // Update amounts when tokens change
  useEffect(() => {
    if (sellAmount && !isNaN(parseFloat(sellAmount)) && sellToken && buyToken) {
      const rate = getExchangeRate();
      const calculatedBuyAmount = roundAmount(parseFloat(sellAmount) * rate);
      setValue("buyAmount", calculatedBuyAmount);
    }
  }, [sellToken, buyToken, sellAmount, getExchangeRate, setValue]);

  // Create swap card configurations
  const swapCardConfigs = createSwapCardConfigs(
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    handleAmountChange,
    handleTokenSelect,
    handleMaxClick,
    register,
    errors
  );

  if (isLoading || error) {
    return <LoadingState isLoading={isLoading} error={error} />;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <SwapHeader
        isSwapping={isSwapping}
        onBalanceClick={() => setIsBalanceSidebarOpen(true)}
      />

      {/* Swap Cards Container */}
      <div className="relative">
        {swapCardConfigs.map((config, index) => (
          <div key={config.title}>
            <SwapCard
              title={config.title}
              token={config.token}
              amount={config.amount}
              onAmountChange={config.onAmountChange}
              onTokenSelect={config.onTokenSelect}
              tokens={tokens}
              showMax={config.showMax}
              onMaxClick={config.onMaxClick}
              register={config.register}
              error={config.error}
              className={config.className}
              disabled={isSwapping}
            />

            {/* Swap Button between cards */}
            {index === 0 && <SwapButton onClick={handleSwapTokens} />}
          </div>
        ))}
      </div>

      {/* Exchange Rate */}
      <ExchangeRate exchangeRate={formatExchangeRate()} />

      {/* Action Button */}
      <SwapActionButton
        onClick={handleSubmit(onSwapSubmit)}
        disabled={
          isSwapping || !isValid || !sellToken || !buyToken || swapSuccess
        }
        isSwapping={isSwapping}
        isValid={isValid}
        sellToken={sellToken}
        buyToken={buyToken}
        swapSuccess={swapSuccess}
        buttonContent={getButtonContent()}
      />

      {/* Balance Sidebar */}
      <BalanceSidebar
        open={isBalanceSidebarOpen}
        onOpenChange={setIsBalanceSidebarOpen}
        tokens={tokens}
      />
    </div>
  );
}
