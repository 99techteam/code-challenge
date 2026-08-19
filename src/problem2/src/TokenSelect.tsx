import { useEffect, useRef, useState } from 'react';
import type { Token } from './types';
import { TokenIcon } from './TokenIcon';

interface Props {
  tokens: Token[];
  value: Token | null;
  onChange: (token: Token) => void;
  label: string;
}

export function TokenSelect({ tokens, value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = tokens.filter((t) =>
    t.symbol.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="token-select" ref={rootRef}>
      <button
        type="button"
        className="token-select__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
      >
        {value ? (
          <>
            <TokenIcon symbol={value.symbol} />
            <span>{value.symbol}</span>
          </>
        ) : (
          <span className="token-select__placeholder">Select token</span>
        )}
        <span className="token-select__chevron">▾</span>
      </button>

      {open && (
        <div className="token-select__panel">
          <input
            autoFocus
            className="token-select__search"
            placeholder="Search token"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="token-select__list">
            {filtered.length === 0 && (
              <li className="token-select__empty">No tokens found</li>
            )}
            {filtered.map((token) => (
              <li key={token.symbol}>
                <button
                  type="button"
                  className="token-select__option"
                  onClick={() => {
                    onChange(token);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <TokenIcon symbol={token.symbol} />
                  <span>{token.symbol}</span>
                  <span className="token-select__price">
                    ${token.price < 1 ? token.price.toPrecision(4) : token.price.toFixed(2)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
