import { useState, useRef, useEffect } from 'react'
import './TokenSelector.css'

const TOKEN_ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'

function TokenIcon({ currency, className = '' }) {
  const [failed, setFailed] = useState(false)
  const src = `${TOKEN_ICON_BASE}/${currency}.svg`
  if (failed) {
    return (
      <span className={`token-icon token-icon--fallback ${className}`} title={currency}>
        {currency.slice(0, 2)}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      className={`token-icon ${className}`}
      onError={() => setFailed(true)}
    />
  )
}

export function TokenSelector({ tokens, value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const listRef = useRef(null)

  const filtered = search.trim()
    ? tokens.filter((t) =>
        t.currency.toLowerCase().includes(search.trim().toLowerCase())
      )
    : tokens

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (!el) return
    const selected = el.querySelector('[data-selected]')
    if (selected) selected.scrollIntoView({ block: 'nearest' })
  }, [open, value])

  const selectedToken = tokens.find((t) => t.currency === value)

  return (
    <div className="token-selector">
      <button
        type="button"
        className="token-selector-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select token"
      >
        {selectedToken ? (
          <>
            <TokenIcon currency={selectedToken.currency} />
            <span className="token-selector-symbol">{selectedToken.currency}</span>
            <svg className="token-selector-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </>
        ) : (
          <span className="token-selector-placeholder">Select</span>
        )}
      </button>

      {open && (
        <>
          <div
            className="token-selector-backdrop"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            ref={listRef}
            className="token-selector-dropdown"
            role="listbox"
            aria-label="Token list"
          >
            <div className="token-selector-search">
              <input
                type="text"
                placeholder="Search token"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="token-selector-search-input"
                autoFocus
                aria-label="Search token"
              />
            </div>
            <ul className="token-selector-list">
              {filtered.length === 0 ? (
                <li className="token-selector-empty">No token found</li>
              ) : (
                filtered.map((token) => (
                  <li key={token.currency}>
                    <button
                      type="button"
                      className="token-selector-option"
                      onClick={() => {
                        onChange(token.currency)
                        setOpen(false)
                      }}
                      role="option"
                      aria-selected={token.currency === value}
                      data-selected={token.currency === value || undefined}
                    >
                      <TokenIcon currency={token.currency} />
                      <span className="token-option-symbol">{token.currency}</span>
                      <span className="token-option-price">
                        ${token.price < 0.01 ? token.price.toExponential(2) : token.price.toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
