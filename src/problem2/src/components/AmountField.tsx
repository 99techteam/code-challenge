import type { CSSProperties, Ref } from 'react';
import { useId } from 'react';

import { TokenSelect } from '@/components/TokenSelect';
import { cn } from '@/lib/utils';
import type { SwapSide, Token } from '@/types';

interface AmountFieldProps {
  side: SwapSide;
  /** Eyebrow above the amount — "From" or "To". */
  label: string;
  value: string;
  token: Token | null;
  tokens: Token[];
  /** Validation message shown under the panel, or `null` when the amount is fine. */
  error?: string | null;
  onValueChange: (raw: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelectToken: (code: string) => void;
  /** Raised above the card while the panels are trading places. */
  elevated?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

/**
 * One half of the converter: an eyebrow, an editable amount and an asset picker.
 *
 * Both halves are editable and symmetric — typing into either one drives the
 * other — so this renders the same component twice rather than an input and a
 * read-only result.
 */
export function AmountField({
  side,
  label,
  value,
  token,
  tokens,
  error = null,
  onValueChange,
  onFocus,
  onBlur,
  onSelectToken,
  elevated = false,
  className,
  style,
  ref,
}: AmountFieldProps) {
  const errorId = useId();

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'rounded-2xl bg-muted px-3.5 pt-3.5 pb-3 will-change-transform',
        'transition-shadow duration-200 ease-standard',
        elevated && 'shadow-lift',
        // Tracks the amount input only — the asset picker carries its own ring.
        error ? 'has-[input:focus]:shadow-field-invalid' : 'has-[input:focus]:shadow-field-focus',
        className,
      )}
    >
      <span className="mb-2 block text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">
        {label}
      </span>

      <div className="flex items-center gap-2.5">
        <input
          inputMode="decimal"
          autoComplete="off"
          aria-label={`${label} amount`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder="0.00"
          value={value}
          disabled={!token}
          onChange={(event) => {
            onValueChange(event.target.value);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          className="h-10 min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[28px] font-medium tracking-[-0.015em] tabular-nums text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        <TokenSelect side={side} value={token} tokens={tokens} onSelect={onSelectToken} />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
