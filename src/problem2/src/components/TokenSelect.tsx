import { useEffect, useMemo, useRef, useState } from "react";
import type { TokenOption } from "@types";

type TokenSelectProps = {
  tokens: TokenOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export default function TokenSelect({
  tokens,
  value,
  onChange,
  label = "Select token",
}: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const [iconErrorMap, setIconErrorMap] = useState<Record<string, boolean>>({});
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedToken = useMemo(
    () => tokens.find((token) => token.currency === value),
    [tokens, value]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderTokenIcon = (token: TokenOption) => {
    const hasIconError = iconErrorMap[token.currency];

    if (hasIconError) {
      return (
        <div className="token-icon-fallback">{token.currency.slice(0, 1)}</div>
      );
    }

    return (
      <img
        src={token.icon}
        alt={token.currency}
        className="token-icon"
        onError={() => {
          setIconErrorMap((prev) => ({
            ...prev,
            [token.currency]: true,
          }));
        }}
      />
    );
  };

  return (
    <div className="token-select" ref={rootRef}>
      <button
        type="button"
        className={`token-select-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <div className="token-select-trigger-left">
          {selectedToken ? (
            <>
              {renderTokenIcon(selectedToken)}
              <div className="token-select-text">
                <span className="token-select-symbol">
                  {selectedToken.currency}
                </span>
                <span className="token-select-subtitle">Token</span>
              </div>
            </>
          ) : (
            <span className="token-select-placeholder">Select</span>
          )}
        </div>

        <span className={`token-select-chevron ${open ? "rotate" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div className="token-select-menu" role="listbox">
          {tokens.map((token) => (
            <button
              key={token.currency}
              type="button"
              className={`token-option ${
                token.currency === value ? "active" : ""
              }`}
              onClick={() => {
                onChange(token.currency);
                setOpen(false);
              }}
            >
              <div className="token-option-left">
                {renderTokenIcon(token)}
                <div className="token-select-text">
                  <span className="token-select-symbol">{token.currency}</span>
                  <span className="token-select-subtitle">
                    ${token.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {token.currency === value && (
                <span className="token-option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
