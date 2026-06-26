import { useState, useRef, useEffect } from "react";
import type { Token } from "../types";

interface Props {
  label: string;
  tokens: Token[];
  value: Token | null;
  onChange: (token: Token) => void;
  disabled?: boolean;
}

/**
 * A searchable token dropdown.
 *
 * Shows an icon + symbol for the selected token, opens a filterable list
 * on click, and closes when the user clicks outside.
 */
export function TokenSelect({ label, tokens, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? tokens.filter((t) =>
        t.symbol.toLowerCase().includes(query.toLowerCase())
      )
    : tokens;

  // Close when the user clicks anywhere outside this component.
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSelect(token: Token) {
    onChange(token);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="token-select" ref={containerRef}>
      <span className="token-select__label">{label}</span>

      <button
        type="button"
        className="token-select__trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value ? (
          <>
            <img
              src={value.iconUrl}
              alt={value.symbol}
              className="token-icon"
              // Hide the broken-image placeholder if the CDN doesn't have this token.
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="token-select__symbol">{value.symbol}</span>
          </>
        ) : (
          <span className="token-select__placeholder">Select token</span>
        )}
        <span className="token-select__arrow" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="token-select__menu" role="listbox">
          <input
            className="token-select__search"
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <ul className="token-select__list">
            {filtered.length > 0 ? (
              filtered.map((token) => (
                <li
                  key={token.symbol}
                  role="option"
                  aria-selected={token.symbol === value?.symbol}
                  className={[
                    "token-select__item",
                    token.symbol === value?.symbol
                      ? "token-select__item--active"
                      : "",
                  ]
                    .join(" ")
                    .trim()}
                  onClick={() => handleSelect(token)}
                >
                  <img
                    src={token.iconUrl}
                    alt={token.symbol}
                    className="token-icon"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span>{token.symbol}</span>
                </li>
              ))
            ) : (
              <li className="token-select__empty">No tokens found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
