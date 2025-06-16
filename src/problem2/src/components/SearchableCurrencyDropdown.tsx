import { useState, useMemo, useEffect, useRef } from "react";
import type { Token } from "../types";
import { ChevronDown, Search } from "lucide-react";
import CurrencyIcon from "./CurrencyIcon";
import { map } from "lodash";

interface SearchableCurrencyDropdownProps {
  currencies: Token[];
  selectedCurrency: Token | undefined;
  onSelectCurrency: (currency: Token) => void;
  placeholder?: string;
}

const SearchableCurrencyDropdown = ({
  currencies,
  selectedCurrency,
  onSelectCurrency,
  placeholder = "Select Token",
}: SearchableCurrencyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);


  const filteredCurrencies = useMemo(() => {
    return currencies.filter((currency) =>
      currency?.currency?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currencies, searchTerm]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSelect = (currency: Token) => {
    onSelectCurrency(currency);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 transition-colors"
      >
        {selectedCurrency ? (
          <div className="flex items-center gap-3">
            <CurrencyIcon src={selectedCurrency?.iconUrl} alt={selectedCurrency?.currency} className="w-6 h-6" />
            <span className="text-lg font-bold text-white">{selectedCurrency?.currency}</span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-2 flex flex-col gap-2 animate-fade-in-down">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-900 border border-gray-700 rounded-md pl-9 pr-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="overflow-y-auto max-h-60 flex flex-col gap-1 pr-1 -mr-1">
            {filteredCurrencies.length > 0 ? (
              map(filteredCurrencies, (item: Token) => (
                <li key={item.currency}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                  >
                    <CurrencyIcon
                      src={item?.iconUrl}
                      alt={item?.currency}
                      className="w-6 h-6"
                    />
                    <span className="font-semibold text-white">
                      {item?.currency}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 p-4">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableCurrencyDropdown;
