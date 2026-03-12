import { motion } from "motion/react";
import TokenInfor from "./TokenInfor";
import useGetData from "../hooks/useGetData";
import { ArrowDownUp } from "lucide-react";
import tokenStore from "../stores/tokenStore";
import { useEffect, useState } from "react";
import useToAmount from "../hooks/useToAmount";

const CurrencySwap = () => {
  const { AVAILABLE_TOKENS } = useGetData();
  const toAmount = useToAmount();
  console.log("AVAILABLE_TOKENS: ", AVAILABLE_TOKENS);
  const {
    setToken,
    selectedToken,
    fromAmount,
    setFromAmount,
    setError,
    error,
  } = tokenStore((state) => state);
  const [isSwapping, setIsSwapping] = useState(false);
  const fromToken = selectedToken?.from;
  const toToken = selectedToken?.to;

  const canSwap =
    fromAmount &&
    Number(fromAmount) > 0 &&
    !error &&
    Number(fromAmount) <= (fromToken?.balance ?? 0);

  const handleSwap = async () => {
    if (canSwap) {
      setIsSwapping(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(
        `Successfully swapped ${fromAmount} ${fromToken?.symbol} for ${toAmount} ${toToken?.symbol}`,
      );
      setFromAmount("");
      setIsSwapping(false);
    }
  };

  useEffect(() => {
    setToken({
      from: AVAILABLE_TOKENS[0],
      to: AVAILABLE_TOKENS[1],
    });
  }, []);

  const handleSwapTokens = () => {
    setToken({
      from: selectedToken?.to,
      to: selectedToken?.from,
    });

    setError("");
    setFromAmount("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[20px] shadow-xl border border-border p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-medium text-xl">Swap</h2>
        </div>
        <TokenInfor data={AVAILABLE_TOKENS} type="from" />
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="bg-white border-4 border-white p-2 rounded-xl hover:bg-accent transition-colors"
          >
            <ArrowDownUp className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <TokenInfor data={AVAILABLE_TOKENS} type="to" />
        <button
          onClick={handleSwap}
          disabled={!canSwap || isSwapping}
          className={`w-full py-4 rounded-2xl transition-all relative overflow-hidden ${
            canSwap && !isSwapping
              ? "bg-primary text-white hover:opacity-90 hover:shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isSwapping && (
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          )}
          <span className="relative z-10">
            {isSwapping
              ? "Swapping..."
              : !fromAmount
                ? "Enter an amount"
                : error
                  ? "Invalid amount"
                  : "Swap"}
          </span>
        </button>
      </motion.div>
    </div>
  );
};

export default CurrencySwap;
