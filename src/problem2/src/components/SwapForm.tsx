import { useEffect, useMemo, useState } from 'react';
import type { Token } from '../types';
import { formatAmount, formatUsd } from '../lib/tokens';
import { TokenIcon } from './TokenIcon';
import { TokenSelect } from './TokenSelect';
import { SwapToast, type SwapReceipt } from './SwapToast';

// How long the success toast stays on screen before auto-dismissing.
const TOAST_DURATION_MS = 5000;

interface Props {
  tokens: Token[];
}

type Side = 'from' | 'to';
type SubmitState = 'idle' | 'swapping' | 'success';

// Input limits. 8 decimals matches the most `formatAmount` ever displays; a
// total length of 20 leaves ~11 integer digits — far below the 16 digits of
// Number.MAX_SAFE_INTEGER, so typed values never lose precision in whole units.
const MAX_DECIMALS = 8;
const MAX_INPUT_LENGTH = 20;
const AMOUNT_PATTERN = new RegExp(`^\\d*\\.?\\d{0,${MAX_DECIMALS}}$`);

// Starting wallet balances, in token units. Edit these freely to change what
// the demo wallet holds. Any token not listed here starts at DEFAULT_BALANCE.
const INITIAL_BALANCES: Record<string, number> = {
  ETH: 12,
  WBTC: 0.75,
  USDC: 25000,
  USD: 25000,
  USDT: 25000,
  ATOM: 800,
  OSMO: 1500,
  GMX: 60,
  bNEO: 400,
  BLUR: 5000,
};

// Fallback for any token without an explicit entry above.
const DEFAULT_BALANCE = 1000;

/** Look up a token's starting balance from the static config. */
function initialBalance(token: Token): number {
  return INITIAL_BALANCES[token.symbol] ?? DEFAULT_BALANCE;
}

