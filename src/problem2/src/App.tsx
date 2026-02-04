import React, { useEffect, useMemo, useState } from 'react';
import TokenField from './components/TokenField';
import TokenModal from './components/TokenModal';
import { fetchLatestPrices, type TokenPrice } from './lib/prices';
import { formatNumber, formatUsd, roundTo, safeParseAmount } from './lib/format';

type Toast = { kind: 'success' | 'error' | 'info'; title: string; detail?: string };

const FEE_RATE = 0.003; // 0.3%

export default function App() {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [fromSymbol, setFromSymbol] = useState<string>('USDC');
  const [toSymbol, setToSymbol] = useState<string>('ETH');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [picker, setPicker] = useState<null | 'from' | 'to'>(null);
  const [submitting, setSubmitting] = useState(false);

  const [balances, setBalances] = useState<Record<string, number>>({});

useEffect(() => {
  const ac = new AbortController();
  let alive = true;

  (async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const list = await fetchLatestPrices(ac.signal);
      if (!alive) return;

      setTokens(list);

      // Seed mock balances for all tokens
      const seed: Record<string, number> = {};
      for (const t of list) {
        const bal = Math.min(100000, 1500 / t.price);
        seed[t.symbol] = roundTo(bal, 6);
      }
      setBalances(seed);

      if (!list.find((t) => t.symbol === 'USDC')) setFromSymbol(list[0]?.symbol ?? '');
      if (!list.find((t) => t.symbol === 'ETH')) setToSymbol(list[1]?.symbol ?? list[0]?.symbol ?? '');
    } catch (e: any) {
      // ✅ Abort is not a real “load error”
      if (!alive || e?.name === 'AbortError' || ac.signal.aborted) return;

      const msg = e instanceof Error ? e.message : 'Failed to load prices.';
      setLoadError(msg);
    } finally {
      if (!alive) return;
      setLoading(false);
    }
  })();

  return () => {
    alive = false;
    ac.abort(); // cancels in-flight fetch; fetch rejects with AbortError :contentReference[oaicite:2]{index=2}
  };
}, []);


  const tokenBySymbol = useMemo(() => {
    const m = new Map<string, TokenPrice>();
    for (const t of tokens) m.set(t.symbol, t);
    return m;
  }, [tokens]);

  const fromToken = tokenBySymbol.get(fromSymbol) ?? tokens[0];
  const toToken = tokenBySymbol.get(toSymbol) ?? tokens[1] ?? tokens[0];

  const parsedFrom = safeParseAmount(fromAmount);
  const hasAmount = Number.isFinite(parsedFrom) && parsedFrom > 0;

  const rawToAmount = useMemo(() => {
    if (!fromToken || !toToken) return NaN;
    if (!Number.isFinite(parsedFrom) || parsedFrom <= 0) return NaN;
    // USD value -> target token; apply fee
    const usdValue = parsedFrom * fromToken.price;
    const toBeforeFee = usdValue / toToken.price;
    const toAfterFee = toBeforeFee * (1 - FEE_RATE);
    return roundTo(toAfterFee, 8);
  }, [fromToken, toToken, parsedFrom]);

  const rate = useMemo(() => {
    if (!fromToken || !toToken) return NaN;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const fromBal = fromToken ? balances[fromToken.symbol] ?? 0 : 0;

  const errors = useMemo(() => {
    const e: { from?: string; global?: string } = {};

    if (!fromToken || !toToken) {
      e.global = 'Tokens are not available.';
      return e;
    }

    if (fromToken.symbol === toToken.symbol) {
      e.global = 'Please select two different tokens.';
    }

    if (fromAmount.trim() === '') {
      // no error shown yet
      return e;
    }

    if (!Number.isFinite(parsedFrom)) {
      e.from = 'Enter a valid number.';
      return e;
    }

    if (parsedFrom <= 0) {
      e.from = 'Amount must be greater than 0.';
      return e;
    }

    if (parsedFrom > fromBal) {
      e.from = `Insufficient balance. Available: ${formatNumber(fromBal, 6)} ${fromToken.symbol}`;
      return e;
    }

    return e;
  }, [fromToken, toToken, fromAmount, parsedFrom, fromBal]);

  const canSubmit = !submitting && !loading && !loadError && !!fromToken && !!toToken && !errors.global && !errors.from && hasAmount;

  const setMax = () => {
    if (!fromToken) return;
    setFromAmount(String(fromBal));
  };

  const doSwapSides = () => {
    if (!fromToken || !toToken) return;
    setFromSymbol(toToken.symbol);
    setToSymbol(fromToken.symbol);
    // Keep amount as-is; users typically enter "from" amount.
  };

  const onSubmit = async () => {
    if (!canSubmit || !fromToken || !toToken) return;

    setSubmitting(true);
    setToast({ kind: 'info', title: 'Submitting swap…', detail: 'Simulating a backend request.' });

    // Simulate backend latency
    await new Promise((r) => setTimeout(r, 1200));

    setBalances((prev) => {
      const next = { ...prev };
      next[fromToken.symbol] = roundTo(Math.max(0, (next[fromToken.symbol] ?? 0) - parsedFrom), 6);
      next[toToken.symbol] = roundTo((next[toToken.symbol] ?? 0) + (Number.isFinite(rawToAmount) ? rawToAmount : 0), 6);
      return next;
    });

    setSubmitting(false);
    setFromAmount('');
    setToast({
      kind: 'success',
      title: 'Swap submitted',
      detail: `You swapped ${formatNumber(parsedFrom, 8)} ${fromToken.symbol} for ~${formatNumber(rawToAmount, 8)} ${toToken.symbol} (fee ${formatNumber(FEE_RATE * 100, 2)}%).`
    });
  };

  const onPick = (side: 'from' | 'to', sym: string) => {
    if (side === 'from') {
      setFromSymbol(sym);
      if (sym === toSymbol) {
        // Auto-pick a different token if collision
        const alt = tokens.find((t) => t.symbol !== sym);
        if (alt) setToSymbol(alt.symbol);
      }
    } else {
      setToSymbol(sym);
      if (sym === fromSymbol) {
        const alt = tokens.find((t) => t.symbol !== sym);
        if (alt) setFromSymbol(alt.symbol);
      }
    }
    setPicker(null);
  };

  return (
    <div className="page">
      <div className="bg" aria-hidden="true" />

      <header className="header">
        <div className="brand">
          <div className="brand__mark">↔</div>
          <div>
            <div className="brand__title">Currency Swap</div>
            <div className="brand__sub">Swap assets using live token prices</div>
          </div>
        </div>
        <button
          className="ghost-btn"
          onClick={() => window.location.reload()}
          title="Reload prices"
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      <main className="card">
        <div className="card__top">
          <div className="card__headline">Swap</div>
          <div className="chip">Fee: {formatNumber(FEE_RATE * 100, 2)}%</div>
        </div>

        {loading ? (
          <div className="skeleton">
            <div className="skeleton__line" />
            <div className="skeleton__line" />
            <div className="skeleton__line" />
          </div>
        ) : loadError ? (
          <div className="notice notice--error">
            <div className="notice__title">Could not load token prices</div>
            <div className="notice__body">{loadError}</div>
            <div className="notice__actions">
              <button className="btn" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          </div>
        ) : fromToken && toToken ? (
          <>
            <TokenField
              label="You pay"
              token={fromToken}
              amount={fromAmount}
              onAmountChange={setFromAmount}
              onTokenClick={() => setPicker('from')}
              helper={
                <div className="helper__row">
                  <span>Balance: {formatNumber(fromBal, 6)} {fromToken.symbol}</span>
                  <button className="link" type="button" onClick={setMax}>
                    Max
                  </button>
                </div>
              }
              error={errors.from}
            />

            <div className="swap-row">
              <button className="swap-btn" type="button" onClick={doSwapSides} aria-label="Swap direction">
                ⇅
              </button>
              <div className="rate">
                1 {fromToken.symbol} ≈ {formatNumber(rate, 8)} {toToken.symbol}
              </div>
            </div>

            <TokenField
              label="You receive"
              token={toToken}
              amount={Number.isFinite(rawToAmount) ? String(rawToAmount) : ''}
              onTokenClick={() => setPicker('to')}
              readOnly
              helper={<span>Balance: {formatNumber(balances[toToken.symbol] ?? 0, 6)} {toToken.symbol}</span>}
            />

            <div className="breakdown">
              <div className="breakdown__row">
                <span>Value</span>
                <span>{hasAmount ? formatUsd(parsedFrom * fromToken.price) : '—'}</span>
              </div>
              <div className="breakdown__row">
                <span>Estimated fee</span>
                <span>{hasAmount ? formatUsd(parsedFrom * fromToken.price * FEE_RATE) : '—'}</span>
              </div>
              <div className="breakdown__row breakdown__row--strong">
                <span>You'll get</span>
                <span>{Number.isFinite(rawToAmount) ? `${formatNumber(rawToAmount, 8)} ${toToken.symbol}` : '—'}</span>
              </div>
            </div>

            {errors.global ? <div className="notice notice--error">{errors.global}</div> : null}

            <button className="btn btn--primary" onClick={onSubmit} disabled={!canSubmit}>
              {submitting ? <span className="spinner" aria-hidden="true" /> : null}
              {submitting ? 'Swapping…' : 'Swap'}
            </button>

            <div className="fineprint">
              Prices are pulled from the provided endpoint; icons are loaded from the Switcheo token-icons repo.
            </div>
          </>
        ) : null}
      </main>

      <footer className="footer">
        <div className="footer__small">Built with Vite + React.</div>
      </footer>

      <TokenModal
        open={picker === 'from'}
        title="Select token to pay"
        tokens={tokens}
        selectedSymbol={fromSymbol}
        onClose={() => setPicker(null)}
        onSelect={(sym) => onPick('from', sym)}
      />

      <TokenModal
        open={picker === 'to'}
        title="Select token to receive"
        tokens={tokens}
        selectedSymbol={toSymbol}
        onClose={() => setPicker(null)}
        onSelect={(sym) => onPick('to', sym)}
      />

      {toast ? (
        <div className={`toast toast--${toast.kind}`} role="status" aria-live="polite" onClick={() => setToast(null)}>
          <div className="toast__title">{toast.title}</div>
          {toast.detail ? <div className="toast__detail">{toast.detail}</div> : null}
          <div className="toast__hint">Tap to dismiss</div>
        </div>
      ) : null}
    </div>
  );
}
