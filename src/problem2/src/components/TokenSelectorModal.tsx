import { useState, useEffect, useRef, useCallback } from "react";
import type { Token } from "../types";
import { formatUSD } from "../utils/format";

interface TokenSelectorModalProps {
  onClose: () => void;
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
}

function TokenIcon({ token, size = 32 }: { token: Token; size?: number }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {token.currency.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={token.iconUrl}
      alt={token.currency}
      width={size}
      height={size}
      className="rounded-full flex-shrink-0 object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export { TokenIcon };

export default function TokenSelectorModal({
  onClose,
  tokens,
  selectedToken,
  onSelect,
}: TokenSelectorModalProps) {
  const [search, setSearchRaw] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Wrap setSearch to also reset highlight index
  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setHighlightIndex(-1);
  }, []);

  const filtered = tokens.filter((t) =>
    t.currency.toLowerCase().includes(search.toLowerCase()),
  );

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0) {
      const el = itemRefs.current.get(highlightIndex);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1,
        );
      } else if (
        e.key === "Enter" &&
        highlightIndex >= 0 &&
        highlightIndex < filtered.length
      ) {
        e.preventDefault();
        onSelect(filtered[highlightIndex]);
        onClose();
      }
    },
    [filtered, highlightIndex, onClose, onSelect],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-[400px] max-h-[85vh] sm:max-h-[520px] flex flex-col overflow-hidden animate-[slideUp_0.25s_ease-out] sm:animate-[fadeInScale_0.2s_ease-out] shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h3 className="text-gray-900 font-semibold text-base">
            Select a token
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4L14 14M4 14L14 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 pt-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token name..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Token list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar"
        >
          {filtered.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-10">
              No tokens found
            </div>
          ) : (
            filtered.map((token, index) => {
              const isSelected = selectedToken?.currency === token.currency;
              const isHighlighted = index === highlightIndex;
              return (
                <button
                  key={token.currency}
                  ref={(el) => {
                    if (el) itemRefs.current.set(index, el);
                  }}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  onMouseEnter={() => setHighlightIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                    isSelected
                      ? "bg-blue-50 border border-blue-200"
                      : isHighlighted
                        ? "bg-gray-100 border border-transparent"
                        : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <TokenIcon token={token} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-semibold text-sm">
                      {token.currency}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatUSD(token.price)}
                    </div>
                  </div>
                  {isSelected && (
                    <svg
                      className="text-blue-500 flex-shrink-0"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
