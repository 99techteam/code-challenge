import { useCallback, useEffect, useMemo, useState } from 'react';
import { dedupeLatest, fetchPrices } from './api';
import { applySwap, loadInitialBalances } from './balances';
import { iconUrl } from './tokenIcon';
import { TokenSelect } from './components/TokenSelect';
import { TokenIcon } from './components/TokenIcon';
import { formatBalance, formatPct, formatPrice } from './format';
import type { SwapQuote, Token } from './types';
import './style.css';

const FEE_PCT = 0.003; // 0.3% protocol fee (mock)
const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];
const DEFAULT_SLIPPAGE = 0.5;
const SUBMIT_DELAY_MS = 1500;

interface TokenMeta {
  symbol: string;
  price: number;
  iconUrl: string;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; meta: TokenMeta[] };

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'done'; ok: true; message: string }
  | { kind: 'done'; ok: false; message: string };

export function Problem2View() {
  const [load, setLoad] = useState<LoadState>({ kind: 'loading' });
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [fromSymbol, setFromSymbol] = useState<string | null>(null);
  const [toSymbol, setToSymbol] = useState<string | null>(null);
  const [amountRaw, setAmountRaw] = useState('');
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE);
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' });

  const loadPrices = useCallback(() => {
    setLoad({ kind: 'loading' });
    fetchPrices()
      .then((entries) => {
        const deduped = dedupeLatest(entries);
        const meta: TokenMeta[] = deduped.map((e) => ({
          symbol: e.currency,
          price: e.price,
          iconUrl: iconUrl(e.currency),
        }));
        setLoad({ kind: 'ready', meta });
        setBalances(loadInitialBalances(meta.map((m) => m.symbol)));
        // Pick a sensible default pair so the form has something to show.
        const eth = meta.find((m) => m.symbol === 'ETH');
        const usdc = meta.find((m) => m.symbol === 'USDC');
        setFromSymbol((eth ?? meta[0])?.symbol ?? null);
        setToSymbol((usdc ?? meta[1] ?? meta[0])?.symbol ?? null);
      })
      .catch((err: unknown) => {
        setLoad({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  // Auto-dismiss the submit toast after a couple of seconds.
  useEffect(() => {
    if (submit.kind !== 'done') return;
    const t = setTimeout(() => setSubmit({ kind: 'idle' }), 3000);
    return () => clearTimeout(t);
  }, [submit]);

  // Derive the user-facing token list by joining static price metadata
  // with the live (mutable) balance map.
  const tokens: Token[] = useMemo(() => {
    if (load.kind !== 'ready') return [];
    return load.meta.map((m) => ({
      symbol: m.symbol,
      price: m.price,
      iconUrl: m.iconUrl,
      balance: balances[m.symbol] ?? 0,
    }));
  }, [load, balances]);

  const fromToken = tokens.find((t) => t.symbol === fromSymbol) ?? null;
  const toToken = tokens.find((t) => t.symbol === toSymbol) ?? null;

  const amount = parseFloat(amountRaw);
  const amountValid =
    amountRaw !== '' && Number.isFinite(amount) && amount > 0;

  const quote: SwapQuote | null = useMemo(() => {
    if (!fromToken || !toToken || !amountValid) return null;
    const rate = fromToken.price / toToken.price;
    const grossOut = amount * rate;
    const feeAmount = grossOut * FEE_PCT;
    const amountOut = grossOut - feeAmount;
    const minReceived = amountOut * (1 - slippage / 100);
    return {
      amountIn: amount,
      amountOut,
      rate,
      feePct: FEE_PCT * 100,
      feeAmount,
      minReceived,
    };
  }, [fromToken, toToken, amount, amountValid, slippage]);

  const validation = useMemo(() => {
    if (!fromToken || !toToken) return 'Select both tokens to continue.';
    if (fromToken.symbol === toToken.symbol)
      return 'From and to must be different tokens.';
    if (amountRaw === '') return null;
    if (!Number.isFinite(amount)) return 'Amount must be a valid number.';
    if (amount <= 0) return 'Amount must be greater than zero.';
    if (amount > fromToken.balance)
      return `Insufficient balance. Max: ${formatBalance(fromToken.balance)} ${fromToken.symbol}.`;
    return null;
  }, [fromToken, toToken, amount, amountRaw]);

  const canSubmit =
    !!fromToken &&
    !!toToken &&
    fromToken.symbol !== toToken.symbol &&
    amountValid &&
    amount <= fromToken.balance &&
    submit.kind !== 'submitting';

  const onFlip = () => {
    if (!fromToken || !toToken) return;
    setFromSymbol(toToken.symbol);
    setToSymbol(fromToken.symbol);
    setAmountRaw('');
  };

  const onMax = () => {
    if (!fromToken) return;
    setAmountRaw(String(fromToken.balance));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !fromToken || !toToken || !quote) return;
    setSubmit({ kind: 'submitting' });
    // Mock backend: pretend to send the swap, then update the local
    // balance map so the FROM token is debited and the TO token credited.
    setTimeout(() => {
      setBalances((prev) =>
        applySwap(
          prev,
          fromToken.symbol,
          quote.amountIn,
          toToken.symbol,
          quote.amountOut,
        ),
      );
      setSubmit({
        kind: 'done',
        ok: true,
        message: `Swapped ${formatBalance(quote.amountIn)} ${fromToken.symbol} → ${formatBalance(quote.amountOut)} ${toToken.symbol}.`,
      });
      setAmountRaw('');
    }, SUBMIT_DELAY_MS);
  };

  if (load.kind === 'loading') {
    return (
      <div className="p2-state">
        <div className="spinner" />
        <p>Loading Switcheo prices…</p>
      </div>
    );
  }

  if (load.kind === 'error') {
    return (
      <div className="p2-state error">
        <p>Failed to load price feed.</p>
        <code className="mono">{load.message}</code>
        <button className="btn btn-secondary" onClick={loadPrices}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p2-wrap">
      <form className="p2-card" onSubmit={onSubmit}>
        <header className="p2-card-header">
          <h2 className="p2-title">Swap</h2>
          <SlippageControl value={slippage} onChange={setSlippage} />
        </header>

        {/* ---------------- FROM panel ---------------- */}
        <div className="p2-leg">
          <div className="p2-leg-head">
            <span>From</span>
            {fromToken && (
              <span className="p2-balance">
                Balance: {formatBalance(fromToken.balance)} {fromToken.symbol}{' '}
                <button
                  type="button"
                  className="p2-max"
                  onClick={onMax}
                  disabled={!fromToken}
                >
                  MAX
                </button>
              </span>
            )}
          </div>
          <div className="p2-leg-body">
            <input
              type="text"
              inputMode="decimal"
              className="p2-amount mono"
              placeholder="0.0"
              value={amountRaw}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setAmountRaw(v);
              }}
            />
            <TokenSelect
              tokens={tokens}
              value={fromToken}
              onChange={(t) => setFromSymbol(t.symbol)}
              excludeSymbol={toSymbol}
            />
          </div>
          {fromToken && amountValid && (
            <div className="p2-leg-foot mono">
              ≈ {formatPrice(amount * fromToken.price)}
            </div>
          )}
        </div>

        {/* ---------------- Swap direction ---------------- */}
        <div className="p2-flip-row">
          <button
            type="button"
            className="p2-flip"
            onClick={onFlip}
            aria-label="Swap direction"
            disabled={!fromToken || !toToken}
          >
            ↕
          </button>
        </div>

        {/* ---------------- TO panel ---------------- */}
        <div className="p2-leg">
          <div className="p2-leg-head">
            <span>To</span>
            {toToken && (
              <span className="p2-balance">
                Balance: {formatBalance(toToken.balance)} {toToken.symbol}
              </span>
            )}
          </div>
          <div className="p2-leg-body">
            <input
              type="text"
              className="p2-amount mono readonly"
              placeholder="0.0"
              value={quote ? formatBalance(quote.amountOut) : ''}
              readOnly
              tabIndex={-1}
            />
            <TokenSelect
              tokens={tokens}
              value={toToken}
              onChange={(t) => setToSymbol(t.symbol)}
              excludeSymbol={fromSymbol}
            />
          </div>
          {toToken && quote && (
            <div className="p2-leg-foot mono">
              ≈ {formatPrice(quote.amountOut * toToken.price)}
            </div>
          )}
        </div>

        {/* ---------------- Rate + fee summary ---------------- */}
        {quote && fromToken && toToken && (
          <div className="p2-summary">
            <SummaryRow
              label="Rate"
              value={
                <>
                  1 {fromToken.symbol} ={' '}
                  <span className="mono">{formatBalance(quote.rate)}</span>{' '}
                  {toToken.symbol}
                </>
              }
            />
            <SummaryRow
              label={`Protocol fee (${formatPct(quote.feePct)})`}
              value={
                <span className="mono">
                  {formatBalance(quote.feeAmount)} {toToken.symbol}
                </span>
              }
            />
            <SummaryRow
              label={`Min received (${formatPct(slippage)} slippage)`}
              value={
                <span className="mono">
                  {formatBalance(quote.minReceived)} {toToken.symbol}
                </span>
              }
            />
          </div>
        )}

        {/* ---------------- Validation message ---------------- */}
        {validation && (
          <div className="p2-validation">{validation}</div>
        )}

        {/* ---------------- Submit ---------------- */}
        <button
          type="submit"
          className="btn btn-primary p2-submit"
          disabled={!canSubmit}
        >
          {submit.kind === 'submitting' ? (
            <>
              <span className="spinner" />
              Swapping…
            </>
          ) : (
            'Confirm Swap'
          )}
        </button>
      </form>

      {/* ---------------- Toast ---------------- */}
      {submit.kind === 'done' && (
        <div className={`toast ${submit.ok ? 'toast-success' : 'toast-error'}`}>
          {submit.ok ? (
            fromToken && toToken ? (
              <>
                <TokenIcon symbol={toToken.symbol} size={20} />
                <span>{submit.message}</span>
              </>
            ) : (
              <span>{submit.message}</span>
            )
          ) : (
            <span>{submit.message}</span>
          )}
        </div>
      )}
    </div>
  );
}

// --------------- subcomponents ---------------

function SlippageControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const isPreset = SLIPPAGE_PRESETS.includes(value);
  return (
    <div className="p2-slip">
      <span className="p2-slip-label">Slippage</span>
      {SLIPPAGE_PRESETS.map((p) => (
        <button
          key={p}
          type="button"
          className={`p2-slip-btn ${value === p ? 'active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}%
        </button>
      ))}
      <input
        type="number"
        className="p2-slip-input mono"
        value={isPreset ? '' : value}
        min={0.01}
        max={50}
        step={0.01}
        placeholder="Custom"
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v) && v > 0) onChange(v);
        }}
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="p2-summary-row">
      <span className="p2-summary-label">{label}</span>
      <span className="p2-summary-value">{value}</span>
    </div>
  );
}
