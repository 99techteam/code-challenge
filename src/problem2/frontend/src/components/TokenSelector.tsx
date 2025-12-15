import { useState, useRef, useEffect } from "react";
import { tokens, Token } from "../data/tokens";

interface TokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
}

const TokenSelector = ({
  selectedToken,
  onSelect,
  excludeToken,
}: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Toggle dropdown and check positioning
  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 400; // Approximate max height (80 * 4 + padding)
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Open upward if not enough space below and more space above
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tokens based on search query and exclude selected token in other selector
  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const isNotExcluded =
      !excludeToken || token.currency !== excludeToken.currency;
    return matchesSearch && isNotExcluded;
  });

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Token Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-crypto-card rounded-lg sm:rounded-xl border border-crypto-cardHover hover:border-crypto-accent transition-colors"
      >
        <img
          src={selectedToken.logo}
          alt={selectedToken.symbol}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
        />
        <span className="font-semibold text-white text-sm sm:text-base">{selectedToken.symbol}</span>
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 transition-transform ${
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-72 sm:w-80 bg-crypto-card rounded-xl sm:rounded-2xl border border-crypto-cardHover shadow-crypto-lg overflow-hidden z-50`}>
          {/* Search */}
          <div className="p-2.5 sm:p-3 border-b border-crypto-cardHover">
            <div className="relative">
              <svg
                className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-crypto-darker text-white text-sm sm:text-base rounded-lg outline-none border border-crypto-cardHover focus:border-crypto-accent transition-colors placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-64 sm:max-h-80 overflow-y-auto">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={token.currency}
                  onClick={() => handleSelect(token)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 hover:bg-crypto-darker transition-colors ${
                    token.currency === selectedToken.currency
                      ? "bg-crypto-darker"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-white text-sm sm:text-base">
                        {token.symbol}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-medium text-white">
                      ${token.price.toFixed(2)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">
                No tokens found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
