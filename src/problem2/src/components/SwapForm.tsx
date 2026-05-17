import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Token } from "../types";
import { useSwapReducer } from "../hooks/useSwapReducer";
import { validate } from "../lib/validation";
import { formatDisplayNumber } from "../lib/tokens";
import { TokenAmountField } from "./TokenAmountField";
import { FlipButton } from "./FlipButton";
import { RateSummary } from "./RateSummary";
import { SubmitButton } from "./SubmitButton";

type Props = {
  tokens: Token[];
};

const PREFERRED_FROM = "ETH";
const PREFERRED_TO = "USDC";

function pickDefaults(tokens: Token[]): {
  from: Token | null;
  to: Token | null;
} {
  if (tokens.length === 0) return { from: null, to: null };
  const from =
    tokens.find((t) => t.symbol === PREFERRED_FROM) ?? tokens[0] ?? null;
  const to =
    tokens.find((t) => t.symbol === PREFERRED_TO && t.symbol !== from?.symbol) ??
    tokens.find((t) => t.symbol !== from?.symbol) ??
    null;
  return { from, to };
}

export function SwapForm({ tokens }: Props) {
  const defaults = useMemo(() => pickDefaults(tokens), [tokens]);
  const [state, dispatch] = useSwapReducer(defaults.from, defaults.to);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(() => validate(state), [state]);

  const showFromAmountError =
    (state.touched.from || state.touched.to || submitAttempted) &&
    !!validation.errors.fromAmount;
  const showTokenErrors = submitAttempted;
  const showPairError = !!validation.errors.pair;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!validation.isValid || state.status === "submitting") return;

    const summary = {
      fromAmount: formatDisplayNumber(parseFloat(state.fromAmount)),
      fromSymbol: state.fromToken!.symbol,
      toAmount: formatDisplayNumber(parseFloat(state.toAmount)),
      toSymbol: state.toToken!.symbol,
    };

    dispatch({ type: "SUBMIT_START" });
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Swap complete", {
      description: `Swapped ${summary.fromAmount} ${summary.fromSymbol} → ${summary.toAmount} ${summary.toSymbol}`,
    });
    dispatch({ type: "RESET" });
    setSubmitAttempted(false);
    fromInputRef.current?.focus();
  }

  const isSubmitting = state.status === "submitting";
  const submitDisabled = !validation.isValid || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-[480px]
        rounded-3xl border border-border-card bg-surface-card backdrop-blur-xl
        p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]
      "
    >
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold tracking-tight">Swap</h1>
      </div>

      <div className="relative space-y-2">
        <TokenAmountField
          ref={fromInputRef}
          label="You pay"
          amount={state.fromAmount}
          token={state.fromToken}
          tokens={tokens}
          otherToken={state.toToken}
          onAmountChange={(v) => dispatch({ type: "SET_FROM_AMOUNT", value: v })}
          onTokenChange={(t) => dispatch({ type: "SET_FROM_TOKEN", token: t })}
          onBlur={() => dispatch({ type: "BLUR_FROM" })}
          error={
            state.lastEdited === "from" && showFromAmountError
              ? validation.errors.fromAmount
              : showTokenErrors
                ? validation.errors.fromToken
                : undefined
          }
          disabled={isSubmitting}
        />

        <div className="relative h-0">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <FlipButton
              onClick={() => dispatch({ type: "FLIP" })}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <TokenAmountField
          label="You receive"
          amount={state.toAmount}
          token={state.toToken}
          tokens={tokens}
          otherToken={state.fromToken}
          onAmountChange={(v) => dispatch({ type: "SET_TO_AMOUNT", value: v })}
          onTokenChange={(t) => dispatch({ type: "SET_TO_TOKEN", token: t })}
          onBlur={() => dispatch({ type: "BLUR_TO" })}
          error={
            state.lastEdited === "to" && showFromAmountError
              ? validation.errors.fromAmount
              : showTokenErrors
                ? validation.errors.toToken
                : undefined
          }
          disabled={isSubmitting}
        />
      </div>

      {showPairError && (
        <div className="mt-3 rounded-xl bg-error/10 px-3 py-2 text-xs text-error font-medium text-center">
          {validation.errors.pair}
        </div>
      )}

      <div className="mt-4">
        <RateSummary fromToken={state.fromToken} toToken={state.toToken} />
      </div>

      <div className="mt-3">
        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={submitDisabled}
          disabledReason={validation.firstError}
        />
      </div>
    </form>
  );
}
