import React from "react";
import { TokenSelect } from "./TokenSelect";

export function SwapCard({
  title = "Swap",
  tokens = [],
  tokensLoading,
  tokensError,
  onRetry,
  fromToken,
  toToken,
  fromAmountRaw,
  fromAmountError,
  toAmount,
  exchangeRate,
  submitState,
  canSubmit,
  sameTokenError,
  onFromTokenSelect,
  onToTokenSelect,
  onFromAmountChange,
  onSwapDirection,
  onSubmit,
}) {
  return (
    <div className="swap-card">
      <h1 className="swap-title">{title}</h1>

      {tokensError && (
        <div className="swap-message swap-message-error" role="alert">
          {tokensError}
          <button type="button" className="swap-retry" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {tokensLoading && (
        <div className="swap-loading">Loading tokens…</div>
      )}

      {!tokensLoading && (
        <form onSubmit={onSubmit} noValidate>
          <div className="swap-field">
            <TokenSelect
              label="From"
              tokens={tokens}
              selectedToken={fromToken}
              onSelect={onFromTokenSelect}
              disabled={tokensLoading}
            />
            <label htmlFor="swap-from-amount" className="swap-amount-label">
              Amount to send
            </label>
            <input
              id="swap-from-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={fromAmountRaw}
              onChange={(e) => onFromAmountChange(e.target.value)}
              className={fromAmountError ? "swap-input swap-input-error" : "swap-input"}
              aria-invalid={!!fromAmountError}
              aria-describedby={fromAmountError ? "from-amount-error" : undefined}
              disabled={tokensLoading}
            />
            {fromAmountError && (
              <span id="from-amount-error" className="swap-field-error" role="alert">
                {fromAmountError}
              </span>
            )}
          </div>

          <button
            type="button"
            className="swap-flip"
            onClick={onSwapDirection}
            disabled={!fromToken || !toToken || tokensLoading}
            aria-label="Swap from and to"
          >
            ⇅
          </button>

          <div className="swap-field">
            <TokenSelect
              label="To"
              tokens={tokens}
              selectedToken={toToken}
              onSelect={onToTokenSelect}
              disabled={tokensLoading}
            />
            <label htmlFor="swap-to-amount" className="swap-amount-label">
              Amount to receive
            </label>
            <input
              id="swap-to-amount"
              type="text"
              readOnly
              placeholder="0.0"
              value={toAmount > 0 ? toAmount.toFixed(6) : ""}
              className="swap-input swap-input-readonly"
              aria-readonly="true"
              disabled
            />
            {exchangeRate != null && fromToken && toToken && (
              <p className="swap-rate" aria-live="polite">
                1 {fromToken.currency} ≈ {exchangeRate.toFixed(6)} {toToken.currency}
              </p>
            )}
          </div>

          {sameTokenError && (
            <p className="swap-field-error" role="alert">
              Select different tokens for from and to.
            </p>
          )}

          <button
            type="submit"
            className="swap-submit"
            disabled={!canSubmit}
            aria-busy={submitState === "loading"}
          >
            {submitState === "loading" && <span className="swap-spinner" aria-hidden />}
            {submitState === "loading"
              ? "Swapping…"
              : submitState === "success"
                ? "Swap successful"
                : "Confirm swap"}
          </button>
        </form>
      )}
    </div>
  );
}
