import React, { useState } from "react";
import type { Token } from "../types/prices";
import { ChevronDown } from "lucide-react";
import ModalSelectToken from "./ModalSelectToken";
import tokenStore from "../stores/tokenStore";
import { motion } from "motion/react";
import useToAmount from "../hooks/useToAmount";

const TokenInfor = ({ data, type }: { data: Token[]; type: "from" | "to" }) => {
  const toAmount = useToAmount();
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const {
    selectedToken,
    setError,
    setFromAmount,
    fromAmount,
    error,
    setTokenSearchQuery,
  } = tokenStore((state) => state);
  const dataToken = selectedToken?.[type];
  const fromToken = selectedToken?.from;
  const amount = type === "from" ? fromAmount : toAmount;

  const handleMaxClick = () => {
    setFromAmount(fromToken?.balance?.toString() ?? "0");
    setError("");
  };

  const handleFromAmountChange = (value: string) => {
    if (type === "to") return;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      let newErrors = "";

      if (value && Number(value) > (fromToken?.balance ?? 0)) {
        newErrors = `Insufficient ${fromToken?.symbol} balance`;
      } else if (value && Number(value) <= 0) {
        newErrors = "Amount must be greater than 0";
      }
      setError(newErrors);
    }
  };

  return (
    <div className="bg-input-background rounded-2xl p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        <span className="text-muted-foreground">
          Balance:{" "}
          {dataToken?.balance?.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowTokenSelector(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-accent rounded-xl transition-all hover:shadow-sm"
        >
          <img
            src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${dataToken?.symbol}.svg`}
            alt={dataToken?.symbol}
            className="w-6 h-6 rounded-full"
            onError={(e) => {
              e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23${Math.floor(Math.random() * 16777215).toString(16)}"/><text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${dataToken?.symbol[0]}</text></svg>`,
              )}`;
            }}
          />
          <span className="text-foreground">{dataToken?.symbol}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={amount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            readOnly={type === "to"}
            placeholder="0.0"
            className={
              "w-full bg-transparent text-right outline-none text-foreground placeholder:text-muted-foreground text-3xl font-semibold transition-all cursor-text px-2 py-1 rounded-lg " +
              (type === "from"
                ? "hover:placeholder:text-foreground/70 hover:bg-accent/30 focus:bg-accent/30"
                : "")
            }
            autoFocus
          />
          {amount && Number(amount) > 0 && (
            <div className="text-right text-muted-foreground mt-1">
              ≈ $
              {(Number(amount) * (dataToken?.price ?? 0)).toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 },
              )}
            </div>
          )}
        </div>
      </div>
      {type === "from" && (
        <button
          onClick={handleMaxClick}
          className="mt-2 text-primary hover:text-primary/80 transition-all hover:scale-105"
        >
          MAX
        </button>
      )}
      {error && type === "from" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 text-destructive text-left"
        >
          {error}
        </motion.div>
      )}
      <ModalSelectToken
        open={showTokenSelector}
        onClose={() => {
          setShowTokenSelector(false);
          setTokenSearchQuery("");
        }}
        type={type}
        AVAILABLE_TOKENS={data}
      />
    </div>
  );
};

export default TokenInfor;
