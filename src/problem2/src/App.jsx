import { useTokenSwap } from './hooks/useTokenSwap'
import { TokenSelector } from './components/TokenSelector'
import { AmountInput } from './components/AmountInput'
import {
  PREFERRED_FROM_TOKEN,
  PREFERRED_TO_TOKEN,
  SUBMIT_DELAY_MS,
} from './constants'
import './App.css'

function App() {
  const {
    tokens,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    exchangeRate,
    loadingPrices,
    priceError,
    fieldError,
    isSubmitting,
    submitSuccess,
    setFromToken,
    setToToken,
    setFromAmount,
    swapDirection,
    submit,
  } = useTokenSwap({
    preferredFrom: PREFERRED_FROM_TOKEN,
    preferredTo: PREFERRED_TO_TOKEN,
    submitDelayMs: SUBMIT_DELAY_MS,
  })

  if (loadingPrices) {
    return (
      <div className="app app--loading">
        <div className="loader" />
        <p>Loading tokens and prices…</p>
      </div>
    )
  }

  if (priceError) {
    return (
      <div className="app app--error">
        <div className="error-card">
          <span className="error-icon" aria-hidden>!</span>
          <h2>Cannot load prices</h2>
          <p>{priceError}</p>
        </div>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="app app--error">
        <div className="error-card">
          <p>No tokens with prices available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="swap-card">
        <header className="swap-header">
          <h1>Swap</h1>
          <p className="swap-subtitle">Exchange one asset for another</p>
        </header>

        <form onSubmit={submit} className="swap-form" noValidate>
          <div className="input-group">
            <label className="input-label">You pay</label>
            <div className="input-row">
              <AmountInput
                value={fromAmount}
                onChange={setFromAmount}
                placeholder="0.0"
                error={fieldError.from}
                disabled={!fromToken}
              />
              <TokenSelector
                tokens={tokens}
                value={fromToken}
                onChange={setFromToken}
                disabled={!tokens.length}
              />
            </div>
            {fieldError.from && (
              <p className="field-error" role="alert">{fieldError.from}</p>
            )}
          </div>

          <div className="swap-divider">
            <button
              type="button"
              className="swap-flip"
              onClick={swapDirection}
              aria-label="Swap direction"
              title="Swap direction"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                <path d="M17 8v12M17 20l4-4M17 20l-4-4" />
              </svg>
            </button>
            {exchangeRate != null && (
              <p className="rate-text">
                1 {fromToken} ≈ {exchangeRate < 0.0001 ? exchangeRate.toExponential(2) : exchangeRate.toFixed(6)} {toToken}
              </p>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">You receive</label>
            <div className="input-row">
              <AmountInput
                value={toAmount}
                readOnly
                placeholder="0.0"
                error={fieldError.to}
                disabled
              />
              <TokenSelector
                tokens={tokens}
                value={toToken}
                onChange={setToToken}
                disabled={!tokens.length}
              />
            </div>
            {fieldError.to && (
              <p className="field-error" role="alert">{fieldError.to}</p>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="submit-spinner" aria-hidden />
                Swapping…
              </>
            ) : submitSuccess ? (
              'Swap again'
            ) : (
              'Swap'
            )}
          </button>

          {submitSuccess && (
            <p className="success-msg" role="status">
              Swap complete.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default App
