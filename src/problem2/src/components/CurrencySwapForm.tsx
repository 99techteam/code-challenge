import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import CurrencyInput from "./CurrencyInput";
import { TokenPrices } from "../services/api";
import {
  calculateExchangeAmount,
  formatTokenAmount,
} from "../utils/currencyUtils";
import { SingleValue } from "react-select";

import { TokenDropdownOption } from "./CurrencySwapContainer";
import SwapButton from "./SwapButton";
import ErrorMessage from "./ErrorMessage";

type CurrencySwapFormProps = {
  tokens: TokenPrices;
  isLoading: boolean;
  fetchTokenError: string;
  tokenDropdownOptions: TokenDropdownOption[];
};

const CurrencySwapForm: React.FC<CurrencySwapFormProps> = ({
  tokens,
  isLoading,
  fetchTokenError,
  tokenDropdownOptions,
}) => {
  const [fromCurrency, setFromCurrency] = useState<string>("SWTH");
  const [toCurrency, setToCurrency] = useState<string>("USDC");
  const [amount, setAmount] = useState<string>("");
  const [exchangeAmount, setExchangeAmount] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState<string>("");

  useEffect(() => {
    setExchangeAmount("");
    setExchangeRateError("");

    if (!tokens || !fromCurrency || !toCurrency) {
      return;
    }

    const fromToken = tokens.find((token) => token.currency === fromCurrency);
    const toToken = tokens.find((token) => token.currency === toCurrency);

    if (!fromToken || !toToken) {
      setExchangeRateError("Selected currency not found.");
      return;
    }

    if (fromToken.price === undefined || toToken.price === undefined) {
      setExchangeRateError(
        "Price not available for one or both selected currencies."
      );
      return;
    }

    if (amount) {
      const exAmount = calculateExchangeAmount(
        parseFloat(amount),
        fromToken.price,
        toToken.price
      );
      setExchangeAmount(formatTokenAmount(exAmount));
    }
  }, [fromCurrency, toCurrency, tokens, amount]);

  const handleFromCurrencyChange = (
    selectedOption: SingleValue<{ value: string; label: React.ReactNode }>
  ) => {
    if (selectedOption) {
      setFromCurrency(selectedOption.value);
      setIsSwapped(false);
    }
  };

  const handleToCurrencyChange = (
    selectedOption: SingleValue<{ value: string; label: React.ReactNode }>
  ) => {
    if (selectedOption) {
      setToCurrency(selectedOption.value);
      setIsSwapped(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputAmount = e.target.value;
    setAmountError("");
    if (/^$|^(0|[1-9]\d*)(\.\d{0,18})?$/.test(inputAmount)) {
      setAmount(inputAmount);
    } else {
      setAmountError("Invalid Number");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      setAmountError("Please enter an amount.");
      return;
    }
    if (!fromCurrency || !toCurrency) {
      setAmountError("Please select both currencies.");
      return;
    }
    if (exchangeRateError) {
      setAmountError(exchangeRateError);
      return;
    }

    // Display notification
    toast.success(
      `Swapped ${amount} ${fromCurrency} for ${exchangeAmount} ${toCurrency}!`,
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );

    resetForm();
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setIsSwapped(!isSwapped);
  };

  const resetForm = () => {
    setFromCurrency("SWTH");
    setToCurrency("USDC");
    setAmount("");
    setExchangeAmount("");
    setAmountError("");
    setIsSwapped(false);
  };

  const isButtonConfirmSwapDisabled =
    !amount || !!amountError || !!exchangeRateError || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
      <CurrencyInput
        label="Amount to send"
        options={tokenDropdownOptions}
        selectedCurrency={fromCurrency}
        onCurrencyChange={handleFromCurrencyChange}
        amount={amount}
        onAmountChange={handleAmountChange}
        error={amountError}
        id="from-currency"
      />
      <div className="flex justify-center my-2 sm:my-4">
        <SwapButton onClick={handleSwapCurrencies} isSwapped={isSwapped} />
      </div>

      <CurrencyInput
        label="Amount to receive"
        options={tokenDropdownOptions}
        selectedCurrency={toCurrency}
        onCurrencyChange={handleToCurrencyChange}
        amount={exchangeAmount}
        onAmountChange={() => {}}
        disabledInput={true}
        id="to-currency"
      />
      {isLoading && <div className="text-gray-400 text-sm">Loading...</div>}
      {exchangeRateError && !isLoading && (
        <ErrorMessage error={exchangeRateError} />
      )}
      {fetchTokenError && !isLoading && (
        <ErrorMessage error={fetchTokenError} />
      )}
      <button
        type="submit"
        className={`w-full py-2 sm:py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          !amount || amountError || exchangeRateError || isLoading
            ? "bg-gray-600 cursor-not-allowed"
            : ""
        }`}
        disabled={isButtonConfirmSwapDisabled}
      >
        CONFIRM SWAP
      </button>
    </form>
  );
};

export default CurrencySwapForm;
