import { useState, useCallback, useEffect } from 'react';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { TokenSelector } from './TokenSelector';
import { ResultModal, type SwapSummary } from './ResultModal';
import { validateForm, parseAmount } from '../utils/validation';
import { convertAmount, formatDisplayAmount, getRateLabel, formatRelativeTime } from '../utils/format';
import { simulateSwapRequest } from '../utils/api';

const MOCK_BALANCE = 1000;

export const SwapForm = () => {
  const { priceMap, tokens, loading, error, lastUpdated, retry } = useTokenPrices();

  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [formTouched, setFormTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string;
    summary?: SwapSummary | null;
  }>({ isOpen: false, success: false, message: '' });

  const convertedAmount = useCallback(() => {
    const numAmount = parseAmount(amount);
    if (!fromToken || !toToken || numAmount === null || numAmount < 0) return '';
    const fromData = priceMap.get(fromToken);
    const toData = priceMap.get(toToken);
    if (!fromData || !toData) return '';
    const converted = convertAmount(numAmount, fromData.price, toData.price);
    return formatDisplayAmount(converted);
  }, [amount, fromToken, toToken, priceMap]);

  const rateLabel = useCallback(() => {
    if (!fromToken || !toToken) return '';
    const fromData = priceMap.get(fromToken);
    const toData = priceMap.get(toToken);
    if (!fromData || !toData) return '';
    return getRateLabel(fromToken, toToken, fromData.price, toData.price);
  }, [fromToken, toToken, priceMap]);

  const { valid, errors } = validateForm(amount, fromToken, toToken);
  const showErrors = formTouched;

  useEffect(() => {
    if (tokens.length >= 2 && !fromToken && !toToken) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
  }, [tokens, fromToken, toToken]);

  const handleSwapDirection = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleCloseModal = () => {
    setModal((m) => ({ ...m, isOpen: false }));
    setAmount('');
    if (tokens.length >= 2) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
    setFormTouched(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true);
    if (!valid) return;

    setIsSubmitting(true);
    const fromData = priceMap.get(fromToken);
    const toData = priceMap.get(toToken);
    const rate = fromData && toData ? getRateLabel(fromToken, toToken, fromData.price, toData.price) : undefined;

    try {
      await simulateSwapRequest();
      const converted = convertedAmount();
      setModal({
        isOpen: true,
        success: true,
        message: `You will receive ${converted} ${toToken}`,
        summary: {
          fromAmount: amount.trim(),
          fromToken,
          toAmount: converted,
          toToken,
          rate,
        },
      });
    } catch (err) {
      setModal({
        isOpen: true,
        success: false,
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setFormTouched(true);
  };

  const handleMaxClick = () => {
    setAmount(String(MOCK_BALANCE));
    setFormTouched(true);
  };

  if (loading) {
    return (
      <div className="swap-form swap-form--skeleton" aria-busy="true">
        <div className="skeleton-row" />
        <div className="skeleton-swap-btn" />
        <div className="skeleton-row" />
        <div className="skeleton-btn" />
        <p className="status-message" role="status">
          Loading token prices...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="swap-form-error">
        <p className="status-message error" role="alert">
          {error}
        </p>
        <button type="button" className="retry-btn" onClick={retry} aria-label="Retry loading prices">
          Try again
        </button>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <p className="status-message error" role="alert">
        No tokens available.
      </p>
    );
  }

  return (
    <>
      <form className="swap-form" onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <div className="token-row-header">
            <label htmlFor="input-amount" className="visually-hidden">
              Amount to send
            </label>
            <button
              type="button"
              className="max-btn"
              onClick={handleMaxClick}
              aria-label="Set maximum amount"
            >
              Max
            </button>
          </div>
          <div className="token-row">
            <TokenSelector
              tokens={tokens}
              value={fromToken}
              onChange={setFromToken}
              ariaLabel="Select token to swap from"
              priceMap={priceMap}
            />
            <div className="amount-wrapper">
              <input
                id="input-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.0"
                value={amount}
                onChange={handleAmountChange}
                aria-label="Amount to send"
                aria-invalid={!!errors.amount}
                aria-describedby="amount-error"
              />
            </div>
          </div>
          {showErrors && errors.amount && (
            <p id="amount-error" className="error-message" role="alert">
              {errors.amount}
            </p>
          )}
        </div>

        <div className="swap-direction">
          <button
            type="button"
            className="swap-direction-btn"
            onClick={handleSwapDirection}
            aria-label="Swap from and to tokens"
            tabIndex={0}
          >
            <svg
              className="swap-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="input-group">
          <label htmlFor="output-amount" className="visually-hidden">
            Amount to receive
          </label>
          <div className="token-row">
            <TokenSelector
              tokens={tokens}
              value={toToken}
              onChange={setToToken}
              ariaLabel="Select token to receive"
              priceMap={priceMap}
            />
            <div className="amount-wrapper">
              <input
                id="output-amount"
                type="text"
                readOnly
                placeholder="0.0"
                value={convertedAmount()}
                aria-label="Estimated amount to receive"
                tabIndex={-1}
              />
            </div>
          </div>
          {showErrors && errors.tokens && (
            <p id="to-token-error" className="error-message" role="alert">
              {errors.tokens}
            </p>
          )}
        </div>

        {rateLabel() && (
          <p className="swap-rate" role="status">
            {rateLabel()}
          </p>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={!valid}
          aria-busy={isSubmitting}
          aria-label="Confirm swap"
        >
          <span className="btn-text">Confirm Swap</span>
          <span className="btn-loading" aria-hidden="true">
            <span className="spinner" aria-hidden="true" />
            Swapping...
          </span>
        </button>
      </form>

      <ResultModal
        isOpen={modal.isOpen}
        success={modal.success}
        message={modal.message}
        summary={modal.summary}
        onClose={handleCloseModal}
      />

      {lastUpdated && (
        <p className="swap-footer-meta" role="status">
          {formatRelativeTime(lastUpdated)}
        </p>
      )}
    </>
  );
};
