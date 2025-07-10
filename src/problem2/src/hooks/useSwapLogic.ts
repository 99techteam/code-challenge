import { useState, useCallback } from "react";
import { type Token } from "@/services";
import { roundAmount } from "@/utils/roundAmount";
import { UseFormTrigger, UseFormSetValue } from "react-hook-form";
import { type SwapFormData } from "@/schemas/swapSchema";

interface UseSwapLogicProps {
  sellToken: Token | null;
  buyToken: Token | null;
  setSellToken: (token: Token | null) => void;
  setBuyToken: (token: Token | null) => void;
  setValue: UseFormSetValue<SwapFormData>;
  trigger: UseFormTrigger<SwapFormData>;
  sellAmount: string;
  buyAmount: string;
}

export function useSwapLogic({
  sellToken,
  buyToken,
  setSellToken,
  setBuyToken,
  setValue,
  trigger,
  sellAmount,
  buyAmount,
}: UseSwapLogicProps) {
  const [isUpdatingSell, setIsUpdatingSell] = useState(false);

  // Calculate exchange rate
  const getExchangeRate = useCallback(() => {
    if (!sellToken || !buyToken) return 0;
    return sellToken.priceUsd / buyToken.priceUsd;
  }, [sellToken, buyToken]);

  const handleAmountChange = (amount: string, type: "sell" | "buy") => {
    const isSell = type === "sell";
    const currentField = isSell ? "sellAmount" : "buyAmount";
    const otherField = isSell ? "buyAmount" : "sellAmount";
    const currentToken = isSell ? sellToken : buyToken;
    const otherToken = isSell ? buyToken : sellToken;

    setValue(currentField, amount);

    // Check if user is entering amount without selecting token
    if (amount && !isNaN(parseFloat(amount)) && !currentToken) {
      return;
    }

    if (amount && !isNaN(parseFloat(amount)) && currentToken && otherToken) {
      if (isSell) {
        setIsUpdatingSell(true);
        const rate = getExchangeRate();
        const calculatedAmount = roundAmount(parseFloat(amount) * rate);
        setValue(otherField, calculatedAmount);
        setIsUpdatingSell(false);
      } else if (!isUpdatingSell) {
        const rate = getExchangeRate();
        const calculatedAmount = roundAmount(parseFloat(amount) / rate);
        setValue(otherField, calculatedAmount);
      }
    } else {
      setValue(otherField, "");
    }
    trigger(["sellAmount", "buyAmount"]);
  };

  const handleSwapTokens = () => {
    if (!sellToken || !buyToken) return;

    const tempToken = sellToken;
    const tempAmount = sellAmount;
    setSellToken(buyToken);
    setBuyToken(tempToken);
    setValue("sellAmount", buyAmount);
    setValue("buyAmount", tempAmount);
    setValue("sellTokenSymbol", buyToken.symbol);
    setValue("buyTokenSymbol", tempToken.symbol);
  };

  const handleMaxClick = () => {
    if (!sellToken) return;
    handleAmountChange(sellToken.balance, "sell");
  };

  const handleTokenSelect = (token: Token, type: "sell" | "buy") => {
    const isSell = type === "sell";
    const currentToken = isSell ? sellToken : buyToken;
    const otherToken = isSell ? buyToken : sellToken;
    const setCurrentToken = isSell ? setSellToken : setBuyToken;
    const setOtherToken = isSell ? setBuyToken : setSellToken;
    const currentSymbolField = isSell ? "sellTokenSymbol" : "buyTokenSymbol";
    const otherSymbolField = isSell ? "buyTokenSymbol" : "sellTokenSymbol";

    if (!otherToken) {
      setCurrentToken(token);
      setValue(currentSymbolField, token.symbol);
      // Reset amounts when token is selected
      setValue("sellAmount", null);
      setValue("buyAmount", null);
      return;
    }

    if (token.symbol === otherToken.symbol) {
      // If selecting the same token as the other side, swap them
      setCurrentToken(token);
      setOtherToken(currentToken);
      const currentAmount = isSell ? sellAmount : buyAmount;
      const otherAmount = isSell ? buyAmount : sellAmount;
      const currentAmountField = isSell ? "sellAmount" : "buyAmount";
      const otherAmountField = isSell ? "buyAmount" : "sellAmount";
      
      setValue(currentAmountField, otherAmount);
      setValue(otherAmountField, currentAmount);
      setValue(currentSymbolField, token.symbol);
      setValue(otherSymbolField, currentToken?.symbol || "");
    } else {
      setCurrentToken(token);
      setValue(currentSymbolField, token.symbol);
      // Reset amounts when token is selected
      setValue("sellAmount", null);
      setValue("buyAmount", null);
    }
  };

  const formatExchangeRate = () => {
    if (!sellToken || !buyToken) return "Select tokens to see exchange rate";

    const rate = getExchangeRate();
    if (rate === 0) return "Exchange rate unavailable";

    if (rate > 1) {
      return `1 ${sellToken.symbol} = ${rate.toLocaleString()} ${
        buyToken.symbol
      }`;
    } else {
      return `1 ${sellToken.symbol} = ${rate.toFixed(8)} ${buyToken.symbol}`;
    }
  };

  return {
    getExchangeRate,
    handleAmountChange,
    handleSwapTokens,
    handleMaxClick,
    handleTokenSelect,
    formatExchangeRate,
  };
}
