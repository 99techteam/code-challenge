import { useEffect, useState } from "react";
import CurrencyInputCpn from "./CurrencyInputCpn";
import type { Token } from "../types";
import { isEmpty } from "lodash";

interface ListTokenProps {
  tokens: Token[];
}

const SwapCurrencyCpn = ({ tokens }: ListTokenProps) => {
  const [fromToken, setFromToken] = useState<Token>();
  const [toToken, setToToken] = useState<Token>();
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");

  useEffect(() => {
    if (!isEmpty(tokens)) {
      setFromToken(tokens?.find((t: Token) => t?.currency === "USD"));
      setToToken(tokens?.find((t: Token) => t?.currency === "ETH"));
      handleChangeFromAmount("1");
    }
  }, [tokens]);

  const calculatedAmountByRate = (
    from: Token | undefined,
    to: Token | undefined,
    amount: string
  ) => {
    if (!from || !to) return "";
    const rate = from?.price / to?.price;
    return (rate * parseFloat(amount)).toFixed(4);
  };

  const handleChangeToAmount = (amount: string) => {
    if (!amount) {
      setToAmount("");
      setFromAmount("");
      return;
    }
    const exchangeAmount = calculatedAmountByRate(toToken, fromToken, amount);
    setToAmount(amount);
    setFromAmount(exchangeAmount);
  };

  const handleChangeFromAmount = (amount: string) => {
    if (!amount) {
      setToAmount("");
      setFromAmount("");
      return;
    }
    const exchangeAmount = calculatedAmountByRate(fromToken, toToken, amount);
    setFromAmount(amount);
    setToAmount(exchangeAmount);
  };

  useEffect(() => {
    if (fromAmount) {
      handleChangeFromAmount(fromAmount);
    } else if (toAmount) {
      handleChangeToAmount(toAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, toToken]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      <h1 className="text-2xl font-bold text-pink mb-6">Swap Currency</h1>
      <div className="flex flex-col gap-2 relative">
        <CurrencyInputCpn
          label="From"
          tokens={tokens}
          amount={fromAmount}
          onSelectCurrency={setFromToken}
          selectedCurrency={fromToken}
          onAmountChange={handleChangeFromAmount}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleSwapTokens}
            className="bg-gray-700 rounded-full p-2 border-4 border-gray-900 text-white hover:bg-gray-600 hover:rotate-180 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16V4m0 12l-4-4m4 4l4-4m6 8v-12m0 12l-4-4m4 4l4-4"
              />
            </svg>
          </button>
        </div>

        <CurrencyInputCpn
          label="To"
          tokens={tokens}
          amount={toAmount}
          onSelectCurrency={setToToken}
          selectedCurrency={toToken}
          onAmountChange={handleChangeToAmount}
        />
      </div>
    </div>
  );
};

export default SwapCurrencyCpn;
