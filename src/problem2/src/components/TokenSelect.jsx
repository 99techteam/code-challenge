import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "../utils/format.js";

export default function TokenSelect({ ariaLabel, value, tokens, disabled = false, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const selectedToken = tokens.find((token) => token.symbol === value);

  function updateMenuPosition() {
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (!buttonRect) {
      return;
    }

    setMenuStyle({
      top: `${buttonRect.bottom + 8}px`,
      left: `${Math.max(12, buttonRect.right - 240)}px`,
      width: `${Math.max(220, buttonRect.width)}px`
    });
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target) && !event.target.closest("[data-token-menu]")) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, tokens.length]);

  function selectToken(symbol) {
    onChange(symbol);
    setIsOpen(false);
  }

  return (
    <div className="relative w-full min-[520px]:w-[150px]" ref={wrapperRef}>
      <button
        ref={buttonRef}
        className="focus-ring flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-left font-semibold text-slate-950 transition hover:border-blue-300 focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled || tokens.length === 0}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedToken ? (
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200">
              <img className="size-5 rounded-full" src={selectedToken.icon} alt="" />
            </span>
          ) : (
            <span className="size-6 shrink-0 rounded-full bg-slate-200" />
          )}
          <span className="truncate">{selectedToken?.symbol || "Select"}</span>
        </span>
        <svg className={`size-4 shrink-0 fill-current transition ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5.3 7.3 10 12l4.7-4.7 1.4 1.4-6.1 6.1-6.1-6.1 1.4-1.4Z" />
        </svg>
      </button>

      {isOpen && menuStyle ? createPortal(
        <div
          className="fixed z-[9999] max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl"
          data-token-menu
          role="listbox"
          style={menuStyle}
        >
          {tokens.map((token) => (
            <button
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50 ${
                token.symbol === value ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""
              }`}
              type="button"
              key={token.symbol}
              role="option"
              aria-selected={token.symbol === value}
              onClick={() => selectToken(token.symbol)}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200">
                <img className="size-6 rounded-full" src={token.icon} alt="" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-950">{token.symbol}</span>
                <span className="block truncate text-xs text-slate-500">{formatCurrency(token.price)}</span>
              </span>
            </button>
          ))}
        </div>,
        document.body
      ) : null}
    </div>
  );
}
