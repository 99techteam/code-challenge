import { forwardRef, useId, useState } from "react";
import type { Token } from "../types";
import { formatUsd, sanitizeAmount } from "../lib/tokens";
import { TokenIcon } from "./TokenIcon";
import { TokenPicker } from "./TokenPicker";

type Props = {
  label: string;
  amount: string;
  token: Token | null;
  tokens: Token[];
  otherToken: Token | null;
  onAmountChange: (value: string) => void;
  onTokenChange: (token: Token) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
};

export const TokenAmountField = forwardRef<HTMLInputElement, Props>(
  function TokenAmountField(
    {
      label,
      amount,
      token,
      tokens,
      otherToken,
      onAmountChange,
      onTokenChange,
      onBlur,
      error,
      disabled,
      placeholder = "0.0",
    },
    ref,
  ) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const inputId = useId();
    const errorId = useId();

    const numericAmount = parseFloat(amount);
    const usdValue =
      token && Number.isFinite(numericAmount) ? numericAmount * token.price : 0;

    return (
      <div
        className={`
          rounded-2xl border bg-surface-input focus-within:bg-surface-input-focus p-4
          transition-colors
          ${error ? "border-error/60" : "border-border-card focus-within:border-accent-mid/50"}
          ${disabled ? "opacity-60" : ""}
        `}
      >
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-ink-muted mb-2"
        >
          {label}
        </label>

        <div className="flex items-center gap-3">
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={amount}
            disabled={disabled}
            onChange={(e) => onAmountChange(sanitizeAmount(e.target.value))}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="
              focus-ring min-w-0 flex-1 bg-transparent text-2xl font-semibold
              text-ink-primary tabular-nums placeholder:text-ink-muted/60
              outline-none
            "
          />

          <button
            type="button"
            disabled={disabled}
            onClick={() => setPickerOpen(true)}
            className="
              focus-ring flex items-center gap-2 rounded-2xl border border-border-card
              bg-white/5 px-3 py-2 text-sm font-semibold text-ink-primary
              hover:bg-white/10 transition-colors
              disabled:cursor-not-allowed
            "
          >
            {token ? (
              <>
                <TokenIcon symbol={token.symbol} src={token.iconUrl} size={24} />
                <span>{token.symbol}</span>
              </>
            ) : (
              <span className="text-ink-secondary">Select</span>
            )}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5 L6 7.5 L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-ink-muted tabular-nums">
            {token && usdValue > 0 ? `≈ ${formatUsd(usdValue)}` : " "}
          </span>
          {error && (
            <span id={errorId} className="text-error font-medium">
              {error}
            </span>
          )}
        </div>

        <TokenPicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          tokens={tokens}
          selected={token}
          exclude={otherToken}
          onSelect={onTokenChange}
        />
      </div>
    );
  },
);
