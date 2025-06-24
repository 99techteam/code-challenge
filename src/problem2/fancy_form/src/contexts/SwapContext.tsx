import React, { createContext, useContext, useEffect, useState } from "react";
import type { Token } from "@/types";
import { useGetTokenPrices } from "@/hooks/useGetTokenPrices";

interface SwapContextType {
  tokenFrom: Token | null;
  tokenTo: Token | null;
  selectTokenFrom: (token: Token) => void;
  selectTokenTo: (token: Token) => void;
  swapToken: () => void;
}
const DEFAULT_FROM_TOKEN = "ETH";
const DEFAULT_TO_TOKEN = "USD";

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: listToken, isLoading } = useGetTokenPrices();
  // STATES
  const [tokenFrom, setTokenFrom] = useState<Token | null>(null);
  const [tokenTo, setTokenTo] = useState<Token | null>(null);
  useEffect(() => {
    if (isLoading || !listToken) return;

    // Find USD and ETH in listToken
    const usdToken = listToken.find(
      (token: Token) => token.currency === DEFAULT_TO_TOKEN
    );
    const ethToken = listToken.find(
      (token: Token) => token.currency === DEFAULT_FROM_TOKEN
    );

    // Set defaults only if tokens haven't been set yet
    setTokenFrom((prev) => prev ?? usdToken ?? null);
    setTokenTo((prev) => prev ?? ethToken ?? null);
  }, [listToken, isLoading]);
  // Select tokenFrom, ensuring tokenTo isn't the same
  const selectTokenFrom = (token: Token) => {
    if (tokenTo?.currency === token.currency) {
      // Swap if selecting the same token as tokenTo
      setTokenFrom(tokenTo);
      setTokenTo(tokenFrom);
    } else {
      setTokenFrom(token);
    }
  };

  // Select tokenTo, ensuring tokenFrom isn't the same
  const selectTokenTo = (token: Token) => {
    if (tokenFrom?.currency === token.currency) {
      // Swap if selecting the same token as tokenFrom
      setTokenTo(tokenFrom);
      setTokenFrom(tokenTo);
    } else {
      setTokenTo(token);
    }
  };

  // Swap tokenFrom and tokenTo
  const swapToken = () => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
  };

  return (
    <SwapContext.Provider
      value={{
        tokenFrom,
        tokenTo,
        selectTokenFrom,
        selectTokenTo,
        swapToken,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};

export const useSwap = (): SwapContextType => {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error("useSwap must be used within a SwapProvider");
  }
  return context;
};

export default SwapContext;
