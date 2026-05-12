/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { DefaultToken, Token } from "../types";
import { PRICES_URL } from "../constants/url";
import { removeDuplicatePrices } from "../utils";
import { MOCKUP_BALANCES } from "../constants/balances";

type TokenContextType = {
  tokens: Token[];
  loading: boolean;
  error: string | null;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function TokenProvider({ children }: Props) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);

        const res = await fetch(PRICES_URL);

        if (!res.ok) {
          throw new Error("Get prices failed");
        }

        const data: DefaultToken[] = await res.json();

        const tokensPricesFormatted = removeDuplicatePrices(
          data.filter((p) => p.price > 0),
        );

        const tokenList: Token[] = tokensPricesFormatted?.map((tokenPrice) => ({
          name: tokenPrice?.currency,
          symbol: tokenPrice?.currency,
          price: tokenPrice?.price,
          icon: `/assets/tokens/${tokenPrice?.currency}.svg`,
          balance: MOCKUP_BALANCES[tokenPrice?.currency] || 0,
        }));

        setTokens(tokenList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return (
    <TokenContext.Provider
      value={{
        tokens,
        loading,
        error,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export const useTokenContext = () => {
  const context = useContext(TokenContext);

  if (!context) {
    throw new Error("useTokenContext must be used within TokenProvider");
  }

  return context;
};
