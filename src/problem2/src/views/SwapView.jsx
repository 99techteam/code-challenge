import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useSwapViewModel } from "../viewmodels/SwapViewModel";

function CurrencySelector({
  selectedCurrency,
  currencies,
  onSelect,
  showDropdown,
  setShowDropdown,
  dropdownRef,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const filteredCurrencies = currencies.filter((option) =>
    option.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useLayoutEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 224,
      });
    }
  }, [showDropdown]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-[#262533] px-3 py-1 rounded-lg hover:bg-[#2a2937] transition-colors"
      >
        <img
          src={selectedCurrency.image}
          className="w-6 h-6 rounded-full"
          alt={selectedCurrency.currency}
        />
        <span>{selectedCurrency.currency}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-300 ${
            showDropdown ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {showDropdown &&
        createPortal(
          <div
            className="fixed w-56 bg-[#3d486f]/90 rounded-lg shadow-lg shadow-purple-500/10 z-50 max-h-96 overflow-auto animate-slideDown currency-dropdown"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            <div className="p-2 sticky top-0 bg-[#3d486f] z-10">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2d3c62] p-2 pl-10 rounded text-sm focus:outline-none text-white"
                  autoFocus
                />
              </div>
            </div>
            <ul className="px-1 py-1">
              {filteredCurrencies.map((option) => (
                <li
                  key={option.currency}
                  className="px-2 py-2 cursor-pointer hover:bg-[#516091] flex items-center gap-2 rounded transition-colors"
                  onClick={() => onSelect(option)}
                >
                  <img
                    src={option.image}
                    className="w-6 h-6 rounded-full"
                    alt={option.currency}
                  />
                  <span className="text-white">{option.currency}</span>
                </li>
              ))}
              {filteredCurrencies.length === 0 && (
                <li className="px-3 py-3 text-gray-300 text-center text-sm">
                  No currencies found
                </li>
              )}{" "}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}

function SwapForm() {
  const {
    fromValue,
    setFromValue,
    toValue,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    currencies,
    errors,
    isConnecting,
    handleSwap,
    handleConnectWallet,
    calculateExchangeRate,
  } = useSwapViewModel();
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      const clickingDropdown = event.target.closest(".currency-dropdown");
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(event.target) &&
        !clickingDropdown
      ) {
        setShowFromDropdown(false);
      }
      if (
        toDropdownRef.current &&
        !toDropdownRef.current.contains(event.target) &&
        !clickingDropdown
      ) {
        setShowToDropdown(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    }

    function handleResize() {
      setShowFromDropdown(false);
      setShowToDropdown(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="bg-[#23222c] p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-purple-500/10">
      <div className="flex justify-center mb-6">
        <div className="w-full flex items-center border-b border-gray-700">
          <button
            className={`w-full text-center pb-3 transition-all duration-300 text-white border-b-2 border-purple-500`}
          >
            Swap Currency
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">From</label>
        <div
          className={`flex items-center bg-[#1c1b24] p-3 rounded-lg ${
            errors.fromValue ? "border border-red-500" : ""
          }`}
        >
          <div className="flex-grow">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-lg"
              placeholder="0.0000000"
            />
            {errors.fromValue && (
              <p className="text-xs text-red-500 mt-1">{errors.fromValue}</p>
            )}
          </div>
          <CurrencySelector
            selectedCurrency={fromCurrency}
            currencies={currencies}
            onSelect={(currency) => {
              setFromCurrency(currency);
              setShowFromDropdown(false);
            }}
            showDropdown={showFromDropdown}
            setShowDropdown={setShowFromDropdown}
            dropdownRef={fromDropdownRef}
          />
        </div>
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <div className="bg-[#23222c] p-1 rounded-full">
          <button
            className="bg-purple-500 hover:bg-purple-600 p-2 rounded-full transform transition-all duration-300 hover:rotate-180"
            onClick={handleSwap}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transform rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-gray-400 text-sm mb-1">To</label>
        <div
          className={`flex items-center bg-[#1c1b24] p-3 rounded-lg ${
            errors.toValue ? "border border-red-500" : ""
          }`}
        >
          <div className="flex-grow">
            <input
              type="text"
              value={toValue}
              onChange={() => {}}
              className="w-full bg-transparent focus:outline-none text-lg"
              placeholder="0.0000000"
              readOnly
            />
            {errors.toValue && (
              <p className="text-xs text-red-500 mt-1">{errors.toValue}</p>
            )}
          </div>
          <CurrencySelector
            selectedCurrency={toCurrency}
            currencies={currencies}
            onSelect={(currency) => {
              setToCurrency(currency);
              setShowToDropdown(false);
            }}
            showDropdown={showToDropdown}
            setShowDropdown={setShowToDropdown}
            dropdownRef={toDropdownRef}
          />
        </div>
        <div className="text-xs text-gray-400 mt-2 flex justify-between mb-4">
          <span>
            Rate: 1 {fromCurrency.currency} ={" "}
            {calculateExchangeRate(fromCurrency, toCurrency).toFixed(7)}{" "}
            {toCurrency.currency}
          </span>
        </div>
      </div>

      <button
        className={`w-full bg-purple-500 hover:bg-purple-600 p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isConnecting ? "opacity-75 cursor-not-allowed" : ""
        }`}
        onClick={handleConnectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <>Swap</>
        )}
      </button>
    </div>
  );
}

function AppInfo() {
  return (
    <div className="md:w-1/2 p-8 flex flex-col justify-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Swap currencies <span className="text-purple-500">instantly</span> and
        securely
      </h1>
      <p className="text-gray-300 mb-8">
        Trade between 30+ cryptocurrencies with zero hassle.
        <br />
        Low fees, fast transactions, and the best exchange rates.
      </p>
      <div className="space-y-4 text-sm text-gray-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p>Lightning-fast transactions that settle in seconds</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p>Secure, non-custodial trading</p>
        </div>
      </div>
    </div>
  );
}

function SwapView() {
  return (
    <div
      style={{ minWidth: "100dvw" }}
      className="flex items-center justify-center min-h-screen bg-[#1c1b24] text-white p-4"
    >
      <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-2xl overflow-hidden">
        <AppInfo />
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <SwapForm />
        </div>
      </div>
    </div>
  );
}

export default SwapView;
