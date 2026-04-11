import { useState, useRef, useEffect } from 'react';
import type { Token } from '../types';
import styles from './TokenSelect.module.css';

interface Props {
  tokens: Token[];
  value: Token | null;
  onChange: (token: Token) => void;
  label: string;
}

export function TokenSelect({ tokens, value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = tokens.filter((t) =>
    t.currency.toLowerCase().includes(search.toLowerCase())
  );

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(token: Token) {
    onChange(token);
    setOpen(false);
    setSearch('');
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value ? (
          <>
            <TokenIcon currency={value.currency} iconUrl={value.iconUrl} />
            <span className={styles.currency}>{value.currency}</span>
          </>
        ) : (
          <span className={styles.placeholder}>Select token</span>
        )}
        <svg className={`${styles.chevron} ${open ? styles.open : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              autoFocus
              className={styles.search}
              placeholder="Search token…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className={styles.list}>
            {filtered.length === 0 && (
              <li className={styles.empty}>No tokens found</li>
            )}
            {filtered.map((token) => (
              <li
                key={token.currency}
                role="option"
                aria-selected={value?.currency === token.currency}
                className={`${styles.option} ${value?.currency === token.currency ? styles.selected : ''}`}
                onClick={() => handleSelect(token)}
              >
                <TokenIcon currency={token.currency} iconUrl={token.iconUrl} />
                <span className={styles.optionCurrency}>{token.currency}</span>
                <span className={styles.optionPrice}>${token.price.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TokenIcon({ currency, iconUrl }: { currency: string; iconUrl: string }) {
  const [errored, setErrored] = useState(false);
  return errored ? (
    <span className={styles.iconFallback}>{currency.slice(0, 2)}</span>
  ) : (
    <img
      className={styles.icon}
      src={iconUrl}
      alt={currency}
      onError={() => setErrored(true)}
    />
  );
}
