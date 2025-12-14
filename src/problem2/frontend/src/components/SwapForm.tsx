import { useState, useEffect } from "react";
import {
  tokens,
  Token,
  calculateExchangeRate,
  convertAmount,
} from "../data/tokens";
import TokenSelector from "./TokenSelector";
import SwapButton from "./SwapButton";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const SwapForm = () => {
  // Default tokens
  const [fromToken, setFromToken] = useState<Token>(
    tokens.find((t) => t.currency === "USD") || tokens[0]
  );
  const [toToken, setToToken] = useState<Token>(
    tokens.find((t) => t.currency === "ETH") || tokens[1]
  );
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isFromFocused, setIsFromFocused] = useState<boolean>(true);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  // Fetch user balances
  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const data = await authAPI.getBalances();
      const balancesMap: Record<string, number> = {};
      data.tokenBalances.forEach((b) => {
        balancesMap[b.symbol] = b.amount;
      });
      setUserBalances(balancesMap);
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  const userBalance = userBalances[fromToken.symbol] || 0;

  // Calculate exchange rate
  const exchangeRate = calculateExchangeRate(fromToken, toToken);

  // Update amounts when tokens change
  useEffect(() => {
    if (isFromFocused && fromAmount !== "") {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount)) {
        const converted = convertAmount(amount, fromToken, toToken);
        setToAmount(converted.toFixed(6));
      }
    } else if (!isFromFocused && toAmount !== "") {
      const amount = parseFloat(toAmount);
      if (!isNaN(amount)) {
        const converted = convertAmount(amount, toToken, fromToken);
        setFromAmount(converted.toFixed(6));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, toToken]);

  // Handle from amount change
  const handleFromAmountChange = (value: string) => {
    setIsFromFocused(true);
    setError("");

    // Allow empty string
    if (value === "") {
      setFromAmount("");
      setToAmount("");
      return;
    }

    // Validate numeric input
    if (!/^\d*\.?\d*$/.test(value)) {
      setError("Please enter a valid number");
      return;
    }

    setFromAmount(value);

    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      // Check balance
      if (amount > userBalance) {
        setError(
          `Insufficient balance. Maximum: ${userBalance} ${fromToken.symbol}`
        );
      }

      // Calculate converted amount
      const converted = convertAmount(amount, fromToken, toToken);
      setToAmount(converted.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  // Handle to amount change
  const handleToAmountChange = (value: string) => {
    setIsFromFocused(false);
    setError("");

    // Allow empty string
    if (value === "") {
      setToAmount("");
      setFromAmount("");
      return;
    }

    // Validate numeric input
    if (!/^\d*\.?\d*$/.test(value)) {
      setError("Please enter a valid number");
      return;
    }

    setToAmount(value);

    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      // Calculate converted amount
      const converted = convertAmount(amount, toToken, fromToken);
      setFromAmount(converted.toFixed(6));

      // Check balance
      if (converted > userBalance) {
        setError(
          `Insufficient balance. Maximum: ${userBalance} ${fromToken.symbol}`
        );
      }
    } else {
      setFromAmount("");
    }
  };

  const handleReverse = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Handle swap
  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setError("Please enter an amount to swap");
      return;
    }

    if (parseFloat(fromAmount) > userBalance) {
      setError(
        `Insufficient balance. Maximum: ${userBalance} ${fromToken.symbol}`
      );
      return;
    }

    setIsSwapping(true);
    setError("");
    setSuccess("");

    try {
      const response = await authAPI.swap({
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        amount: parseFloat(fromAmount),
      });

      // Show success message
      setSuccess(
        `Swap successful! ${response.swap.from.amount} ${
          response.swap.from.symbol
        } → ${response.swap.to.amount.toFixed(6)} ${response.swap.to.symbol}`
      );

      // Refresh balances
      await fetchBalances();

      // Clear form
      setFromAmount("");
      setToAmount("");

      // Navigate to balances page after 2 seconds
      setTimeout(() => {
        navigate("/balances");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Swap failed. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-0">
      <div className="bg-crypto-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-crypto-lg border border-crypto-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Swap</h2>
          <button
            onClick={() =>
              setSlippageTolerance(slippageTolerance === 0.5 ? 1.0 : 0.5)
            }
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-crypto-darker border border-crypto-cardHover hover:border-crypto-accent transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs sm:text-sm text-gray-400">
              {slippageTolerance}%
            </span>
          </button>
        </div>

        {/* From Section */}
        <div className="mb-1">
          <div className="bg-crypto-darker rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-crypto-cardHover hover:border-crypto-accent transition-colors">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs sm:text-sm text-gray-400">
                You Pay
              </label>
              <span className="text-xs sm:text-sm text-gray-400">
                Balance: {userBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 justify-between">
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl sm:text-3xl font-semibold text-white outline-none placeholder-gray-600"
              />
              <div className="">
                <TokenSelector
                  selectedToken={fromToken}
                  onSelect={setFromToken}
                  excludeToken={toToken}
                />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
              {fromAmount && !isNaN(parseFloat(fromAmount))
                ? `≈ $${(parseFloat(fromAmount) * fromToken.price).toFixed(
                    2
                  )} USD`
                : "$0.00 USD"}
            </div>
          </div>
        </div>

        {/* Reverse Button */}
        <div className="flex justify-center relative z-10 mb-1">
          <button
            onClick={handleReverse}
            className="p-1.5 sm:p-2 rounded-xl bg-crypto-card border-2 sm:border-4 border-crypto-dark hover:bg-crypto-cardHover transition-all duration-300 group"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-crypto-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* To Section */}
        <div className="mb-2 sm:mb-3">
          <div className="bg-crypto-darker rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-crypto-cardHover hover:border-crypto-accent transition-colors">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs sm:text-sm text-gray-400">
                You Receive
              </label>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 justify-between">
              <input
                type="text"
                value={toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl sm:text-3xl font-semibold text-white outline-none placeholder-gray-600"
              />
              <TokenSelector
                selectedToken={toToken}
                onSelect={setToToken}
                excludeToken={fromToken}
              />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
              {toAmount && !isNaN(parseFloat(toAmount))
                ? `≈ $${(parseFloat(toAmount) * toToken.price).toFixed(2)} USD`
                : "$0.00 USD"}
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {fromAmount && toAmount && (
          <div className="mb-2 sm:mb-3 p-2.5 sm:p-3 bg-crypto-darker rounded-lg sm:rounded-xl border border-crypto-cardHover">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Rate</span>
              <span className="text-xs sm:text-sm font-semibold text-white">
                1 {fromToken.symbol} = {exchangeRate.toFixed(6)}{" "}
                {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-400">
                Slippage Tolerance
              </span>
              <span className="text-xs sm:text-sm text-white">
                {slippageTolerance}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-400">
                Network Fee
              </span>
              <span className="text-xs sm:text-sm text-white">~$0.50</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 bg-crypto-success/10 border border-crypto-success/30 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-crypto-success flex items-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 bg-crypto-error/10 border border-crypto-error/30 rounded-lg sm:rounded-xl">
            <p className="text-xs sm:text-sm text-crypto-error flex items-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Swap Button */}
        <SwapButton
          onClick={handleSwap}
          disabled={
            !fromAmount || parseFloat(fromAmount) === 0 || !!error || isSwapping
          }
          fromToken={fromToken}
          toToken={toToken}
        />
      </div>
    </div>
  );
};

export default SwapForm;
