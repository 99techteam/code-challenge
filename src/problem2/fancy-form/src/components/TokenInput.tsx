import { TokenSelector } from './TokenSelector'
import type { Token } from '@/types/swap'

interface TokenInputProps {
  label: string
  token: Token | null
  amount: string
  onAmountChange?: (value: string) => void
  onTokenSelect: (token: Token) => void
  tokens: Token[]
  readonly?: boolean
  error?: string
  disabledToken?: Token | null
}

export function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  tokens,
  readonly,
  error,
  disabledToken,
}: TokenInputProps) {
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onAmountChange?.(val)
    }
  }

  return (
    <div className={`rounded-xl bg-muted/50 border p-4 transition-colors ${error ? 'border-destructive' : 'border-border focus-within:border-ring'}`}>
      <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{label}</div>
      <div className="flex items-center gap-3">
        <TokenSelector
          selected={token}
          onSelect={onTokenSelect}
          tokens={tokens}
          disabledToken={disabledToken}
        />
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          disabled={readonly}
          placeholder="0.0"
          className="flex-1 min-w-0 bg-transparent text-right text-2xl font-semibold outline-none placeholder:text-muted-foreground/50 disabled:cursor-default"
        />
      </div>
      {token && (
        <div className="text-right text-xs text-muted-foreground mt-1.5">
          {amount && parseFloat(amount) > 0
            ? `≈ $${(parseFloat(amount) * token.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `1 ${token.symbol} = $${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
          }
        </div>
      )}
      {error && <div className="text-xs text-destructive mt-1">{error}</div>}
    </div>
  )
}
