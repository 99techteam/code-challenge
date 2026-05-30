import { useEffect, useMemo, useRef, useState } from 'react';
import type { Token } from '../types';
import { TokenIcon } from './TokenIcon';
import { formatBalance, formatPrice } from '../format';

interface Props {
  tokens: Token[];
  value: Token | null;
  onChange: (token: Token) => void;
  excludeSymbol?: string | null;
  placeholder?: string;
}

// Searchable token dropdown. Trigger shows the selected token (icon +
// symbol); opening the panel reveals a search box and a scrollable list.
// The list is filtered case-insensitively against the symbol, and any
// token matching `excludeSymbol` is greyed out and unselectable so the
// user cannot pick the same token on both sides of the swap.
export function TokenSelect({
  tokens,
  value,
  onChange,
  excludeSymbol = null,
  placeholder = 'Select a token',
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    // Focus the search input after the dropdown paints.
    queueMicrotask(() => inputRef.current?.focus());
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) => t.symbol.toLowerCase().includes(q));
  }, [tokens, query]);

  return (
    <div className="ts" ref={containerRef}>
      <button
        type="button"
        className={`ts-trigger ${value ? 'has-value' : 'placeholder'}`}
        onClick={() => setOpen((v) => !v)}
      >
        {value ? (
          <>
            <TokenIcon symbol={value.symbol} size={24} />
            <span className="ts-trigger-symbol">{value.symbol}</span>
          </>
        ) : (
          <span className="ts-trigger-placeholder">{placeholder}</span>
        )}
        <span className="ts-trigger-caret" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="ts-panel" role="listbox">
          <div className="ts-search-row">
            <input
              ref={inputRef}
              className="ts-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tokens..."
              autoComplete="off"
            />
          </div>
          <ul className="ts-list">
            {filtered.length === 0 && (
              <li className="ts-empty">No tokens match "{query}"</li>
            )}
            {filtered.map((t) => {
              const disabled = t.symbol === excludeSymbol;
              const selected = value?.symbol === t.symbol;
              return (
                <li key={t.symbol}>
                  <button
                    type="button"
                    className={`ts-option ${selected ? 'selected' : ''} ${
                      disabled ? 'disabled' : ''
                    }`}
                    onClick={() => {
                      if (disabled) return;
                      onChange(t);
                      setOpen(false);
                    }}
                    disabled={disabled}
                    title={
                      disabled
                        ? 'Already selected on the other side'
                        : undefined
                    }
                  >
                    <TokenIcon symbol={t.symbol} size={28} />
                    <span className="ts-option-main">
                      <span className="ts-option-symbol">{t.symbol}</span>
                      <span className="ts-option-balance">
                        Balance: {formatBalance(t.balance)}
                      </span>
                    </span>
                    <span className="ts-option-price mono">
                      {formatPrice(t.price)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
