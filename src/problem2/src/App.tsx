import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { formatAmount, normalizePrices, parseAmount, quote, type TokenPrice } from './pricing';

// The interview endpoint does not advertise browser CORS access. Bundle its public
// reference snapshot so the static app works without a proxy or live service.
const PRICE_URL = `${import.meta.env.BASE_URL}prices.json`;
const iconUrl = (currency: string) => `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(currency)}.svg`;

function TokenIcon({ currency }: { currency: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [currency]);
  return <span className="token-icon" aria-hidden="true">
    {!failed && <img src={iconUrl(currency)} alt="" onError={() => setFailed(true)} />}
    <span className="token-fallback">{currency.slice(0, 2).toUpperCase()}</span>
  </span>;
}

function CurrencyPicker({ label, value, tokens, excluded, onChange }: {
  label: string; value: string; tokens: TokenPrice[]; excluded: string; onChange: (value: string) => void;
}) {
  return <div className="currency-picker">
    <TokenIcon currency={value} />
    <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>
      {tokens.filter(token => token.currency !== excluded).map(token =>
        <option key={token.currency} value={token.currency}>{token.currency}</option>)}
    </select>
    <span className="chevron" aria-hidden="true">⌄</span>
  </div>;
}

export default function App() {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [reload, setReload] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('1');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFeedError('');
    fetch(PRICE_URL, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Price feed unavailable (${response.status}).`);
        return response.json();
      })
      .then(data => {
        const priced = normalizePrices(data);
        setTokens(priced);
        const source = priced.some(item => item.currency === 'ETH') ? 'ETH' : priced[0].currency;
        setFrom(source);
        setTo(priced.some(item => item.currency === 'USD' && source !== 'USD') ? 'USD' : priced.find(item => item.currency !== source)!.currency);
      })
      .catch(error => { if (!controller.signal.aborted) setFeedError(error instanceof Error ? error.message : 'Could not load prices.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  const fromToken = useMemo(() => tokens.find(token => token.currency === from), [tokens, from]);
  const toToken = useMemo(() => tokens.find(token => token.currency === to), [tokens, to]);
  const parsed = parseAmount(amount);
  const result = parsed !== null && fromToken && toToken && from !== to ? quote(parsed, fromToken, toToken) : null;
  const invalid = touched && parsed === null;
  const snapshot = fromToken && toToken ? new Date(Math.min(Date.parse(fromToken.date), Date.parse(toToken.date))) : null;

  function changeCurrency(side: 'from' | 'to', currency: string) {
    if (side === 'from') setFrom(currency); else setTo(currency);
    setNotice('');
  }
  function reverse() {
    setFrom(to);
    setTo(from);
    setNotice('');
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setNotice('');
    if (result === null || !Number.isFinite(result) || result <= 0 || submitting) return;
    setSubmitting(true);
    await new Promise(resolve => window.setTimeout(resolve, 750));
    setSubmitting(false);
    setNotice(`Preview complete: ${formatAmount(parsed!)} ${from} would convert to approximately ${formatAmount(result)} ${to}. No assets were exchanged.`);
  }

  return <div className="app-shell">
    <header className="site-header">
      <div className="brand"><span className="brand-mark">✦</span><span>atlas<span className="brand-light">swap</span></span></div>
      <span className="header-tag"><span className="status-dot" /> Preview environment</span>
    </header>
    <main className="main-content">
      <div className="intro"><div className="eyebrow">CURRENCY EXCHANGE · DEMO</div><h1>A clearer way to swap.</h1><p>Explore a currency conversion with a simple, transparent quote.</p></div>
      <section className="swap-card" aria-labelledby="swap-heading">
        <div className="card-header"><div><div className="card-kicker">EXCHANGE</div><h2 id="swap-heading">Swap currencies</h2></div><span className="card-badge">Reference quote</span></div>
        {loading ? <div className="state-panel" role="status"><span className="spinner" />Loading available currencies…</div> : feedError ?
          <div className="state-panel error" role="alert"><strong>Prices could not be loaded</strong><span>{feedError}</span><button className="text-button" type="button" onClick={() => setReload(value => value + 1)}>Try again →</button></div> :
          <form onSubmit={submit} noValidate>
            <div className="asset-panel">
              <div className="panel-top"><label htmlFor="send-amount">You send</label><span className="panel-hint">Reference amount</span></div>
              <div className="asset-row"><input id="send-amount" aria-describedby={invalid ? 'amount-error' : undefined} aria-invalid={invalid} inputMode="decimal" autoComplete="off" value={amount} onChange={event => { setAmount(event.target.value); setNotice(''); }} onBlur={() => setTouched(true)} placeholder="0.00" /><CurrencyPicker label="Currency to send" value={from} tokens={tokens} excluded={to} onChange={currency => changeCurrency('from', currency)} /></div>
              {invalid && <p className="field-error" id="amount-error">Enter an amount greater than zero using digits and a decimal point.</p>}
              {parsed !== null && fromToken && <span className="usd-hint">≈ ${formatAmount(parsed * fromToken.price, 2)} USD</span>}
            </div>
            <div className="switch-row"><button className="switch-button" type="button" onClick={reverse} aria-label="Reverse currencies" title="Reverse currencies">⇅</button></div>
            <div className="asset-panel receive-panel">
              <div className="panel-top"><label htmlFor="receive-amount">You receive</label><span className="panel-hint">Estimated</span></div>
              <div className="asset-row"><input id="receive-amount" readOnly value={result !== null && Number.isFinite(result) ? formatAmount(result) : '—'} /><CurrencyPicker label="Currency to receive" value={to} tokens={tokens} excluded={from} onChange={currency => changeCurrency('to', currency)} /></div>
              {result !== null && toToken && <span className="usd-hint">≈ ${formatAmount(result * toToken.price, 2)} USD</span>}
            </div>
            <div className="quote-details"><span>Exchange rate</span><strong>{fromToken && toToken ? `1 ${from} ≈ ${formatAmount(quote(1, fromToken, toToken))} ${to}` : '—'}</strong></div>
            <button className="submit-button" type="submit" disabled={submitting || result === null || !Number.isFinite(result) || result <= 0}>{submitting ? 'Preparing preview…' : 'Preview swap'}<span aria-hidden="true">↗</span></button>
            {notice && <div className="success" role="status">✓ {notice}</div>}
            <p className="disclaimer">Reference price snapshot{snapshot ? ` dated ${snapshot.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}` : ''}. This is a simulated swap; no wallet is connected or transaction executed.</p>
          </form>}
      </section>
      <div className="below-card"><span>◇</span> Transparent estimates, without the guesswork.</div>
    </main>
    <footer>Atlas Swap · Coding challenge demo</footer>
  </div>;
}
