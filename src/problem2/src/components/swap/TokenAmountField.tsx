import { useId } from "react"

import { TokenSelect } from "@/components/swap/TokenSelect"
import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

type TokenAmountFieldProps = {
  label: string
  amount: string
  token: Token | null
  tokens: Token[]
  disabledSymbol?: string
  onAmountChange?: (next: string) => void
  onTokenChange: (token: Token) => void
  readOnlyAmount?: boolean
  error?: string | null
  usdValue?: number | null
}

export function TokenAmountField({
  label,
  amount,
  token,
  tokens,
  disabledSymbol,
  onAmountChange,
  onTokenChange,
  readOnlyAmount,
  error,
  usdValue,
}: TokenAmountFieldProps) {
  const inputId = useId()
  const isInvalid = Boolean(error)

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/60 p-4 transition-colors",
        isInvalid
          ? "border-destructive/60 ring-2 ring-destructive/20"
          : "border-border focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/20"
      )}
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
        >
          {label}
        </label>
        {token && (
          <span className="text-[11px] text-muted-foreground">
            1 {token.symbol} = ${" "}
            {token.price.toLocaleString("en-US", {
              maximumFractionDigits: 6,
            })}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={amount}
          readOnly={readOnlyAmount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          placeholder="0.0"
          aria-invalid={isInvalid}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-3xl font-semibold tracking-tight tabular-nums outline-none",
            "placeholder:text-muted-foreground/40",
            readOnlyAmount && "cursor-default"
          )}
        />
        <TokenSelect
          value={token}
          tokens={tokens}
          onChange={onTokenChange}
          disabledSymbol={disabledSymbol}
        />
      </div>
      <div className="mt-2 flex h-4 items-center justify-between text-xs">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <span className="text-muted-foreground">
            {usdValue != null && usdValue > 0
              ? `≈ $${usdValue.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}`
              : ""}
          </span>
        )}
      </div>
    </div>
  )
}
