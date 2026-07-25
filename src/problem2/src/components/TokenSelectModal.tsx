import { useEffect, useMemo, useRef, useState } from 'react'
import type { Token } from '../types'
import { TokenIcon } from './TokenIcon'
import { formatBalance, formatUsd } from '../utils/format'

interface TokenSelectModalProps {
  open: boolean
  tokens: Token[]
  /** Symbol to visually mark as selected. */
  selectedSymbol?: string
  /** Symbol to disable (e.g. the token chosen on the other side). */
  disabledSymbol?: string
  onSelect: (token: Token) => void
  onClose: () => void
}

/**
 * A searchable, keyboard-accessible token picker rendered as a modal dialog.
 */
export function TokenSelectModal({
  open,
  tokens,
  selectedSymbol,
  disabledSymbol,
  onSelect,
  onClose,
}: TokenSelectModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      // Focus the search box shortly after the modal mounts.
      const t = setTimeout(() => inputRef.current?.focus(), 40)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tokens
    return tokens.filter((t) => t.symbol.toLowerCase().includes(q))
  }, [tokens, query])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select a token"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-900/95 shadow-2xl animate-scale-in sm:max-w-md sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">Select a token</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-indigo-400/60 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or ticker"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <ul className="slim-scroll mt-3 flex-1 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-slate-500">
              No tokens match “{query}”.
            </li>
          )}
          {filtered.map((token) => {
            const isSelected = token.symbol === selectedSymbol
            const isDisabled = token.symbol === disabledSymbol
            return (
              <li key={token.symbol}>
                <button
                  disabled={isDisabled}
                  onClick={() => onSelect(token)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition
                    ${isDisabled ? 'cursor-not-allowed opacity-35' : 'hover:bg-white/10'}
                    ${isSelected ? 'bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/40' : ''}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                >
                  <TokenIcon symbol={token.symbol} iconUrl={token.iconUrl} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-white">{token.symbol}</span>
                    <span className="block text-xs text-slate-400">{formatUsd(token.price)}</span>
                  </span>
                  <span className="text-right text-xs text-slate-400">
                    <span className="block text-slate-500">Balance</span>
                    <span className="block font-medium text-slate-300">
                      {formatBalance(token.balance)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
