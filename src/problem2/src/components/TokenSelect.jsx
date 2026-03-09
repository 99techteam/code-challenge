import React, { useState, useRef, useEffect } from "react";
import { TokenIcon } from "./TokenIcon";

export function TokenSelect({ tokens, selectedToken, onSelect, label, disabled }) {
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (listRef.current && !listRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div className="token-select" ref={listRef}>
      <label className="token-select-label">{label}</label>
      <button
        type="button"
        className="token-select-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selectedToken ? (
          <>
            <TokenIcon
              src={selectedToken.imageUrl}
              symbol={selectedToken.currency}
              priority
            />
            <span className="token-select-symbol">{selectedToken.currency}</span>
            <span className="token-select-chevron" aria-hidden>▼</span>
          </>
        ) : (
          <span className="token-select-placeholder">Select token</span>
        )}
      </button>
      {open && (
        <ul className="token-select-list" role="listbox" aria-label={label}>
          {tokens.map((token) => (
            <li key={token.currency} role="option" aria-selected={selectedToken?.currency === token.currency}>
              <button
                type="button"
                className="token-select-option"
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                }}
              >
                <TokenIcon src={token.imageUrl} symbol={token.currency} />
                <span className="token-select-option-symbol">{token.currency}</span>
                <span className="token-select-option-name">{token.currency}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
