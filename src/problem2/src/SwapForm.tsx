import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useTokens } from "./prices";
import type { Token } from "./prices";
import { AMOUNT_PATTERN, formatUsd, rateFormat, toInputValue } from "./format";
import TokenIcon from "./TokenIcon";
import TokenPicker from "./TokenPicker";

type Side = "from" | "to";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  symbol: string;
  usd: number;
  error?: string;
  disabled: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onOpen: () => void;
}

function Field({ id, label, value, symbol, usd, error, disabled, onChange, onOpen }: FieldProps) {
  return (
    <div className={error ? "field invalid" : "field"}>
      <label htmlFor={id}>{label}</label>
      <div className="field-main">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.0"
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={onChange}
        />
        <button type="button" className="token-btn" disabled={disabled} onClick={onOpen} aria-label={`${label}: ${symbol}, change token`}>
          <TokenIcon symbol={symbol} />
          <span>{symbol}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="field-foot">
        <span>{usd > 0 ? formatUsd(usd) : "$0.00"}</span>
      </div>
      {error && (
        <p className="error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface Receipt {
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
}

function defaultPair(tokens: Token[], bySymbol: Map<string, Token>): { from: string; to: string } {
  const from = bySymbol.has("ETH") ? "ETH" : tokens[0].symbol;
  const to = bySymbol.has("USDC") && from !== "USDC" ? "USDC" : tokens.find((t) => t.symbol !== from)!.symbol;
  return { from, to };
}

const SWAP_DELAY_MS = 1600;
const MAX_OUTPUT = 1e18;

function SwapCard({ tokens, bySymbol }: { tokens: Token[]; bySymbol: Map<string, Token> }) {
  const [pair, setPair] = useState(() => defaultPair(tokens, bySymbol));
  const [active, setActive] = useState<Side>("from");
  const [typed, setTyped] = useState("");
  const [picking, setPicking] = useState<Side | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const priceFrom = bySymbol.get(pair.from)!.price;
  const priceTo = bySymbol.get(pair.to)!.price;
  const ratio = priceFrom / priceTo;

  const quote = useMemo(() => {
    const parsed = Number(typed);
    const amount = parsed > 0 ? parsed : 0;
    const other = active === "from" ? amount * ratio : amount / ratio;
    const otherText = toInputValue(other);
    const fromText = active === "from" ? typed : otherText;
    const toText = active === "to" ? typed : otherText;
    const fromAmount = active === "from" ? amount : other;
    let error: string | undefined;
    if (amount > 0) {
      if (other >= MAX_OUTPUT) error = "Amount too large";
      else if (Number(otherText) === 0) error = "Amount too small to swap";
    }
    return { amount, fromText, toText, usd: fromAmount * priceFrom, error };
  }, [typed, active, ratio, priceFrom]);

  const onType = (side: Side) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    if (!AMOUNT_PATTERN.test(value)) return;
    setActive(side);
    setTyped(value);
    setReceipt(null);
  };

  const onPick = (symbol: string) => {
    setPair((p) => {
      if (picking === "from") return symbol === p.to ? { from: symbol, to: p.from } : { ...p, from: symbol };
      return symbol === p.from ? { from: p.to, to: symbol } : { ...p, to: symbol };
    });
    setPicking(null);
  };

  const flip = () => {
    setPair((p) => ({ from: p.to, to: p.from }));
    setActive((s) => (s === "from" ? "to" : "from"));
    setReceipt(null);
  };

  const canSubmit = quote.amount > 0 && !quote.error && !submitting;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const done: Receipt = { from: pair.from, to: pair.to, fromAmount: quote.fromText, toAmount: quote.toText };
    setSubmitting(true);
    setReceipt(null);
    timer.current = window.setTimeout(() => {
      setSubmitting(false);
      setTyped("");
      setReceipt(done);
    }, SWAP_DELAY_MS);
  };

  let label = `Swap ${pair.from} for ${pair.to}`;
  if (submitting) label = "Swapping";
  else if (quote.amount === 0) label = "Enter an amount";
  else if (quote.error) label = "Invalid amount";

  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <h1>Swap</h1>

      <Field
        id="input-amount"
        label="Amount to send"
        value={quote.fromText}
        symbol={pair.from}
        usd={quote.usd}
        error={active === "from" ? quote.error : undefined}
        disabled={submitting}
        onChange={onType("from")}
        onOpen={() => setPicking("from")}
      />

      <div className="flip-row">
        <button type="button" className="flip" onClick={flip} disabled={submitting} aria-label="Swap direction">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M8 4v16m0 0l-4-4m4 4l4-4M16 20V4m0 0l-4 4m4-4l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <Field
        id="output-amount"
        label="Amount to receive"
        value={quote.toText}
        symbol={pair.to}
        usd={quote.usd}
        error={active === "to" ? quote.error : undefined}
        disabled={submitting}
        onChange={onType("to")}
        onOpen={() => setPicking("to")}
      />

      <p className="rate">
        1 {pair.from} = {rateFormat.format(ratio)} {pair.to}
      </p>

      <button type="submit" className="submit" disabled={!canSubmit} aria-busy={submitting}>
        {submitting && <span className="spinner" aria-hidden="true" />}
        {label}
      </button>

      <div aria-live="polite">
        {receipt && (
          <div className="receipt" role="status">
            <span>
              Swapped {receipt.fromAmount} {receipt.from} for {receipt.toAmount} {receipt.to}
            </span>
            <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => setReceipt(null)}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <TokenPicker
        open={picking !== null}
        tokens={tokens}
        selected={picking === "to" ? pair.to : pair.from}
        onPick={onPick}
        onClose={() => setPicking(null)}
      />
    </form>
  );
}

export default function SwapForm() {
  const [state, reload] = useTokens();

  if (state.status === "ready" && state.tokens.length >= 2) {
    return <SwapCard tokens={state.tokens} bySymbol={state.bySymbol} />;
  }

  return (
    <div className="card status" aria-live="polite">
      <h1>Swap</h1>
      {state.status === "loading" ? (
        <>
          <div className="skeleton" />
          <div className="skeleton" />
          <p className="rate">Loading prices</p>
        </>
      ) : (
        <>
          <p className="error" role="alert">
            {state.status === "error" ? state.message : "Not enough priced tokens to swap"}
          </p>
          <button type="button" className="submit" onClick={reload}>
            Retry
          </button>
        </>
      )}
    </div>
  );
}
