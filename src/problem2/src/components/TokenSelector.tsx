import { useState, useRef, useEffect } from "react";
import { TokenPrice } from "@/hooks/usePrices";
import TokenIcon from "@/components/TokenIcon";
import { MAX_DECIMALS } from "@/constant";

interface TokenSelectorProps {
  tokens: TokenPrice[];
  selectedToken: TokenPrice | null;
  onSelect: (token: TokenPrice) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  disabled = false,
  placeholder = "Select token",
}: TokenSelectorProps) {
  console.log("🚀 ~ TokenSelector ~ tokens:", tokens);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTokens = tokens.filter(
    (token) =>
      token.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (searchTerm === "" && token),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (token: TokenPrice) => {
    onSelect(token);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white border border-slate-300 rounded-full hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          {selectedToken ? (
            <>
              <TokenIcon symbol={selectedToken.currency} />
              <div className="text-left">
                <div className="font-semibold text-slate-900 text-sm">
                  {selectedToken.currency}
                </div>
              </div>
            </>
          ) : (
            <span className="text-slate-500 text-sm">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg">
          <div className="p-3 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 placeholder:text-slate-400"
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.currency}
                  onClick={() => handleSelect(token)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <TokenIcon symbol={token.currency} />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">
                      {token.currency}
                    </div>
                    <div className="text-xs text-slate-500">
                      ${token.price.toFixed(MAX_DECIMALS)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-slate-500">
                No tokens found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
