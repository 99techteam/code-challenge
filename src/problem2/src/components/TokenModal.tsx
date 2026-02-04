import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TokenPrice } from "../lib/prices";
import { buildTokenIconUrl } from "../lib/prices";
import { formatUsd } from "../lib/format";

type Props = {
  open: boolean;
  title: string;
  tokens: TokenPrice[];
  selectedSymbol: string;
  onSelect: (sym: string) => void;
  onClose: () => void;
};

export default function TokenModal({
  open,
  title,
  tokens,
  selectedSymbol,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    // Focus on open
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) => t.symbol.toLowerCase().includes(q));
  }, [tokens, query]);

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <div className="modal__title">{title}</div>
            <div className="modal__subtitle">Search and pick a token</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal__search">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol e.g. USDC, ETH"
            className="input"
          />
        </div>

        <div className="token-list" role="listbox" aria-label="Token list">
          {filtered.length === 0 ? (
            <div className="token-list__empty" role="alert">
              No tokens found.
            </div>
          ) : (
            filtered.map((t, idx) => {
              const isSelected = t.symbol === selectedSymbol;

              return (
                <div
                  key={t.symbol}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className={`token-row ${isSelected ? "token-row--selected" : ""}`}
                  onClick={() => onSelect(t.symbol)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(t.symbol);
                    }
                  }}
                >
                  <TokenIcon symbol={t.symbol} />
                  <div className="token-row__mid">
                    <div className="token-row__symbol">{t.symbol}</div>
                    <div className="token-row__meta">
                      Updated {new Date(t.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="token-row__right">{formatUsd(t.price)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function TokenIcon({ symbol }: { symbol: string }) {
  const [errored, setErrored] = useState(false);
  const url = buildTokenIconUrl(symbol);

  if (errored) {
    return (
      <div className="token-icon token-icon--fallback">
        {symbol.slice(0, 1)}
      </div>
    );
  }

  return (
    <img
      className="token-icon"
      src={url}
      alt={symbol}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
