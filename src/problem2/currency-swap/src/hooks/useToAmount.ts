import React, { useMemo } from "react";
import tokenStore from "../stores/tokenStore";

const useToAmount = () => {
  const { fromAmount, selectedToken } = tokenStore((state) => state);
  const fromToken = useMemo(
    () => selectedToken?.from ?? { price: 0 },
    [selectedToken],
  );
  const toToken = useMemo(
    () => selectedToken?.to ?? { price: 0 },
    [selectedToken],
  );

  const exchangeRate = useMemo(() => {
    return fromToken?.price / toToken?.price;
  }, [fromToken, toToken]);

  const toAmount = useMemo(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) return "";
    return (Number(fromAmount) * exchangeRate).toFixed(6);
  }, [fromAmount, exchangeRate]);

  return toAmount;
};

export default useToAmount;
