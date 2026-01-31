import { ArrowUpDown, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  calculateExchangeRate,
  convertCurrency,
  getTokens,
} from "../api/token";
import type { TokenData } from "../types/currency";
import SwapInput from "./SwapInput";

const CurrencySwap = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [fromToken, setFromToken] = useState<TokenData | null>(null);
  const [toToken, setToToken] = useState<TokenData | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [swapping, setSwapping] = useState(false);
  const maxAmount = 100000;

  useEffect(() => {
    const loadTokens = async () => {
      try {
        setIsLoading(true);
        const fetchedTokens = await getTokens();
        setTokens(fetchedTokens);
        if (fetchedTokens.length >= 2) {
          setFromToken(fetchedTokens[0]);
          setToToken(fetchedTokens[1]);
        }
      } catch (err) {
        toast.error("Failed to load tokens. Please refresh the page.");
        console.error("Error loading tokens:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTokens();
  }, []);

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount) && amount > 0) {
        const converted = convertCurrency(
          amount,
          fromToken.price,
          toToken.price,
        );
        setToAmount(converted.toFixed(6));
      } else {
        setToAmount("");
      }
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    if (fromToken?.name === toToken?.name) {
      toast.error("Cannot swap the same token");
      return;
    }
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwapSubmit = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(fromAmount);
    if (amount > maxAmount) {
      toast.error(`Maximum exchange amount is ${maxAmount}`);
      return;
    }

    setSwapping(true);

    // simulating backend processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success
      const message = `Successfully swapped ${fromAmount} ${fromToken.name} to ${toAmount} ${toToken.name}`;
      toast.success(message);

      // Reset form
      setFromAmount("");
      setToAmount("");
    } catch (err) {
      toast.error("Swap failed. Please try again.");
      console.error("Error in swaping:", err);
    } finally {
      setSwapping(false);
    }
  };

  const exchangeRate =
    fromToken && toToken
      ? calculateExchangeRate(fromToken.price, toToken.price)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader className="w-10 h-10 text-blue-400" />
          </div>
          <p className=" text-lg">Loading tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#e3ef26] via-[#076653] to-[#0c342c] bg-clip-text text-transparent">
              Swap Exchange
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Easily convert between global currencies using up-to-date exchange
            rates.
          </p>
        </div>

        <div className=" bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-black/50 uppercase tracking-wider">
                  Send
                </h4>
                {fromToken && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#e3ef26]/50 text-black px-2 py-1 rounded-full">
                      1 USD = {fromToken.price.toFixed(6)} {fromToken.name}
                    </span>
                    <button
                      onClick={() => setFromAmount(maxAmount.toString())}
                      className="text-xs bg-black/10 hover:bg-black/20 text-black px-2 py-1 rounded-full transition-colors">
                      Max: {maxAmount}
                    </button>
                  </div>
                )}
              </div>
              <SwapInput
                swapToken={fromToken}
                setSwapToken={setFromToken}
                amount={fromAmount}
                onAmountChange={setFromAmount}
                label="Enter amount"
                tokens={tokens}
              />
              {fromAmount && parseFloat(fromAmount) > maxAmount && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠ Amount exceeds maximum of {maxAmount}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwapTokens}
                disabled={!fromToken || !toToken}
                className="bg-linear-to-r  from-[#e3ef26] to-[#0c342c] text-white rounded-full p-4 transition-all duration-300 hover:scale-[1.07] active:scale-95">
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-black/50 uppercase tracking-wider">
                  Receive
                </h4>
                {toToken && (
                  <span className="text-xs bg-[#0c342c]/50 text-black px-2 py-1 rounded-full">
                    1 USD = {toToken.price.toFixed(6)} {toToken.name}
                  </span>
                )}
              </div>
              <SwapInput
                swapToken={toToken}
                setSwapToken={setToToken}
                amount={toAmount}
                onAmountChange={() => {}}
                label="Converted amount"
                tokens={tokens}
                disabled
              />
            </div>
          </div>

          {!fromToken || !toToken ? (
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
              <p className="text-sm text-blue-200">
                Select both currencies to see the exchange rate
              </p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-black/5 border border-white/10 rounded-lg">
              <p className="text-xs text-black/60 uppercase tracking-wider mb-2">
                Exchange Rate
              </p>
              <p className="text-xl font-bold bg-linear-to-r from-[#e3ef26] to-[#0c342c] bg-clip-text text-transparent">
                1 {fromToken.name} = {exchangeRate.toFixed(6)} {toToken.name}
              </p>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwapSubmit}
          disabled={
            !fromToken ||
            !toToken ||
            !fromAmount ||
            swapping ||
            fromToken?.name === toToken?.name ||
            parseFloat(fromAmount) > maxAmount
          }
          className="w-full mt-6 bg-linear-to-r from-[#e3ef26] via-[#076653] to-[#0c342c]  disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
          {swapping ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Swap Now</span>
          )}
        </button>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>✓ Real-time exchange rates</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencySwap;
