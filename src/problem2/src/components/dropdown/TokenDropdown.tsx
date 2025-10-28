import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import TokenIcon from "../icon/TokenIcon";

interface TokenPrice {
  currency: string;
  price: number;
  date: string;
}

interface TokenDropdownProps {
  tokens: TokenPrice[];
  selected: string;
  onSelect: (token: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TokenDropdown: React.FC<TokenDropdownProps> = ({
  tokens,
  selected,
  onSelect,
  placeholder = "Select token",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset search khi tokens thay đổi
  useEffect(() => {
    setSearch("");
  }, [tokens]);

  const filteredTokens = useMemo(() => {
    if (!search.trim()) return tokens;
    const searchTerm = search.toLowerCase().trim();
    return tokens.filter(token =>
      token.currency.toLowerCase().includes(searchTerm)
    );
  }, [search, tokens]);

  const handleSelectToken = useCallback(
    (token: string) => {
      onSelect(token);
      setIsOpen(false);
      setSearch("");
    },
    [onSelect]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setSearch("");
    }
  }, []);


  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`
          w-full border border-gray-300 px-4 py-3 rounded-xl 
          flex items-center justify-between transition-all duration-200
          bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${disabled 
            ? "bg-gray-100 cursor-not-allowed opacity-60 hover:border-gray-300" 
            : "cursor-pointer hover:shadow-sm"
          }
          ${isOpen ? "ring-2 ring-blue-500 border-transparent shadow-md" : ""}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selected ? (
            <>
              <TokenIcon token={selected} />
              <span className="font-semibold text-gray-900 truncate">{selected}</span>
            </>
          ) : (
            <span className="text-gray-500 truncate">{placeholder}</span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-2 max-h-80 overflow-hidden
            rounded-xl border border-gray-200 bg-white shadow-xl
            backdrop-blur-sm bg-white/95
          "
          role="listbox"
        >
          {/* Search input */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-3">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                         outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400 text-gray-900 transition-all duration-200"
                aria-autocomplete="list"
                aria-controls="token-list"
              />
            </div>
          </div>

          {/* Token list */}
          <div id="token-list" className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token, index) => (
                <button
                  key={`${token.currency}-${token.date}-${index}`}
                  type="button"
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 
                    text-left transition-all duration-200 group
                    hover:bg-blue-50 border-l-2 border-transparent
                    ${selected === token.currency 
                      ? "bg-blue-50 border-l-blue-500 text-blue-700" 
                      : "text-gray-700 hover:border-l-gray-300"
                    }
                  `}
                  onClick={() => handleSelectToken(token.currency)}
                  role="option"
                  aria-selected={selected === token.currency}
                >
                  <TokenIcon token={token.currency}/>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate transition-colors ${
                      selected === token.currency ? "text-blue-900" : "text-gray-900"
                    }`}>
                      {token.currency}
                    </div>
                    {token.price && (
                      <div className={`text-sm truncate ${
                        selected === token.currency ? "text-blue-600" : "text-gray-500"
                      }`}>
                        ${token.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {selected === token.currency && (
                    <svg 
                      className="w-5 h-5 text-blue-500 flex-shrink-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <svg 
                  className="w-12 h-12 text-gray-300 mx-auto mb-3"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No tokens found</p>
                <p className="text-gray-400 text-sm mt-1">Try searching with different terms</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default TokenDropdown;