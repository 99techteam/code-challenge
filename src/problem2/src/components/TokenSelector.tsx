import { useClickOutside } from "@/hooks/useClickOutside";
import type { TokenSelectProps } from "@/types";
import { getTokenLogo } from "@/utils/getTokenLogo";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";

const TokenSelector = ({
  value,
  onChange,
  tokens,
  placeholder = "Select token",
}: TokenSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2B2B38] px-3 py-2 rounded-full flex items-center gap-1 text-white text-sm font-medium"
      >
        {value ? (
          <>
            <img
              src={getTokenLogo(value.symbol)}
              alt={value.symbol}
              className="w-5 h-5 rounded-full"
            />
            <span>{value.symbol}</span>
            <Icon icon="mdi:chevron-down" />
          </>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 sm:w-96 w-52 mt-2 max-h-64 overflow-y-auto bg-[#1E1F2F] rounded-xl shadow-lg custom-scroll">
          {[...new Map(tokens.map((t) => [t.symbol, t])).values()].map(
            (token) => (
              <div
                key={token.symbol}
                onClick={() => {
                  onChange(token);
                  setIsOpen(false);
                }}
                className="px-4 py-2 hover:bg-dark-btn cursor-pointer flex items-center gap-2"
              >
                <img
                  src={getTokenLogo(token.symbol)}
                  alt={token.symbol}
                  className="w-5 h-5"
                />
                <span>{token.symbol}</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
