import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import tokenStore from "../stores/tokenStore";
import type { Token } from "../types/prices";
import useGetData from "../hooks/useGetData";

const ModalSelectToken = ({
  open,
  onClose,
  type,
  AVAILABLE_TOKENS,
}: {
  open: boolean;
  onClose: () => void;
  type: "from" | "to";
  AVAILABLE_TOKENS: Token[];
}) => {
  const {
    tokenSearchQuery,
    setTokenSearchQuery,
    setToken,
    selectedToken,
    setFromAmount,
    setError,
  } = tokenStore((state) => state);

  useEffect(() => {
    return () =>
      setToken({
        from: null,
        to: null,
      });
  }, [setToken]);

  const handleSwapTokens = (token: Token, type: "from" | "to") => {
    const oppositeType = type === "from" ? "to" : "from";
    const key =
      selectedToken?.[oppositeType]?.symbol === token.symbol
        ? type
        : oppositeType;
    if (type === "from") {
      setToken({ from: token, to: selectedToken[key] });
    } else {
      setToken({ from: selectedToken[key], to: token });
    }
  };

  const handleTokenSelect = (token: Token, type: "from" | "to") => {
    handleSwapTokens(token, type);
    onClose();
    setTokenSearchQuery("");
    setFromAmount("");
    setError("");
  };

  const filteredTokens = AVAILABLE_TOKENS.filter(
    (token) =>
      token.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(tokenSearchQuery.toLowerCase()),
  );

  // generate modal JSX separately so we can portal it to document.body
  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-9999"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[20px] shadow-2xl border border-border p-4 z-9999"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Select a token</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={tokenSearchQuery}
                onChange={(e) => setTokenSearchQuery(e.target.value)}
                placeholder="Search name or symbol"
                className="w-full pl-10 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>

            {/* Token List */}
            <div className="max-h-100 overflow-y-auto">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleTokenSelect(token, type)}
                  className="cursor-pointer w-full flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.symbol}.svg`}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(
                          `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23${Math.floor(Math.random() * 16777215).toString(16)}"/><text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${token.symbol[0]}</text></svg>`,
                        )}`;
                      }}
                    />
                    <div className="text-left">
                      <div className="text-foreground">{token.symbol}</div>
                      <div className="text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-foreground">
                      {token.balance.toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                      })}
                    </div>
                    <div className="text-muted-foreground">
                      $
                      {(token.balance * token.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </button>
              ))}
              {filteredTokens.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No tokens found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return open ? createPortal(modalContent, document.body) : null;
};

export default ModalSelectToken;
