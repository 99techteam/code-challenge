import React, { useState, useRef, useEffect } from 'react';
import type { Token } from '../../types';
import { formatPrice } from '../../utils/format';
import './TokenSelector.scss';

interface Props {
  label: string;
  tokens: Token[];
  selected: Token | null;
  onSelect: (token: Token) => void;
  disabled?: boolean;
}

const TokenSelector: React.FC<Props> = ({ label, tokens, selected, onSelect, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = tokens.filter((t) =>
    t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const handleSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="token-selector" ref={ref}>
      <span className="token-selector__label">{label}</span>
      <button
        type="button"
        className={`token-selector__trigger ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        {selected ? (
          <>
            <img
              src={selected.iconUrl}
              alt={selected.symbol}
              className="token-selector__icon"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=${selected.symbol}&background=6366f1&color=fff&size=32&bold=true`;
              }}
            />
            <span className="token-selector__symbol">{selected.symbol}</span>
          </>
        ) : (
          <span className="token-selector__placeholder">Select token</span>
        )}
        <svg className="token-selector__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="token-selector__dropdown" role="listbox">
          <div className="token-selector__search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="token-selector__search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              className="token-selector__search"
              placeholder="Search token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="token-selector__list">
            {filtered.length === 0 ? (
              <div className="token-selector__empty">No tokens found</div>
            ) : (
              filtered.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  className={`token-selector__item ${selected?.symbol === token.symbol ? 'selected' : ''}`}
                  onClick={() => handleSelect(token)}
                  role="option"
                  aria-selected={selected?.symbol === token.symbol}
                >
                  <img
                    src={token.iconUrl}
                    alt={token.symbol}
                    className="token-selector__item-icon"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=32&bold=true`;
                    }}
                  />
                  <span className="token-selector__item-symbol">{token.symbol}</span>
                  <div className="token-selector__item-info">
                    <span className="token-selector__item-price">
                      ${formatPrice(token.price)}
                    </span>
                    {token.balance !== undefined && token.balance > 0 && (
                      <span className="token-selector__item-balance">
                        Balance: {token.balance.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
