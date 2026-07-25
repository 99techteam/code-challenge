import type { Token } from '../types'
import { TokenIcon } from './TokenIcon'
import { formatBalance, formatUsd } from '../utils/format'

interface TokenFieldProps {
  label: string
  token: Token | null
  /** The raw string value shown in the input. */
  value: string
  /** Whether the amount input is editable. The receive side is read-only. */
  readOnly?: boolean
  /** USD value of the current amount, for the hint line. */
  usdValue: number
  onValueChange?: (value: string) => void
  onOpenSelect: () => void
  /** Called when the user clicks MAX (pay side only). */
  onMax?: () => void
  error?: string
}

/**
 * One side of the swap: a large amount input paired with a token selector
 * trigger, balance readout, and USD hint.
 */
export function TokenField({
  label,
  token,
  value,
  readOnly = false,
  usdValue,
  onValueChange,
  onOpenSelect,
  onMax,
  error,
}: TokenFieldProps) {
  return (
    <div
      className={`rounded-2xl border bg-white/[0.03] p-4 transition-colors
        ${error ? 'border-rose-500/50' : 'border-white/10 focus-within:border-indigo-400/50'}`}
    >
      <div className="mb-2 flex items-center justify-between text-xs font-medium">
        <span className="text-slate-400">{label}</span>
        {token && (
          <span className="text-slate-400">
            Balance:{' '}
            <span className="text-slate-300">{formatBalance(token.balance)}</span>{' '}
            {onMax && (
              <button
                type="button"
                onClick={onMax}
                className="ml-1 rounded-md px-1.5 py-0.5 font-semibold text-indigo-300 transition hover:bg-indigo-500/15 hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                MAX
              </button>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          inputMode="decimal"
          type="text"
          value={value}
          readOnly={readOnly}
          placeholder="0.0"
          aria-label={`${label} amount`}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={`min-w-0 flex-1 bg-transparent text-3xl font-semibold tracking-tight text-white placeholder:text-slate-600 focus:outline-none
            ${readOnly ? 'cursor-default text-slate-100' : ''}`}
        />

        <button
          type="button"
          onClick={onOpenSelect}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-3 font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {token ? (
            <>
              <TokenIcon symbol={token.symbol} iconUrl={token.iconUrl} size={26} />
              <span className="text-sm">{token.symbol}</span>
            </>
          ) : (
            <span className="pl-2 text-sm">Select</span>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mt-1.5 h-4 text-xs text-slate-500">
        {token && value && Number.isFinite(usdValue) ? formatUsd(usdValue) : ' '}
      </div>
    </div>
  )
}
