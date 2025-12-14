import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI, TokenBalance } from "../services/api";
import Navbar from "../components/Navbar";
import { getTokenByCurrency } from "../data/tokens";

const Transfer = () => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [recipientWallet, setRecipientWallet] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBalances, setFetchingBalances] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchBalances();
  }, [isAuthenticated, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBalances = async () => {
    try {
      setFetchingBalances(true);
      const data = await authAPI.getBalances();
      setBalances(data.tokenBalances);
      if (data.tokenBalances.length > 0) {
        setSelectedToken(data.tokenBalances[0].symbol);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load balances");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setFetchingBalances(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!recipientWallet || !selectedToken || !amount) {
      setError("Please fill in all fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const balance = balances.find((b) => b.symbol === selectedToken);
    if (!balance || balance.amount < amountNum) {
      setError("Insufficient balance");
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.transfer({
        recipientWalletAddress: recipientWallet,
        tokenSymbol: selectedToken,
        amount: amountNum,
      });

      setSuccess(response.message);
      setBalances(response.newBalance);

      // Reset form
      setRecipientWallet("");
      setAmount("");

      // Refresh balances after a short delay
      setTimeout(() => {
        fetchBalances();
      }, 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Transfer failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedBalance = balances.find((b) => b.symbol === selectedToken);

  if (fetchingBalances) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
            Transfer Tokens
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-crypto-error/10 border border-crypto-error/30 rounded-lg">
              <p className="text-sm text-crypto-error">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-500">{success}</p>
            </div>
          )}

          {balances.length === 0 ? (
            <div className="bg-crypto-card rounded-lg border border-crypto-cardHover p-6 sm:p-8 text-center">
              <p className="text-gray-400 mb-4">
                You don't have any tokens to transfer
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-crypto-accent hover:bg-crypto-accentHover text-white text-sm font-medium rounded-lg transition-colors"
              >
                Go to Swap
              </button>
            </div>
          ) : (
            <div className="bg-crypto-card rounded-lg border border-crypto-cardHover p-4 sm:p-6 lg:p-8">
              <form
                onSubmit={handleTransfer}
                className="space-y-5 sm:space-y-6"
              >
                {/* Recipient Wallet Address */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Recipient Wallet Address
                  </label>
                  <input
                    type="text"
                    value={recipientWallet}
                    onChange={(e) => setRecipientWallet(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-crypto-darker text-white text-sm sm:text-base rounded-lg border border-crypto-cardHover focus:border-crypto-accent focus:outline-none transition-colors font-mono"
                    disabled={loading}
                  />
                </div>

                {/* Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Token
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    {/* Selected Token Button */}
                    <button
                      type="button"
                      onClick={() =>
                        !loading && setIsDropdownOpen(!isDropdownOpen)
                      }
                      disabled={loading}
                      className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-crypto-darker text-white rounded-lg border border-crypto-cardHover hover:border-crypto-accent focus:border-crypto-accent focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedBalance ? (
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          {getTokenByCurrency(selectedToken) ? (
                            <img
                              src={getTokenByCurrency(selectedToken)!.logo}
                              alt={selectedToken}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-crypto-accent to-indigo-400 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                              {selectedToken[0]}
                            </div>
                          )}
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="text-sm sm:text-base font-semibold truncate w-full text-left">
                              {selectedToken}
                            </span>
                            <span className="text-xs text-gray-400 truncate w-full text-left">
                              {getTokenByCurrency(selectedToken)?.name ||
                                "Token"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm sm:text-base">
                          Select a token
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${
                          isDropdownOpen ? "rotate-180" : ""
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

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-crypto-card rounded-lg border border-crypto-cardHover shadow-2xl shadow-black/50 max-h-64 overflow-y-auto">
                        {balances.map((balance) => {
                          const tokenData = getTokenByCurrency(balance.symbol);
                          const isSelected = balance.symbol === selectedToken;

                          return (
                            <button
                              key={balance.symbol}
                              type="button"
                              onClick={() => {
                                setSelectedToken(balance.symbol);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-3 sm:p-3.5 hover:bg-crypto-darker transition-colors ${
                                isSelected ? "bg-crypto-darker" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                {tokenData ? (
                                  <img
                                    src={tokenData.logo}
                                    alt={tokenData.symbol}
                                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-crypto-accent to-indigo-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {balance.symbol[0]}
                                  </div>
                                )}
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                  <span className="text-white text-sm sm:text-base font-semibold truncate w-full text-left">
                                    {balance.symbol}
                                  </span>
                                  <span className="text-gray-400 text-xs sm:text-sm truncate w-full text-left">
                                    {tokenData?.name || "Token"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="text-white text-xs sm:text-sm font-medium">
                                  {balance.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6,
                                  })}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  Available
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected Token Balance Info */}
                  {selectedBalance && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-400">
                      Available Balance:{" "}
                      <span className="text-white font-semibold">
                        {selectedBalance.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}{" "}
                        {selectedToken}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string or valid positive numbers
                        if (value === "" || parseFloat(value) >= 0) {
                          setAmount(value);
                        }
                      }}
                      placeholder="0.00"
                      max={selectedBalance?.amount || undefined}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-crypto-darker text-white text-sm sm:text-base rounded-lg border transition-colors ${
                        amount &&
                        selectedBalance &&
                        parseFloat(amount) > selectedBalance.amount
                          ? "border-crypto-error focus:border-crypto-error"
                          : "border-crypto-cardHover focus:border-crypto-accent"
                      } focus:outline-none`}
                      disabled={loading}
                    />
                    {selectedBalance && (
                      <button
                        type="button"
                        onClick={() =>
                          setAmount(selectedBalance.amount.toString())
                        }
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-1 bg-crypto-accent/20 hover:bg-crypto-accent/30 text-crypto-accent text-xs font-medium rounded transition-colors"
                        disabled={loading}
                      >
                        MAX
                      </button>
                    )}
                  </div>
                  {/* Amount validation messages */}
                  {amount &&
                    selectedBalance &&
                    parseFloat(amount) > selectedBalance.amount && (
                      <p className="mt-1.5 text-xs text-crypto-error">
                        Amount exceeds available balance
                      </p>
                    )}
                  {amount && parseFloat(amount) <= 0 && (
                    <p className="mt-1.5 text-xs text-crypto-error">
                      Amount must be greater than 0
                    </p>
                  )}
                </div>

                {/* Transfer Summary */}
                {amount &&
                  parseFloat(amount) > 0 &&
                  selectedBalance &&
                  parseFloat(amount) <= selectedBalance.amount && (
                    <div className="bg-crypto-darker rounded-lg p-3 sm:p-4 space-y-2 border border-crypto-cardHover">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">You are sending</span>
                        <span className="text-white font-medium">
                          {parseFloat(amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}{" "}
                          {selectedToken}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Remaining balance</span>
                        <span
                          className={`font-medium ${
                            selectedBalance.amount - parseFloat(amount) >= 0
                              ? "text-white"
                              : "text-crypto-error"
                          }`}
                        >
                          {(
                            selectedBalance.amount - parseFloat(amount)
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}{" "}
                          {selectedToken}
                        </span>
                      </div>
                    </div>
                  )}

                {/* Transfer Button */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !recipientWallet ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    (selectedBalance &&
                      parseFloat(amount) > selectedBalance.amount)
                  }
                  className="w-full px-4 py-3 sm:py-3.5 bg-crypto-accent hover:bg-crypto-accentHover disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Processing..." : "Transfer Tokens"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Transfer;
