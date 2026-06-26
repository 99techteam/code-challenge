import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Token } from '../types';
import { formatUsd } from '../lib/tokens';
import { TokenIcon } from './TokenIcon';

interface Props {
  open: boolean;
  tokens: Token[];
  /** Symbol to disable (already selected on the other side). */
  excludeSymbol?: string;
  onSelect: (token: Token) => void;
  onClose: () => void;
}

/** Modal dialog that lets the user search and pick a token. */
export function TokenSelect({
  open,
  tokens,
  excludeSymbol,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset search and focus the field whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setQuery('');
      // Focus after the open transition starts.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return tokens;
    return tokens.filter((t) => t.symbol.toUpperCase().includes(q));
  }, [tokens, query]);

  if (!open) return null;

  // Portal to <body> so the fixed overlay escapes the swap-card's containing
  // block (the card's backdrop-filter would otherwise clip it to the card).
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Select a token"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h3>Select a token</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          className="modal__search"
          placeholder="Search name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ul className="token-list">
          {filtered.length === 0 && (
            <li className="token-list__empty">No tokens match “{query}”.</li>
          )}
          {filtered.map((token) => {
            const disabled = token.symbol === excludeSymbol;
            return (
              <li key={token.symbol}>
                <button
                  className="token-list__item"
                  disabled={disabled}
                  onClick={() => onSelect(token)}
                >
                  <TokenIcon symbol={token.symbol} src={token.icon} size={36} />
                  <span className="token-list__symbol">{token.symbol}</span>
                  <span className="token-list__price">
                    {formatUsd(token.price)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
