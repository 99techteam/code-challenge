import React, { useState } from "react";
import { ArrowDownUp, Settings } from "lucide-react";
import { MOCK_TOKENS } from "@/constants/tokens";
import { Token } from "@/types";
import {
  Slippage,
  ConfirmSwapModal,
  OrderDetails,
  TokenModal,
  TokenInput,
} from "@/components/swap";
import { Button, useToast } from "@/components/ui";
import { useSwap } from "@/hooks/useSwap";

export const SwapCard: React.FC = () => {
  const {
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    fromAmount,
    setFromAmount,
    toAmount,
    exchangeRate,
    loading,
    slippage,
    setSlippage,
    handleSwitch,
  } = useSwap();

  const { addToast } = useToast();

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<"from" | "to">("from");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<"market" | "limit">("market");

  const handleTokenSelect = (token: Token) => {
    if (activeSide === "from") {
      if (token.symbol === toToken.symbol) {
        handleSwitch();
      } else {
        setFromToken(token);
      }
    } else {
      if (token.symbol === fromToken.symbol) {
        handleSwitch();
      } else {
        setToToken(token);
      }
    }
  };

  const openTokenModal = (side: "from" | "to") => {
    setActiveSide(side);
    setIsTokenModalOpen(true);
  };

  const handleSwap = () => {
    // Validation
    if (!fromAmount || Number(fromAmount) <= 0) {
      addToast("Please enter an amount", "error");
      return;
    }
    if (Number(fromAmount) > fromToken.balance) {
      addToast("Insufficient balance", "error");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const executeSwap = () => {
    setIsConfirmModalOpen(false);
    // Simulate API call
    setTimeout(() => {
      addToast(
        `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        "success"
      );
      setFromAmount("");
    }, 500);
  };

  return (
    <div className="w-full max-w-[480px]">
      <div className="bg-background-secondary rounded-3xl p-4 md:p-6 shadow-xl border border-gray-800">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex gap-6">
            <Button
              onClick={() => setTab("market")}
              variant="ghost"
              size="sm"
              className={`relative h-auto px-0 py-0 font-bold text-lg transition-colors ${
                tab === "market"
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}>
              Market
              {tab === "market" && (
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full"></div>
              )}
            </Button>
            <Button
              onClick={() => setTab("limit")}
              variant="ghost"
              size="sm"
              className={`relative h-auto px-0 py-0 font-bold text-lg transition-colors ${
                tab === "limit"
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}>
              Limit
              {tab === "limit" && (
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full"></div>
              )}
            </Button>
          </div>
          <Button
            onClick={() => setSettingsOpen(!settingsOpen)}
            variant="ghost"
            size="sm"
            className={`h-auto px-2 py-1 text-text-secondary hover:text-text-primary transition-colors ${
              settingsOpen ? "text-primary" : ""
            }`}>
            <Settings size={20} />
          </Button>
        </div>
        {settingsOpen && (
          <Slippage
            value={slippage}
            onChange={setSlippage}
          />
        )}
        <div className="space-y-1 relative">
          <TokenInput
            label="From"
            amount={fromAmount}
            token={fromToken}
            onAmountChange={setFromAmount}
            onTokenClick={() => openTokenModal("from")}
            balance={fromToken.balance}
            error={Number(fromAmount) > fromToken.balance ? "Insufficient balance" : undefined}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handleSwitch}
              className="bg-background-secondary p-2 rounded-xl border-4 border-background text-primary hover:rotate-180 transition-transform duration-300 shadow-lg hover:shadow-primary/20">
              <ArrowDownUp size={20} />
            </button>
          </div>
          <TokenInput
            label="To (Estimate)"
            amount={toAmount}
            token={toToken}
            onTokenClick={() => openTokenModal("to")}
            readOnly
            loading={loading}
          />
        </div>
        <OrderDetails
          exchangeRate={exchangeRate}
          fromSymbol={fromToken.symbol}
          toSymbol={toToken.symbol}
          fee={0.001}
          minReceived={toAmount ? (Number(toAmount) * (1 - slippage / 100)).toFixed(6) : "0.00"}
          priceImpact={0.05}
        />
        <Button
          className="w-full mt-6 rounded-xl text-lg font-bold py-6"
          size="lg"
          onClick={handleSwap}
          disabled={
            loading ||
            !fromAmount ||
            Number(fromAmount) <= 0 ||
            Number(fromAmount) > fromToken.balance
          }>
          {loading
            ? "Calculating..."
            : !fromAmount
            ? "Enter Amount"
            : Number(fromAmount) > fromToken.balance
            ? "Insufficient Balance"
            : "Swap"}
        </Button>
      </div>
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelect={handleTokenSelect}
        tokens={MOCK_TOKENS}
      />
      <ConfirmSwapModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        exchangeRate={exchangeRate}
        onConfirm={executeSwap}
      />
    </div>
  );
};
