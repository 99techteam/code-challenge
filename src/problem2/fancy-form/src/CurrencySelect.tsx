import React, { useEffect, useRef, useState } from "react";
import { Rate, getIconFor } from "./rates";
import styles from "./CurrencySelect.module.css";

type Props = {
  id?: string;
  currencies: Rate[];
  selected: Rate;
  onSelect: (r: Rate) => void;
};

export default function CurrencySelect({
  id,
  currencies,
  selected,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<number>(-1);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(-1);
      // focus search box when opening
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div id={id} className={styles.currencyPicker} ref={pickerRef}>
      <button
        type="button"
        className={styles.currencyToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        {getIconFor(selected) ? (
          <img
            src={getIconFor(selected) as string}
            alt={selected}
            className={styles.tokenIcon}
          />
        ) : (
          <div className={styles.tokenPlaceholder} />
        )}
        <span className={styles.currencyLabel}>{selected}</span>
        <span className={styles.chev}>▾</span>
      </button>

      {open && (
        <div className={styles.currencyOptionsWrapper}>
          <div className={styles.searchWrapper}>
            <input
              ref={searchRef}
              className={styles.searchInput}
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlighted(-1);
              }}
              onKeyDown={(e) => {
                const filtered = filteredCurrencies();
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlighted((h) => Math.max(h - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (highlighted >= 0 && filtered[highlighted]) {
                    onSelect(filtered[highlighted] as Rate);
                    setOpen(false);
                  }
                }
              }}
            />
          </div>
          <ul className={styles.currencyOptions} role="listbox">
            {filteredCurrencies().map((c, idx) => (
              <li
                key={c}
                role="option"
                aria-selected={c === selected}
                className={`${styles.currencyOption} ${
                  c === selected ? styles.selected : ""
                } ${idx === highlighted ? styles.highlighted : ""}`}
                onMouseEnter={() => setHighlighted(idx)}
                onMouseLeave={() => setHighlighted(-1)}
                onClick={() => {
                  onSelect(c as Rate);
                  setOpen(false);
                }}
              >
                {getIconFor(c as Rate) ? (
                  <img
                    src={getIconFor(c as Rate) as string}
                    alt={c}
                    className={styles.tokenIcon}
                  />
                ) : (
                  <div className={styles.tokenPlaceholder} />
                )}
                <span className={styles.currencyLabel}>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  function filteredCurrencies(): Rate[] {
    if (!query) return currencies as Rate[];
    const q = query.toLowerCase();
    return (currencies as Rate[]).filter((c) => c.toLowerCase().includes(q));
  }
}
