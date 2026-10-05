import { useState } from 'react';
import {
  ArrowDown,
  RefreshCw,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  FlaskConical,
  Info,
  Zap,
  LoaderCircle,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react';
import { useTokenPrices, PRICE_URL } from './prices';
import {
  Amount,
  formatAmount,
  getQuote,
  usd,
  validateAmount,
  validatePair,
} from './swap';
import TokenAmountField from './components/TokenAmountField';
import TokenPicker from './components/TokenPicker';
import TokenIcon from './components/TokenIcon';
import Modal from './components/Modal';

export default function App() {
  const prices = useTokenPrices();
  const [fromSymbol, setFromSymbol] = useState('ETH');
  const [toSymbol, setToSymbol] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [picker, setPicker] = useState<'pay' | 'receive' | null>(null);
  const [review, setReview] = useState<'review' | 'success' | null>(null);
  const defaultFrom =
    prices.tokens.find((token) => token.currency === 'ETH') || prices.tokens[0];
  const defaultTo =
    prices.tokens.find((token) => token.currency === 'USDC') ||
    prices.tokens.find((token) => token.currency !== defaultFrom?.currency);
  const from =
    prices.tokens.find((token) => token.currency === fromSymbol) || defaultFrom;
  const to =
    prices.tokens.find((token) => token.currency === toSymbol) || defaultTo;
  const amountError = validateAmount(amount);
  const pairError = validatePair(from, to);
  const quote = !pairError ? getQuote(amount, from, to) : null;
  const rate =
    from && to && !pairError ? new Amount(from.price).div(to.price) : null;
  const fiat =
    quote && from ? usd(new Amount(amount).mul(from.price)) : '$0.00';
  const ready = prices.status === 'ready';
  const canReview = ready && !!quote;
  const buttonLabel =
    prices.status === 'loading'
      ? 'Loading prices'
      : prices.status === 'error'
        ? 'Prices unavailable'
        : pairError
          ? 'Choose different tokens'
          : amountError
            ? 'Check your amount'
            : !amount
              ? 'Enter an amount'
              : 'Review swap';

  function reverse() {
    if (!from || !to) return;
    setFromSymbol(to.currency);
    setToSymbol(from.currency);
  }

  return (
    <>
      <main>
        <section className="workspace" aria-labelledby="page-title">
          <div className="swap-shell">
            <div className="swap-heading">
              <h1 id="page-title">Swap</h1>
              <span className="reference-tag">
                Reference price
                <span
                  className="info-tip"
                  tabIndex={0}
                  aria-label="Prices provided by the interview API."
                >
                  <Info size={14} />
                  <span role="tooltip">
                    Prices provided by the interview API.
                  </span>
                </span>
              </span>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (canReview) setReview('review');
              }}
              noValidate
            >
              {prices.status === 'error' && (
                <div className="error-notice" role="alert">
                  <TriangleAlert size={18} />
                  <span>{prices.message}</span>
                  <button type="button" onClick={prices.retry}>
                    <RotateCcw size={14} />
                    Retry
                  </button>
                </div>
              )}
              {prices.status === 'loading' && (
                <div className="loading-notice" role="status">
                  <LoaderCircle size={15} className="spin" />
                  Getting reference prices...
                </div>
              )}
              <TokenAmountField
                side="pay"
                loading={prices.status === 'loading'}
                token={from}
                value={amount}
                fiat={fiat}
                disabled={!ready}
                invalid={!!amountError}
                onChange={setAmount}
                onSelect={() => setPicker('pay')}
              />
              <div className="direction-row">
                <button
                  type="button"
                  className="reverse-button"
                  aria-label="Reverse swap direction"
                  title="Reverse swap direction"
                  disabled={!ready}
                  onClick={reverse}
                >
                  <RefreshCw size={24} />
                </button>
              </div>
              <TokenAmountField
                side="receive"
                loading={prices.status === 'loading'}
                token={to}
                value={quote ? formatAmount(quote) : ''}
                fiat={fiat}
                disabled={!ready}
                invalid={!!pairError}
                onSelect={() => setPicker('receive')}
              />
              <div
                id="amount-error"
                className="validation-message"
                aria-live="polite"
              >
                {(amountError || pairError) && (
                  <>
                    <TriangleAlert size={14} />
                    <span>{amountError || pairError}</span>
                  </>
                )}
              </div>

              <div className="quote-details">
                <div className="rate-row">
                  <span className="sr-only">Exchange rate</span>
                  <strong>
                    {rate && from && to
                      ? `1 ${from.currency} ≈ ${formatAmount(rate)} ${to.currency}`
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span className="sr-only">Demo service fee</span>
                  <strong className="fee" title="Demo service fee: $0.00">
                    <Zap size={20} fill="currentColor" />
                    $0.00
                  </strong>
                </div>
              </div>
              <button
                className="primary-button"
                type="submit"
                disabled={!canReview}
              >
                <span>{buttonLabel}</span>
                {prices.status === 'loading' ? (
                  <LoaderCircle size={20} className="spin" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
              <div className="form-note">
                <FlaskConical size={14} />
                <span>Demo only. No real funds involved.</span>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <span className="footer-brand">flux.</span>
        <a href={PRICE_URL} target="_blank" rel="noreferrer">
          Price data by Switcheo
          <ArrowUpRight size={14} />
        </a>
      </footer>

      {picker && (
        <TokenPicker
          tokens={prices.tokens}
          selected={picker === 'pay' ? from?.currency : to?.currency}
          onClose={() => setPicker(null)}
          onSelect={(symbol) => {
            if (picker === 'pay') setFromSymbol(symbol);
            else setToSymbol(symbol);
            setPicker(null);
          }}
        />
      )}
      {review && from && to && quote && (
        <Modal
          title={review === 'success' ? 'Demo swap complete' : 'Review swap'}
          onClose={() => setReview(null)}
        >
          {review === 'success' && (
            <div className="success-symbol">
              <CheckCheck size={32} />
            </div>
          )}
          <div className="review-amount">
            <TokenIcon symbol={from.currency} size={36} />
            <div>
              <span>You pay</span>
              <strong>
                {new Amount(amount).toFixed()} {from.currency}
              </strong>
            </div>
          </div>
          <div className="review-arrow">
            <ArrowDown size={18} />
          </div>
          <div className="review-amount">
            <TokenIcon symbol={to.currency} size={36} />
            <div>
              <span>You receive</span>
              <strong>
                {formatAmount(quote)} {to.currency}
              </strong>
            </div>
          </div>
          <div className="review-total">
            <span>Reference value</span>
            <strong>{fiat}</strong>
          </div>
          <p className="review-note">
            {review === 'success'
              ? 'All done. This was a simulation; no funds were moved.'
              : 'A simulated exchange at the reference rate. No wallet, network fees or real transaction.'}
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              review === 'success' ? setReview(null) : setReview('success')
            }
          >
            <span>{review === 'success' ? 'Done' : 'Confirm demo swap'}</span>
            {review === 'success' ? (
              <Check size={19} />
            ) : (
              <ArrowRight size={19} />
            )}
          </button>
        </Modal>
      )}
    </>
  );
}
