import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { Token } from "./prices";
import { formatUsd } from "./format";
import TokenIcon from "./TokenIcon";

interface RowProps {
  token: Token;
  selected: boolean;
  onPick: (symbol: string) => void;
}

const TokenRow = memo(function TokenRow({ token, selected, onPick }: RowProps) {
  return (
    <li>
      <button
        type="button"
        className={selected ? "token-row selected" : "token-row"}
        aria-pressed={selected}
        onClick={() => onPick(token.symbol)}
      >
        <TokenIcon symbol={token.symbol} size={32} />
        <span className="token-name">{token.symbol}</span>
        <span className="token-price">{formatUsd(token.price)}</span>
      </button>
    </li>
  );
});

interface Props {
  open: boolean;
  tokens: Token[];
  selected: string;
  onPick: (symbol: string) => void;
  onClose: () => void;
}

// Native dialog gives focus trap, Escape handling and inert background for free.
export default function TokenPicker({ open, tokens, selected, onPick, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tokens.filter((t) => t.symbol.toLowerCase().includes(q)) : tokens;
  }, [tokens, query]);

  return (
    <dialog
      ref={ref}
      className="picker"
      aria-label="Select a token"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="picker-body">
          <header className="picker-head">
            <h2>Select a token</h2>
            <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <input
            className="picker-search"
            type="search"
            placeholder="Search by symbol"
            aria-label="Search tokens"
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {visible.length === 0 ? (
            <p className="picker-empty">No token matches "{query}"</p>
          ) : (
            <ul className="picker-list">
              {visible.map((t) => (
                <TokenRow key={t.symbol} token={t} selected={t.symbol === selected} onPick={onPick} />
              ))}
            </ul>
          )}
        </div>
      )}
    </dialog>
  );
}
