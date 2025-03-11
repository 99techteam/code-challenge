import React, { useState, useEffect } from "react";

import { fetchTokenPrices, TokenPrices } from "../services/api";
import defaultImageToken from "../assets/default-token-image.jpeg";
import CurrencySwapForm from "./CurrencySwapForm";
import PageLayout from "../layouts/PageLayout";
import LoadingSkeleton from "./LoadingSkeleton";

export type TokenDropdownOption = {
  value: string;
  label: React.ReactNode;
};

const getTokenOptions = (tokens: TokenPrices) => {
  return tokens?.map((token) => ({
    value: token.currency,
    label: (
      <div className="flex items-center">
        <img
          src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.currency.toUpperCase()}.svg`}
          alt={token.currency}
          className="h-5 w-5 mr-2 rounded-full"
          onError={(e) => {
            e.currentTarget.src = defaultImageToken;
          }}
        />
        {token.currency}
      </div>
    ),
  }));
};

const CurrencySwapContainer: React.FC = () => {
  const [tokens, setTokens] = useState<TokenPrices>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currencyOptions, setCurrencyOptions] = useState<TokenDropdownOption[]>(
    []
  );
  const [fetchTokenError, setFetchTokenError] = useState("");

  useEffect(() => {
    const getTokens = async () => {
      setIsLoading(true);
      setFetchTokenError("");
      try {
        const fetchedTokens = await fetchTokenPrices();
        setTokens(fetchedTokens);
        setCurrencyOptions(getTokenOptions(fetchedTokens));
      } catch (error) {
        console.log("🚀 [ERROR]:", error);
        setFetchTokenError("Failed to fetch token prices.");
      } finally {
        setIsLoading(false);
      }
    };

    getTokens();
  }, []);

  return (
    <PageLayout>
      <h2 className="text-2xl font-semibold mb-4 sm:mb-6 text-center">
        Currency Swap
      </h2>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <CurrencySwapForm
          tokens={tokens}
          isLoading={isLoading}
          fetchTokenError={fetchTokenError}
          tokenDropdownOptions={currencyOptions}
        />
      )}
    </PageLayout>
  );
};

export default CurrencySwapContainer;
