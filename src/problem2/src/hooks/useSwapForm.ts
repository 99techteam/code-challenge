import { useCallback, useMemo, useState } from "react";
import type { Token } from "../types";
import {
  calculateExchangeRate,
  findTokenByCurrency,
} from "../utils/tokenHelpers";
import { formatAmount, isValidDecimalInput } from "../utils/validation";

interface UseSwapFormProps {
  tokens: Token[];
}

interface UseSwapFormReturn {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  exchangeRate: number | null;
  setFromToken: (token: string) => void;
  setToToken: (token: string) => void;
  handleFromAmountChange: (value: string) => void;
  handleSwapTokens: () => void;
  isSwapDisabled: boolean;
}

export const useSwapForm = ({
  tokens,
}: UseSwapFormProps): UseSwapFormReturn => {
  const [fromToken, setFromToken] = useState<string>(() =>
    tokens.length > 0 ? tokens[0].currency : "",
  );
  const [toToken, setToToken] = useState<string>(() =>
    tokens.length > 1
      ? tokens[1].currency
      : tokens.length > 0
        ? tokens[0].currency
        : "",
  );
  const [fromAmount, setFromAmount] = useState<string>("");

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken || tokens.length === 0) {
      return null;
    }

    const fromTokenData = findTokenByCurrency(tokens, fromToken);
    const toTokenData = findTokenByCurrency(tokens, toToken);

    return calculateExchangeRate(fromTokenData, toTokenData);
  }, [fromToken, toToken, tokens]);

  const toAmount = useMemo(() => {
    if (!exchangeRate || !fromAmount || isNaN(parseFloat(fromAmount))) {
      return "";
    }
    const calculatedAmount = parseFloat(fromAmount) * exchangeRate;
    return formatAmount(calculatedAmount);
  }, [exchangeRate, fromAmount]);

  const handleFromAmountChange = useCallback((value: string) => {
    if (isValidDecimalInput(value)) {
      setFromAmount(value);
    }
  }, []);

  const handleSwapTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  }, [fromToken, toToken, toAmount]);

  const isSwapDisabled = useMemo(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return true;
    if (fromToken === toToken) return true;
    return false;
  }, [fromAmount, fromToken, toToken]);

  return {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    exchangeRate,
    setFromToken,
    setToToken,
    handleFromAmountChange,
    handleSwapTokens,
    isSwapDisabled,
  };
};
