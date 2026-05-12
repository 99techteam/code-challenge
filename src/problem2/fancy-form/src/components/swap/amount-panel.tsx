import { useRef } from "react";
import { Token } from "../../types";
import { TokenSelector } from "./token-selector";
import { cn, parseAmount } from "../../utils";
import { formatUSDValue } from "../../utils/format";

interface AmountPanelProps {
  label: string;
  sublabel: string;
  amount: string;
  token: Token;
  onAmountChange?: (value: string) => void;
  onTokenChange: (token: Token) => void;
  readonly?: boolean;
  excludeSymbol?: string;
  isLoading?: boolean;
}

export function AmountPanel({
  label,
  sublabel,
  amount,
  token,
  onAmountChange,
  onTokenChange,
  readonly = false,
  excludeSymbol,
  isLoading = false,
}: AmountPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const usdValue = formatUSDValue(parseAmount(amount), token?.price);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[\d.]*$/.test(val)) {
      onAmountChange?.(val);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-4 border transition-all duration-200",
        "bg-secondary/40 border-border/60",
        !readonly &&
          "hover:border-border focus-within:border-primary/40 focus-within:bg-secondary/60",
      )}
      onClick={() => !readonly && inputRef.current?.focus()}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{sublabel}</span>
          <span className="text-xs font-semibold text-foreground/80">
            {(token?.balance ?? 0).toLocaleString("en-US", {
              maximumFractionDigits: 4,
            })}
          </span>
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-9 flex items-center">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <input
              ref={inputRef}
              type="number"
              value={amount}
              onChange={handleInput}
              readOnly={readonly}
              placeholder="0.00"
              className={cn(
                "w-full bg-transparent text-2xl sm:text-3xl font-semibold",
                "text-foreground placeholder:text-muted-foreground/40",
                "outline-none caret-primary",
                readonly && "cursor-default",
              )}
            />
          )}

          <p className="text-xs text-muted-foreground mt-0.5 h-4">
            {parseAmount(amount) > 0 && !isLoading && usdValue}
          </p>
        </div>

        <TokenSelector
          value={token}
          onChange={onTokenChange}
          excludeSymbol={excludeSymbol}
        />
      </div>
    </div>
  );
}
