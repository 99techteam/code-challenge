import React, { useState } from "react";
import { type Token } from "@/services";
import { type SwapFormData, validateBalance } from "@/schemas/swapSchema";
import { useToast } from "@/hooks/useToast";
import { UseFormSetValue } from "react-hook-form";

interface UseSwapSubmitProps {
  sellToken: Token | null;
  buyToken: Token | null;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  setSellToken: (token: Token | null) => void;
  setBuyToken: (token: Token | null) => void;
  reset: () => void;
  setValue: UseFormSetValue<SwapFormData>;
}

export function useSwapSubmit({
  sellToken,
  buyToken,
  setTokens,
  setSellToken,
  setBuyToken,
  reset,
  setValue,
}: UseSwapSubmitProps) {
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const { toast } = useToast();

  const updateBalance = (token: Token, amount: number, isAdd: boolean) => {
    const newBalance = isAdd
      ? parseFloat(token.balance) + amount
      : Math.max(0, parseFloat(token.balance) - amount);
    const newValue = newBalance * token.priceUsd;
    return {
      ...token,
      balance: newBalance.toFixed(4),
      value: `$${newValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    };
  };

  const onSwapSubmit = async (data: SwapFormData) => {
    if (!sellToken || !buyToken) {
      toast({
        title: "Error",
        description: "Please select both tokens",
        variant: "destructive",
      });
      return;
    }

    if (!validateBalance(data.sellAmount, sellToken.balance)) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${sellToken.symbol}. Available: ${sellToken.balance}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSwapping(true);
      setSwapSuccess(false);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        setSwapSuccess(true);

        const sellAmount = parseFloat(data.sellAmount);
        const buyAmount = parseFloat(data.buyAmount);

        // Update balances
        setTokens((prevTokens) =>
          prevTokens.map((token) =>
            token.symbol === sellToken.symbol
              ? updateBalance(token, sellAmount, false)
              : token.symbol === buyToken.symbol
              ? updateBalance(token, buyAmount, true)
              : token
          )
        );

        setSellToken(sellToken ? updateBalance(sellToken, sellAmount, false) : null);
        setBuyToken(buyToken ? updateBalance(buyToken, buyAmount, true) : null);

        toast({
          title: "Swap Successful!",
          description: `Successfully swapped ${data.sellAmount} ${sellToken.symbol} for ${data.buyAmount} ${buyToken.symbol}`,
          variant: "success" as const,
        });

        reset();
        setSwapSuccess(false);
        if (sellToken && buyToken) {
          setValue("sellTokenSymbol", sellToken.symbol);
          setValue("buyTokenSymbol", buyToken.symbol);
        }
      } else {
        throw new Error("Swap failed due to network issues");
      }
    } catch (error) {
      toast({
        title: "Swap Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const getButtonState = () => {
    if (isSwapping) return "swapping";
    if (swapSuccess) return "success";
    return "default";
  };

  return {
    isSwapping,
    swapSuccess,
    onSwapSubmit,
    getButtonState,
  };
}
