import { useState } from "react";
import type { FormEvent } from "react";
import type { Token } from "../types";
import { TokenSelect } from "./TokenSelect";
import { computeReceiveAmount, formatAmount, formatRate } from "../lib/format";

type SubmitState = "idle" | "loading" | "success";

interface Props {
  tokens: Token[];
}

export function SwapForm({ tokens }: Props) {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [sendAmount, setSendAmount] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  // Compute how much the user receives based on current prices.
  const parsedSend = parseFloat(sendAmount);
  const receiveAmount =
    fromToken && toToken && !isNaN(parsedSend) && parsedSend > 0
      ? computeReceiveAmount(parsedSend, fromToken.price, toToken.price)
      : null;

  // Collect validation problems so we can show them inline.
  const validationErrors: string[] = [];
  if (sendAmount !== "" && (isNaN(parsedSend) || parsedSend <= 0)) {
    validationErrors.push("Amount must be a positive number.");
  }
  if (fromToken && toToken && fromToken.symbol === toToken.symbol) {
    validationErrors.push("Please choose two different tokens.");
  }

  const canSubmit =
    fromToken !== null &&
    toToken !== null &&
    fromToken.symbol !== toToken.symbol &&
    parsedSend > 0 &&
    validationErrors.length === 0 &&
    submitState === "idle";

  function flipDirection() {
    setFromToken(toToken);
    setToToken(fromToken);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitState("loading");

    // Simulate a backend round-trip with a fixed delay, per the problem hint.
    setTimeout(() => {
      setSubmitState("success");
      setTimeout(() => {
        setSubmitState("idle");
        setSendAmount("");
      }, 2500);
    }, 1500);
  }

  const isLocked = submitState !== "idle";

  return (
    <form className="swap-form" onSubmit={handleSubmit} noValidate>
      <h2 className="swap-form__title">Swap</h2>

      {/* ── From ── */}
      <div className="swap-form__panel">
        <TokenSelect
          label="You send"
          tokens={tokens}
          value={fromToken}
          onChange={setFromToken}
          disabled={isLocked}
        />
        <input
          className="swap-form__amount"
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          min="0"
          step="any"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          disabled={isLocked}
          aria-label="Amount to send"
        />
      </div>

      {/* ── Flip button ── */}
      <div className="swap-form__flip-row">
        <button
          type="button"
          className="swap-form__flip"
          onClick={flipDirection}
          disabled={isLocked}
          aria-label="Flip swap direction"
          title="Flip direction"
        >
          ⇅
        </button>
      </div>

      {/* ── To ── */}
      <div className="swap-form__panel">
        <TokenSelect
          label="You receive"
          tokens={tokens}
          value={toToken}
          onChange={setToToken}
          disabled={isLocked}
        />
        <input
          className="swap-form__amount swap-form__amount--readonly"
          type="text"
          readOnly
          placeholder="0.00"
          value={receiveAmount !== null ? formatAmount(receiveAmount) : ""}
          aria-label="Amount to receive"
        />
      </div>

      {/* ── Exchange rate ── */}
      {fromToken && toToken && fromToken.symbol !== toToken.symbol && (
        <p className="swap-form__rate">
          {formatRate(
            fromToken.symbol,
            toToken.symbol,
            fromToken.price,
            toToken.price
          )}
        </p>
      )}

      {/* ── Validation messages ── */}
      {validationErrors.map((msg) => (
        <p key={msg} className="swap-form__error" role="alert">
          {msg}
        </p>
      ))}

      {/* ── Submit ── */}
      <button
        type="submit"
        className={[
          "swap-form__submit",
          submitState === "success" ? "swap-form__submit--success" : "",
        ]
          .join(" ")
          .trim()}
        disabled={!canSubmit}
      >
        {submitState === "loading" && <span className="spinner" aria-hidden />}
        {submitState === "success" ? "✓ Swap Confirmed!" : "Confirm Swap"}
      </button>
    </form>
  );
}
