import { useSwapForm } from "../hooks/useSwapForm";
import { formatAmount } from "../utils/format";
import { TokenSelect } from "./TokenSelect";

export function SwapForm() {
  const {
    status,
    currencies,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    rate,
    error,
    canSubmit,
    submitting,
    successMessage,
    handleSwapDirection,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleAmountChange,
    handleSubmit,
  } = useSwapForm();

  return (
    <form className="swap-card" onSubmit={handleSubmit}>
      <h1 className="swap-card__title">Swap</h1>

      {status === "loading" && (
        <p className="swap-card__status">Loading token prices…</p>
      )}
      {status === "error" && (
        <p className="swap-card__status swap-card__status--error">
          Couldn't load token prices. Please try again later.
        </p>
      )}

      <div className="swap-field">
        <div className="swap-field__row">
          <input
            id="input-amount"
            className="swap-field__input"
            inputMode="decimal"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={status !== "ready"}
            aria-label="Amount to send"
          />
          <TokenSelect
            label="From"
            currencies={currencies}
            value={fromCurrency}
            onChange={handleFromCurrencyChange}
            disabledCurrency={toCurrency}
          />
        </div>
      </div>

      <button
        type="button"
        className="swap-flip"
        onClick={handleSwapDirection}
        disabled={status !== "ready"}
        aria-label="Reverse swap direction"
      >
        ⇅
      </button>

      <div className="swap-field">
        <div className="swap-field__row">
          <input
            id="output-amount"
            className="swap-field__input"
            value={toAmount !== null ? formatAmount(toAmount) : ""}
            placeholder="0.0"
            readOnly
            aria-label="Amount to receive"
          />
          <TokenSelect
            label="To"
            currencies={currencies}
            value={toCurrency}
            onChange={handleToCurrencyChange}
            disabledCurrency={fromCurrency}
          />
        </div>
      </div>

      {error && <p className="swap-card__error">{error}</p>}

      {rate !== null && fromCurrency !== toCurrency && (
        <p className="swap-card__rate">
          1 {fromCurrency} ≈ {formatAmount(rate)} {toCurrency}
        </p>
      )}

      <button type="submit" className="swap-submit" disabled={!canSubmit}>
        {submitting ? (
          <span className="swap-submit__spinner" aria-hidden="true" />
        ) : (
          "CONFIRM SWAP"
        )}
      </button>

      {successMessage && (
        <p className="swap-card__success" role="status">
          {successMessage}
        </p>
      )}
    </form>
  );
}
