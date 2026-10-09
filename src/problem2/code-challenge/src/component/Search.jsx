import { useEffect, useRef, useState } from 'react'

function TokenBadge({ currency }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.06]">
      <img alt="" className="size-full rounded-full object-contain" src={currency.icon} />
    </span>
  )
}

function Search({ currencies, onClose, onSelect, selectedCurrency }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const filteredCurrencies = currencies.filter((currency) => {
    const searchTerm = query.trim().toLowerCase()
    return currency.name.toLowerCase().includes(searchTerm)
      || currency.symbol.toLowerCase().includes(searchTerm)
  })
  const isSelected = (currency) => (
    currency.symbol.toLowerCase() === selectedCurrency.toLowerCase()
  )

  useEffect(() => {
    inputRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <section
      aria-labelledby="token-search-title"
      className="overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#11131b]/95 shadow-[0_28px_100px_-35px_rgba(0,0,0,0.9)]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-white" id="token-search-title">Select a token</h2>
          <p className="mt-1 text-xs text-slate-500">Search by token name or symbol</p>
        </div>
        <button
          aria-label="Close token search"
          className="grid size-9 place-items-center rounded-lg text-xl leading-none text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0c0e15] px-3.5 py-3 transition focus-within:border-violet-400/50">
          <svg aria-hidden="true" className="size-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            aria-label="Search tokens"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or symbol"
            ref={inputRef}
            type="search"
            value={query}
          />
        </label>

        <div className="token-list-scrollbar mt-4 max-h-72 space-y-1 overflow-y-auto">
          {filteredCurrencies.map((currency) => (
            <button
              aria-pressed={isSelected(currency)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              key={currency.symbol}
              onClick={() => onSelect(currency.symbol)}
              type="button"
            >
              <TokenBadge currency={currency} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-white">{currency.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{currency.symbol}</span>
              </span>
              {isSelected(currency) && (
                <span className="text-xs font-medium text-violet-300">Selected</span>
              )}
            </button>
          ))}
          {filteredCurrencies.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-slate-500">No tokens found.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Search
