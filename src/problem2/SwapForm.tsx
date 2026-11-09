import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { formatAmount, quote } from './quote';
import { TokenPicker } from './TokenPicker';
import { usePrices } from './usePrices';

interface TokenPair {
  from: string;
  to: string;
}

type Submission =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success'; message: string };

export function SwapForm() {
  const { state: prices, retry } = usePrices();
  const [pair, setPair] = useState<TokenPair | null>(null);
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState<Submission>({ status: 'idle' });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  const tokens = prices.status === 'ready' ? prices.tokens : [];
  const from = tokens.find(token => token.currency === (pair?.from ?? 'ETH')) ?? tokens[0];
  const to = tokens.find(token => token.currency === (pair?.to ?? 'USDC') && token !== from)
    ?? tokens.find(token => token !== from);
  const busy = submission.status === 'pending';
  let received: number | null = null;
  let error = '';
  try {
    received = quote(amount, from, to);
  } catch (issue) {
    if (amount || submitted) {
      error = issue instanceof Error ? issue.message : 'Could not calculate this quote.';
    }
  }

  let priceStatus = 'Loading reference prices…';
  if (prices.status === 'error') {
    priceStatus = 'Prices are unavailable. Check your connection and try again.';
  } else if (prices.status === 'ready') {
    const newest = Math.max(...tokens.map(token => Date.parse(token.date)));
    const date = new Date(newest).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    });
    priceStatus = `Reference dataset · ${date} · not live prices`;
  }

  function changeToken(side: keyof TokenPair, currency: string) {
    if (!from || !to) return;
    const next = { from: from.currency, to: to.currency };
    const other = side === 'from' ? 'to' : 'from';
    if (currency === next[other]) next[other] = next[side];
    next[side] = currency;
    setPair(next);
    setSubmission({ status: 'idle' });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timer.current !== null || prices.status !== 'ready') return;
    setSubmitted(true);
    setSubmission({ status: 'idle' });
    if (received === null || !from || !to) return;

    const message = `Preview ready: ${formatAmount(Number(amount))} ${from.currency} → ${formatAmount(received)} ${to.currency}. No funds were moved.`;
    setSubmission({ status: 'pending' });
    timer.current = setTimeout(() => {
      timer.current = null;
      setSubmission({ status: 'success', message });
    }, 700);
  }

  return (
    <section className="swap-card" aria-labelledby="swap-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">MAKE YOUR MOVE</p>
          <h2 id="swap-title">Swap tokens</h2>
        </div>
        <span className="card-symbol" aria-hidden="true">↗</span>
      </div>
      <p id="price-status" className="price-status" role="status">{priceStatus}</p>
      <button id="retry" className="text-button" type="button" hidden={prices.status !== 'error'} onClick={retry}>
        Retry loading prices
      </button>
      <form id="swap-form" noValidate onSubmit={handleSubmit} aria-busy={busy || undefined}>
        <fieldset id="swap-fields" disabled={prices.status !== 'ready' || busy}>
          <legend className="sr-only">Swap details</legend>
          <div className="amount-panel">
            <label htmlFor="input-amount">You send</label>
            <div className="amount-row">
              <input
                id="input-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                aria-describedby="amount-error"
                aria-invalid={error ? true : undefined}
                value={amount}
                onChange={event => {
                  setAmount(event.target.value);
                  setSubmission({ status: 'idle' });
                }}
              />
              <TokenPicker
                id="from-token" iconId="from-icon" label="Send token"
                tokens={tokens} currency={from?.currency ?? ''}
                onChange={currency => changeToken('from', currency)}
              />
            </div>
            <p className="panel-hint">Amount in your selected token</p>
          </div>
          <div className="direction">
            <button
              id="reverse" type="button" aria-label="Reverse token direction"
              onClick={() => {
                if (!from || !to) return;
                setPair({ from: to.currency, to: from.currency });
                setSubmission({ status: 'idle' });
              }}
            >
              ↓↑
            </button>
          </div>
          <div className="amount-panel receive-panel">
            <label htmlFor="output-amount">You receive <span className="estimate">ESTIMATED</span></label>
            <div className="amount-row">
              <input id="output-amount" value={received === null ? '0.00' : formatAmount(received)} readOnly />
              <TokenPicker
                id="to-token" iconId="to-icon" label="Receive token"
                tokens={tokens} currency={to?.currency ?? ''}
                onChange={currency => changeToken('to', currency)}
              />
            </div>
            <p className="panel-hint">Calculated using the reference exchange rate</p>
          </div>
          <p id="amount-error" className="error" role="alert">{error}</p>
          <div className="rate-line">
            <span>Exchange rate</span>
            <strong id="exchange-rate">
              {from && to ? `1 ${from.currency} ≈ ${formatAmount(from.price / to.price)} ${to.currency}` : '—'}
            </strong>
          </div>
          <button id="confirm" className="primary-button" type="submit" disabled={busy || received === null}>
            {busy ? 'Preparing preview…' : received === null ? 'Enter an amount ↗' : 'Preview swap ↗'}
          </button>
        </fieldset>
      </form>
      <p id="swap-status" className="swap-status" role="status" aria-live="polite">
        {submission.status === 'success' ? submission.message : ''}
      </p>
      <p className="disclaimer"><span aria-hidden="true">ⓘ</span> A preview, not a real trade. No funds will move.</p>
    </section>
  );
}
