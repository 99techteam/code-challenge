import React, { useState, useEffect, useCallback, useMemo } from "react";

// Store Imports
import { useCurrencyStore } from "@stores/Currencies/currencies";

// Component Imports
import SearchableSelect from "@components/SearchableSelect";
import Toast, { ToastType } from "@components/Toast";

// Utils
import {
  normalizeAmount,
  formatAmount,
  isValidAmount,
} from "@utils/validation";
import { getTokenIconUrl } from "@utils/iconCache";

// Style Imports
import "./styles.css";

interface CurrencyOption {
  label: React.ReactNode;
  value: string;
}

const CurrencySwap: React.FC = () => {
  const {
    fromCurrency,
    toCurrency,
    amount,
    priceData,
    isLoading,
    error,
    setFromCurrency,
    setToCurrency,
    setAmount,
    fetchPriceData,
  } = useCurrencyStore();

  const [fromAmountInput, setFromAmountInput] = useState<string>(
    amount.toString(),
  );
  const [toAmountInput, setToAmountInput] = useState<string>("0");
  const [isSwapping, setIsSwapping] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [fromSelectOpen, setFromSelectOpen] = useState(false);
  const [toSelectOpen, setToSelectOpen] = useState(false);

  // Calculate exchange rate with proper validation
  const exchangeRate = useMemo(() => {
    if (!priceData || Object.keys(priceData).length === 0) return null;

    const fromPrice = priceData[fromCurrency];
    const toPrice = priceData[toCurrency];

    if (!fromPrice || !toPrice || fromPrice === 0) return null;

    return toPrice / fromPrice;
  }, [priceData, fromCurrency, toCurrency]);

  // Fetch price data on mount
  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

  // Update output amount when exchange rate or input changes
  useEffect(() => {
    if (exchangeRate !== null) {
      const inputAmount = normalizeAmount(fromAmountInput);
      if (inputAmount !== null && isValidAmount(inputAmount)) {
        const outputAmount = inputAmount * exchangeRate;
        setToAmountInput(formatAmount(outputAmount));
      }
    }
  }, [exchangeRate, fromAmountInput]);

  // Show error toast
  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" });
    }
  }, [error]);

  // Generate currency options with memoization
  const currencyOptions = useMemo((): CurrencyOption[] => {
    if (!priceData || Object.keys(priceData).length === 0) return [];

    return Object.keys(priceData)
      .sort()
      .map((currency) => ({
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            {!imageErrors.has(currency) && (
              <img
                src={getTokenIconUrl(currency)}
                alt={`${currency} logo`}
                style={{ width: "20px", height: "20px", marginRight: "8px" }}
                onError={() => {
                  setImageErrors((prev) => new Set(prev).add(currency));
                }}
              />
            )}
            {currency}
          </div>
        ),
        value: currency,
      }));
  }, [priceData, imageErrors]);

  const handleFromAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFromAmountInput(value);

      const normalizedValue = normalizeAmount(value);

      if (normalizedValue === null) {
        setToAmountInput("");
        setAmount(0);
        return;
      }

      if (!isValidAmount(normalizedValue)) {
        setToast({ message: "Invalid amount entered", type: "warning" });
        return;
      }

      setAmount(normalizedValue);

      if (exchangeRate !== null) {
        const outputAmount = normalizedValue * exchangeRate;
        setToAmountInput(formatAmount(outputAmount));
      }
    },
    [exchangeRate, setAmount],
  );

  const handleToAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setToAmountInput(value);

      const normalizedValue = normalizeAmount(value);

      if (normalizedValue === null) {
        setFromAmountInput("");
        setAmount(0);
        return;
      }

      if (!isValidAmount(normalizedValue)) {
        setToast({ message: "Invalid amount entered", type: "warning" });
        return;
      }

      if (exchangeRate !== null && exchangeRate !== 0) {
        const inputAmount = normalizedValue / exchangeRate;
        setAmount(inputAmount);
        setFromAmountInput(formatAmount(inputAmount));
      }
    },
    [exchangeRate, setAmount],
  );

  const handleSwap = useCallback(() => {
    setIsSwapping(true);

    // Simulate loading for better UX
    setTimeout(() => {
      setFromCurrency(toCurrency);
      setToCurrency(fromCurrency);

      const tempAmount = fromAmountInput;
      setFromAmountInput(toAmountInput);
      setToAmountInput(tempAmount);

      const toAmount = normalizeAmount(toAmountInput);
      if (toAmount !== null) {
        setAmount(toAmount);
      }

      setIsSwapping(false);
      setToast({ message: "Currencies swapped successfully", type: "success" });
    }, 300);
  }, [
    fromCurrency,
    toCurrency,
    fromAmountInput,
    toAmountInput,
    setFromCurrency,
    setToCurrency,
    setAmount,
  ]);

  const handleFromCurrencyChange = useCallback(
    (value: string) => {
      if (value === toCurrency) {
        setToast({
          message: "Cannot select the same currency",
          type: "warning",
        });
        return;
      }
      setFromCurrency(value);
    },
    [toCurrency, setFromCurrency],
  );

  const handleToCurrencyChange = useCallback(
    (value: string) => {
      if (value === fromCurrency) {
        setToast({
          message: "Cannot select the same currency",
          type: "warning",
        });
        return;
      }
      setToCurrency(value);
    },
    [fromCurrency, setToCurrency],
  );

  // Calculate z-index for field containers
  const getFromFieldZIndex = useCallback(() => {
    if (fromSelectOpen) return 100;
    if (toSelectOpen) return 1;
    return 10;
  }, [fromSelectOpen, toSelectOpen]);

  const getToFieldZIndex = useCallback(() => {
    if (toSelectOpen) return 100;
    if (fromSelectOpen) return 1;
    return 10;
  }, [fromSelectOpen, toSelectOpen]);

  const getFromSelectZIndex = useCallback(() => {
    if (fromSelectOpen) return 10000;
    if (toSelectOpen) return 1;
    return 100;
  }, [fromSelectOpen, toSelectOpen]);

  const getToSelectZIndex = useCallback(() => {
    if (toSelectOpen) return 10000;
    if (fromSelectOpen) return 1;
    return 100;
  }, [fromSelectOpen, toSelectOpen]);

  if (isLoading && Object.keys(priceData).length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading currency data...</p>
      </div>
    );
  }

  return (
    <div className="currency-swap-wrapper">
      <h1 className="title">
        Convert and Swap {fromCurrency} to {toCurrency}
      </h1>

      {exchangeRate !== null && (
        <p className="exchange-rate">
          1 {fromCurrency} = {formatAmount(exchangeRate, 6)} {toCurrency}
        </p>
      )}

      <div className="currency-container">
        <div
          className="field-currency from-currency"
          style={{ zIndex: getFromFieldZIndex() }}
        >
          <label htmlFor="from-amount" className="sr-only">
            From amount
          </label>
          <input
            id="from-amount"
            type="number"
            value={fromAmountInput}
            onChange={handleFromAmountChange}
            className="field-currency-input"
            placeholder="0.00"
            disabled={isLoading || isSwapping}
            aria-label="Amount to convert from"
          />
          <SearchableSelect
            value={fromCurrency}
            isClearable={false}
            onChange={handleFromCurrencyChange}
            options={currencyOptions}
            disabled={isLoading || isSwapping}
            aria-label="Select currency to convert from"
            onOpenChange={setFromSelectOpen}
            zIndex={getFromSelectZIndex()}
          />
        </div>

        <div>
          <button
            onClick={handleSwap}
            className="btn-swap"
            disabled={isLoading || isSwapping}
            aria-label="Swap currencies"
            title="Swap currencies"
          >
            <img
              width="18"
              height="18"
              src="https://img.icons8.com/ios-filled/50/swap.png"
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>

        <div
          className="field-currency to-currency"
          style={{ zIndex: getToFieldZIndex() }}
        >
          <label htmlFor="to-amount" className="sr-only">
            To amount
          </label>
          <input
            id="to-amount"
            type="number"
            value={toAmountInput}
            onChange={handleToAmountChange}
            className="field-currency-input"
            placeholder="0.00"
            disabled={isLoading || isSwapping}
            aria-label="Amount to convert to"
          />
          <SearchableSelect
            isClearable={false}
            value={toCurrency}
            onChange={handleToCurrencyChange}
            options={currencyOptions}
            disabled={isLoading || isSwapping}
            aria-label="Select currency to convert to"
            onOpenChange={setToSelectOpen}
            zIndex={getToSelectZIndex()}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default React.memo(CurrencySwap);