export function SwapForm({ tokens }: Props) {
  // Pick sensible defaults if available, otherwise the first two tokens.
  const initialFrom =
    tokens.find((t) => t.symbol === 'ETH') ?? tokens[0] ?? null;
  const initialTo =
    tokens.find((t) => t.symbol === 'USDC') ??
    tokens.find((t) => t !== initialFrom) ??
    null;

  const [fromToken, setFromToken] = useState<Token | null>(initialFrom);
  const [toToken, setToToken] = useState<Token | null>(initialTo);
  const [amount, setAmount] = useState('');
  const [picker, setPicker] = useState<Side | null>(null);
  const [submit, setSubmit] = useState<SubmitState>('idle');
  const [receipt, setReceipt] = useState<SwapReceipt | null>(null);

  // Mutable wallet: holdings per token, seeded once from INITIAL_BALANCES.
  // A completed swap debits the paid token and credits the received one.
  const [balances, setBalances] = useState<Record<string, number>>(() =>
    Object.fromEntries(tokens.map((t) => [t.symbol, initialBalance(t)])),
  );

  const balance = fromToken ? (balances[fromToken.symbol] ?? 0) : 0;
  const toBalance = toToken ? (balances[toToken.symbol] ?? 0) : 0;

  // Exchange rate: how many "to" units one "from" unit buys.
  const rate =
    fromToken && toToken ? fromToken.price / toToken.price : null;

  const parsedAmount = Number(amount);
  const amountValid =
    amount !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0;

  const receiveAmount =
    amountValid && rate !== null ? parsedAmount * rate : 0;

  // Validation -------------------------------------------------------------
  const error: string | null = useMemo(() => {
    if (amount === '') return null;
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0)
      return 'Enter a valid amount.';
    if (parsedAmount === 0) return null;
    if (fromToken && parsedAmount > balance)
      return `Insufficient ${fromToken.symbol} balance.`;
    return null;
  }, [amount, parsedAmount, balance, fromToken]);

  const canSubmit =
    amountValid && !error && fromToken !== null && toToken !== null;

  // Reset the success state when the user edits the form again.
  useEffect(() => {
    if (submit === 'success') setSubmit('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromToken, toToken]);

  // Auto-dismiss the success toast after a few seconds.
  useEffect(() => {
    if (!receipt) return;
    const id = setTimeout(() => setReceipt(null), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [receipt]);

  // Handlers ---------------------------------------------------------------
  function onAmountChange(value: string) {
    // Allow only numbers with a single decimal point, capped decimals/length.
    if (value.length > MAX_INPUT_LENGTH) return;
    if (value === '' || AMOUNT_PATTERN.test(value)) {
      setAmount(value);
    }
  }

  function flip() {
    // Swap the tokens only; keep the typed amount as the source of truth and
    // let the receive side recompute (like Binance Convert). Carrying the
    // converted amount back into the input would round-trip with rounding drift.
    setFromToken(toToken);
    setToToken(fromToken);
  }

  function pick(token: Token) {
    if (picker === 'from') {
      // Avoid selecting the same token on both sides.
      if (toToken?.symbol === token.symbol) setToToken(fromToken);
      setFromToken(token);
    } else if (picker === 'to') {
      if (fromToken?.symbol === token.symbol) setFromToken(toToken);
      setToToken(token);
    }
    setPicker(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !fromToken || !toToken) return;
    // Snapshot the trade now, before the form resets, for the success receipt.
    const completed: SwapReceipt = {
      fromSymbol: fromToken.symbol,
      toSymbol: toToken.symbol,
      fromAmount: parsedAmount,
      toAmount: receiveAmount,
      fromIcon: fromToken.icon,
      toIcon: toToken.icon,
    };
    setSubmit('swapping');
    // Simulate a backend round-trip.
    await new Promise((r) => setTimeout(r, 1600));
    // Settle the trade against the wallet: debit the paid token, credit the
    // received one. Clamp the debit at 0 to avoid tiny negative float dust.
    setBalances((prev) => ({
      ...prev,
      [completed.fromSymbol]: Math.max(
        0,
        (prev[completed.fromSymbol] ?? 0) - completed.fromAmount,
      ),
      [completed.toSymbol]:
        (prev[completed.toSymbol] ?? 0) + completed.toAmount,
    }));
    setSubmit('success');
    setAmount('');
    setReceipt(completed);
  }

  const sendUsd = amountValid && fromToken ? parsedAmount * fromToken.price : 0;
  const receiveUsd = receiveAmount && toToken ? receiveAmount * toToken.price : 0;

  return (
    <>
    <form className="swap-card" onSubmit={onSubmit}>
      <header className="swap-card__head">
        <h2>Swap</h2>
        <p>Trade tokens in an instant</p>
      </header>

      {/* ---- You pay ---- */}
      <div className={`field ${error ? 'field--error' : ''}`}>
        <div className="field__top">
          <label htmlFor="pay">You pay</label>
          {fromToken && (
            <div className="field__actions">
              {amount !== '' && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setAmount('')}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="max-btn"
                onClick={() => setAmount(String(Number(balance.toFixed(6))))}
              >
                MAX
              </button>
            </div>
          )}
        </div>
        <div className="field__row">
          <input
            id="pay"
            className="field__input"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            maxLength={MAX_INPUT_LENGTH}
            autoComplete="off"
          />
          <TokenButton token={fromToken} label="Pay token" onClick={() => setPicker('from')} />
        </div>
        <div className="field__footer">
          <span className="field__usd">
            {sendUsd > 0 ? formatUsd(sendUsd) : ''}
          </span>
          {fromToken && (
            <span className="field__balance-text">
              Balance: {formatAmount(balance)} {fromToken.symbol}
            </span>
          )}
        </div>
      </div>

      {/* ---- Flip ---- */}
      <div className="flip-wrap">
        <button
          type="button"
          className="flip-btn"
          onClick={flip}
          aria-label="Switch direction"
          title="Switch direction"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M7 4v13" /><path d="m3.5 7.5 3.5-3.5 3.5 3.5" />
            <path d="M17 20V7" /><path d="m20.5 16.5-3.5 3.5-3.5-3.5" />
          </svg>
        </button>
      </div>

      {/* ---- You receive ---- */}
      <div className="field field--readonly">
        <div className="field__top">
          <label htmlFor="receive">You receive</label>
        </div>
        <div className="field__row">
          <input
            id="receive"
            className="field__input"
            placeholder="0"
            value={receiveAmount > 0 ? formatAmount(receiveAmount) : ''}
            readOnly
            tabIndex={-1}
          />
          <TokenButton token={toToken} label="Receive token" onClick={() => setPicker('to')} />
        </div>
        <div className="field__footer">
          <span className="field__usd">
            {receiveUsd > 0 ? formatUsd(receiveUsd) : ''}
          </span>
          {toToken && (
            <span className="field__balance-text">
              Balance: {formatAmount(toBalance)} {toToken.symbol}
            </span>
          )}
        </div>
      </div>

      {/* ---- Rate ---- */}
      {rate !== null && fromToken && toToken && (
        <div className="rate">
          <span>Rate</span>
          <span>
            1 {fromToken.symbol} = {formatAmount(rate)} {toToken.symbol}
          </span>
        </div>
      )}

      {/* ---- Error ---- */}
      {error && <div className="error-msg">{error}</div>}

      {/* ---- Submit ---- */}
      <button
        type="submit"
        className={`submit-btn ${submit === 'success' ? 'submit-btn--ok' : ''}`}
        disabled={!canSubmit || submit === 'swapping'}
      >
        {submit === 'swapping' && <span className="spinner" aria-hidden />}
        {submit === 'swapping'
          ? 'Swapping…'
          : submit === 'success'
            ? '✓ Swap complete'
            : !amountValid
              ? 'Enter an amount'
              : 'Confirm swap'}
      </button>

      <TokenSelect
        open={picker !== null}
        tokens={tokens}
        excludeSymbol={picker === 'from' ? toToken?.symbol : fromToken?.symbol}
        onSelect={pick}
        onClose={() => setPicker(null)}
      />
    </form>

    {receipt && (
      <SwapToast receipt={receipt} onClose={() => setReceipt(null)} />
    )}
    </>
  );
}

/** The pill button that shows the selected token and opens the picker. */
function TokenButton({
  token,
  label,
  onClick,
}: {
  token: Token | null;
  /** Accessible role of this selector, e.g. "Pay token". */
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="token-btn"
      onClick={onClick}
      aria-label={`${label}: ${token ? token.symbol : 'select'}`}
    >
      {token ? (
        <>
          <TokenIcon symbol={token.symbol} src={token.icon} size={24} priority />
          <span>{token.symbol}</span>
        </>
      ) : (
        <span>Select</span>
      )}
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
        strokeLinejoin="round" className="token-btn__chevron">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
