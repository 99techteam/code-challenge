import { useState, useRef, useEffect, forwardRef } from 'react'
import type { ChangeEvent } from 'react'
import type { TokenInfo } from '../problems/problem2/types'

interface TokenSelectorProps {
  name: string
  tokens: TokenInfo[]
  value?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  hasError?: boolean
  placeholder?: string
  disabledSymbol?: string
}

const TokenSelector = forwardRef<HTMLInputElement, TokenSelectorProps>(
  ({ name, tokens, value, onChange, onBlur, hasError, placeholder, disabledSymbol }, ref) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const selected = tokens.find((t) => t.symbol === value)

    const filtered = tokens.filter((t) => {
      if (!search) {
        return true
      }
      return t.symbol.toLowerCase().includes(search.toLowerCase())
    })

    const openDropdown = () => {
      setSearch('')
      setOpen(true)
    }

    const closeDropdown = () => {
      setOpen(false)
      setSearch('')
      onBlur()
    }

    const selectToken = (symbol: string) => {
      if (symbol === disabledSymbol) {
        return
      }
      const syntheticEvent = {
        target: { name, value: symbol },
        type: 'change',
      } as ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
      closeDropdown()
    }

    useEffect(() => {
      if (open) {
        searchRef.current?.focus()
      }
    }, [open])

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
          setSearch('')
          onBlur()
        }
      }
      if (open) {
        document.addEventListener('mousedown', handleClick)
      }
      return () => document.removeEventListener('mousedown', handleClick)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    return (
      <div ref={containerRef} className="relative">
        {/* Hidden input for react-hook-form ref */}
        <input
          ref={ref}
          name={name}
          type="hidden"
          value={value ?? ''}
          readOnly
        />

        {/* Trigger button */}
        <button
          type="button"
          onClick={openDropdown}
          className={[
            'flex items-center gap-2 px-3 py-2.5 rounded-xl border w-full min-w-40',
            'text-sm font-medium transition-all duration-150 cursor-pointer',
            open
              ? 'border-(--accent) ring-2 ring-(--accent-border) bg-(--bg)'
              : hasError
                ? 'border-red-400 bg-(--bg)'
                : 'border-(--border) bg-(--bg) hover:border-(--accent-border)',
          ].join(' ')}
        >
          {selected
            ? (
                <>
                  <img
                    src={selected.imageUrl}
                    alt={selected.symbol}
                    className="w-5 h-5 rounded-full shrink-0"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="text-(--text-h)">{selected.symbol}</span>
                  <span className="ml-auto text-xs text-(--text)">
                    ${selected.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </>
              )
            : (
                <span className="text-(--text)">{placeholder ?? 'Select token'}</span>
              )}
          <svg
            className={[
              'ml-auto w-3.5 h-3.5 text-(--text) shrink-0 transition-transform duration-150',
              open ? 'rotate-180' : '',
            ].join(' ')}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Popover */}
        <div
          className={[
            'absolute z-50 top-full left-0 mt-1.5 w-full min-w-55',
            'bg-(--bg) border border-(--border) rounded-xl shadow-(--shadow)',
            'transition-all duration-150 origin-top',
            open
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none',
          ].join(' ')}
        >
          {/* Search */}
          <div className="p-2 border-b border-(--border)">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token..."
              className={[
                'w-full px-3 py-1.5 rounded-lg text-sm bg-(--code-bg)',
                'text-(--text-h) placeholder:text-(--text)',
                'border border-transparent focus:outline-none focus:border-(--accent)',
                'transition-colors duration-150',
              ].join(' ')}
            />
          </div>

          {/* List */}
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto py-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {filtered.length === 0
              ? (
                  <li className="px-4 py-3 text-sm text-(--text) text-center">
                    No tokens found
                  </li>
                )
              : filtered.map((token) => {
                  const isSelected = token.symbol === value
                  const isDisabled = token.symbol === disabledSymbol

                  return (
                    <li
                      key={token.symbol}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectToken(token.symbol)}
                      className={[
                        'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors duration-100',
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                            ? 'bg-(--accent-bg) text-(--accent)'
                            : 'hover:bg-(--code-bg)',
                      ].join(' ')}
                    >
                      <img
                        src={token.imageUrl}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full shrink-0"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-(--text-h) leading-tight">
                          {token.symbol}
                        </span>
                      </div>
                      <span className="ml-auto text-xs text-(--text) shrink-0">
                        ${token.price.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-(--accent) shrink-0" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </li>
                  )
                })}
          </ul>
        </div>
      </div>
    )
  },
)

TokenSelector.displayName = 'TokenSelector'

export default TokenSelector
