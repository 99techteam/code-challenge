import { useCallback, useEffect, useMemo, useState } from "react";

import { ArrowUpDown, EqualApproximatelyIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Token, SwapStatus } from "../../types";

import { AmountPanel } from "./amount-panel";
import { SuccessModal } from "./success-modal";

import { Button } from "../ui/button";

import { calculateSwapQuote, cn, debounce } from "../../utils";

import { useTokenContext } from "../../provider/token-prices-provider";

import { useBalances } from "../../hooks/use-balances";
import { formatTokenAmount } from "../../utils/format";
import { DEFAULT_SLIPPAGE } from "../../constants/tokens";
import { Loading } from "../ui/loading";

export function SwapCard() {
  const { tokens: tokensApi, loading } = useTokenContext();

  const { balances, updateBalance } = useBalances();

  const tokens = useMemo(() => {
    return tokensApi.map((token) => ({
      ...token,
      balance: balances[token.symbol] || 0,
    }));
  }, [tokensApi, balances]);

  const [fromToken, setFromToken] = useState<Token | null>(null);

  const [toToken, setToToken] = useState<Token | null>(null);

  const [fromAmount, setFromAmount] = useState("");

  const [toAmount, setToAmount] = useState("");

  const [status, setStatus] = useState<SwapStatus>("idle");

  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (tokens.length >= 2 && !fromToken && !toToken) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
  }, [tokens, fromToken, toToken]);

  const fetchQuote = useCallback(
    debounce((amount: string, fToken: Token, tToken: Token) => {
      const q = calculateSwapQuote(amount, fToken, tToken);
      setToAmount(q ? q.toAmount : "");
    }, 400),
    [],
  );

  useEffect(() => {
    if (!fromToken || !toToken) {
      return;
    }

    if (fromAmount && parseFloat(fromAmount) > 0) {
      fetchQuote(fromAmount, fromToken, toToken);
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken, fetchQuote]);

  const exchangeRate = useMemo(() => {
    return fromToken && toToken ? fromToken.price / toToken.price : null;
  }, [fromToken, toToken]);

  const handleFlip = () => {
    if (!fromToken || !toToken) {
      return;
    }

    setIsFlipping(true);

    setTimeout(() => {
      setFromToken(toToken);
      setToToken(fromToken);

      setFromAmount(toAmount);
      setToAmount(fromAmount);

      setIsFlipping(false);
    }, 150);
  };

  const handleFromTokenChange = (token: Token) => {
    setFromToken(token);
    setFromAmount("");
    setToAmount("");
  };

  const handleToTokenChange = (token: Token) => {
    setToToken(token);
    setToAmount("");
  };

  const handleSwap = async () => {
    if (!canSwap || !fromToken || !toToken) {
      return;
    }

    setStatus("confirming");

    await new Promise((r) => setTimeout(r, 2000));

    setStatus("success");

    updateBalance(fromToken!.symbol, -parseFloat(fromAmount));
    updateBalance(toToken!.symbol, parseFloat(toAmount));

    setFromToken((prev) => {
      if (prev) {
        return {
          ...prev,
          balance: (prev.balance || 0) - parseFloat(fromAmount),
        };
      }
      return prev;
    });

    setToToken((prev) => {
      if (prev) {
        return {
          ...prev,
          balance: (prev.balance || 0) + parseFloat(toAmount),
        };
      }
      return prev;
    });
  };

  const handleCloseSuccess = () => {
    setStatus("idle");
    setFromAmount("");
    setToAmount("");
  };

  const insufficientBalance =
    !!fromAmount &&
    !!fromToken &&
    fromToken?.balance !== undefined &&
    parseFloat(fromAmount) > fromToken?.balance;

  const canSwap =
    !!fromAmount &&
    !!toAmount &&
    parseFloat(fromAmount) > 0 &&
    !insufficientBalance &&
    status !== "confirming";

  const getButtonLabel = () => {
    if (status === "confirming") {
      return "Confirming...";
    }

    if (!fromAmount || parseFloat(fromAmount) === 0) {
      return "Enter Amount";
    }

    if (insufficientBalance) {
      return `Insufficient ${fromToken?.symbol} Balance`;
    }

    return "Confirm Swap";
  };

  if (loading || !fromToken || !toToken) {
    return (
      <div className="flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <h2 className="mx-auto font-semibold text-center text-2xl mb-4">
        Swap Tokens
      </h2>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className={cn(
          "w-full max-w-md mx-auto",
          "bg-card border border-border/60 rounded-3xl",
          "shadow-2xl shadow-black/40",
          "overflow-visible",
        )}
      >
        <div className="p-6 space-y-1 relative">
          <AmountPanel
            label="Amount to send"
            sublabel="Balance:"
            amount={fromAmount}
            token={fromToken}
            onAmountChange={setFromAmount}
            onTokenChange={handleFromTokenChange}
            excludeSymbol={toToken.symbol}
          />

          <div className="flex justify-center relative z-10 my-0.5">
            <motion.button
              onClick={handleFlip}
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
              animate={
                isFlipping
                  ? {
                      rotate: 180,
                    }
                  : {
                      rotate: 0,
                    }
              }
              transition={{
                duration: 0.2,
              }}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                "bg-secondary border border-border/80",
                "hover:bg-muted hover:border-border transition-colors",
                "shadow-md",
              )}
            >
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>

          <AmountPanel
            label="Amount to receive"
            sublabel="Balance:"
            amount={toAmount}
            token={toToken}
            onTokenChange={handleToTokenChange}
            excludeSymbol={fromToken.symbol}
            readonly
          />
          {exchangeRate && fromToken && toToken && (
            <div className="text-xs flex items-center justify-between gap-2 text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <span>1 {fromToken?.symbol}</span>
                <EqualApproximatelyIcon size="12" className="inline-block" />
                <span>
                  {formatTokenAmount(exchangeRate)} {toToken?.symbol}
                </span>
              </span>
              <span className="font-bold text-primary">
                Slippage: {DEFAULT_SLIPPAGE}%
              </span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {insufficientBalance && (
            <motion.div
              initial={{
                opacity: 0,
                y: -4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -4,
              }}
              className="mx-4 mb-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-xs text-red-400 text-center">
                Insufficient {fromToken.symbol} balance. You have{" "}
                {fromToken.balance} {fromToken.symbol}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 pb-5">
          <Button
            variant="swap"
            size="xl"
            className={cn(
              "w-full font-bold tracking-wide",
              !canSwap && "cursor-not-allowed",
            )}
            onClick={handleSwap}
            disabled={!canSwap}
          >
            {status === "confirming" ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Confirming...
              </span>
            ) : (
              getButtonLabel()
            )}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {status === "success" && (
          <SuccessModal
            fromAmount={fromAmount}
            toAmount={toAmount}
            fromToken={fromToken}
            toToken={toToken}
            onClose={handleCloseSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
