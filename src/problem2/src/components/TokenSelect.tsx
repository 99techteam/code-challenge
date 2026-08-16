import { useEffect, useMemo, useRef, useState } from "react";
import { TokenIcon } from "./TokenIcon";

interface TokenSelectProps {
  label: string;
  currencies: string[];
  value: string;
  onChange: (currency: string) => void;
  disabledCurrency?: string;
}

export function TokenSelect({
  label,
  currencies,
  value,
  onChange,
  disabledCurrency,
}: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter((c) => c.toLowerCase().includes(q));
  }, [currencies, query]);

  function handleSelect(currency: string) {
    if (currency === disabledCurrency) return;
    onChange(currency);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="token-select" ref={rootRef}>
      <span className="token-select__label">{label}</span>
      <button
        type="button"
        className="token-select__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <TokenIcon currency={value} />
        <span className="token-select__value">{value}</span>
        <span className="token-select__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="token-select__dropdown" role="listbox">
          <input
            autoFocus
            type="text"
            className="token-select__search"
            placeholder="Search token..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="token-select__list">
            {filtered.length === 0 && (
              <li className="token-select__empty">No tokens found</li>
            )}
            {filtered.map((currency) => {
              const isDisabled = currency === disabledCurrency;
              return (
                <li key={currency}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={currency === value}
                    disabled={isDisabled}
                    className="token-select__option"
                    onClick={() => handleSelect(currency)}
                  >
                    <TokenIcon currency={currency} size={22} />
                    <span>{currency}</span>
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
