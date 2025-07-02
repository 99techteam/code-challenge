import { useEffect, useState } from "react";
import { useTokenStore } from "@/store/tokenStore";
import type { TokenInfo } from "@/types";
import TokenSelector from "@/components/TokenSelector";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import swapIcon from "@/assets/img/swap-logo.png";
import { useAppState } from "@/store/useAppState";

const SwapForm = () => {
  const { tokens, fetchTokens } = useTokenStore();

  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [fromAmount, setFromAmount] = useState("0");
  const [toAmount, setToAmount] = useState("0");
  const [exchangeRate, setExchangeRate] = useState(0);
  const { setLoading } = useAppState();

  const swapFeeRate = 0.003;
  const feeAmount = parseFloat(fromAmount) * exchangeRate * swapFeeRate;
  const minimumReceived = parseFloat(toAmount) - feeAmount;

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if (!fromToken || !toToken) return;

    const rate = toToken.price / fromToken.price;
    setExchangeRate(rate);

    const calculated = parseFloat(fromAmount) * rate;
    setToAmount(calculated.toFixed(6));
  }, [fromToken, toToken, fromAmount]);

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleSubmit = async () => {
    if (!fromToken || !toToken) {
      toast.error("Please select both tokens.");
      return;
    }

    if (parseFloat(fromAmount) <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    toast.success("Swap submitted!");
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-dark-main rounded-[32px] sm:w-[520px] w-full max-w-sm sm:max-w-xl p-6 relative text-white shadow-2xl">
        {/* Top Swap icon */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-bg-base rounded-xl w-16 h-16 flex items-center justify-center p-1.5">
          <img src={swapIcon} alt="Swap" className="w-full object-contain" />
        </div>

        <h2 className="text-xl font-bold mb-6 text-white text-left">Swap</h2>

        {/* SELL Section */}
        <div className="flex justify-between text-xs sm:text-sm mb-1 text-gray-400">
          <span>Sell</span>
          {fromToken && (
            <span>
              Balance: {parseFloat(fromAmount).toFixed(6)} {fromToken.symbol}
            </span>
          )}
        </div>
        <div className="bg-dark-card rounded-full px-4 py-3 flex items-center justify-between mb-4">
          <TokenSelector
            value={fromToken}
            onChange={setFromToken}
            tokens={tokens}
          />
          <div className="relative w-32 sm:w-40">
            <input
              type="number"
              className="bg-transparent text-right text-lg sm:text-xl font-bold outline-none pr-6 w-full"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col justify-center items-center gap-1 pr-1">
              <button
                type="button"
                onClick={() =>
                  setFromAmount((prev) =>
                    (parseFloat(prev || "0") + 1).toString()
                  )
                }
                className="hover:text-white text-gray-400"
              >
                <Icon icon="mdi:chevron-up" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setFromAmount((prev) =>
                    Math.max(parseFloat(prev || "0") - 1, 0).toString()
                  )
                }
                className="hover:text-white text-gray-400"
              >
                <Icon icon="mdi:chevron-down" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center my-4">
          <button
            onClick={handleSwapTokens}
            className="bg-dark-btn w-9 h-9 rounded-full flex items-center justify-center hover:bg-dark-btn-hover"
            title="Swap tokens"
          >
            <Icon icon="mdi:swap-vertical" className="text-gray-400 text-xl" />
          </button>
        </div>

        {/* RECEIVE Section */}
        <div className="text-xs sm:text-sm text-gray-400 mb-1">Receive</div>
        <div className="bg-dark-card rounded-full px-4 py-3 flex items-center justify-between mb-4">
          <TokenSelector
            value={toToken}
            onChange={setToToken}
            tokens={tokens}
          />
          <div className="text-lg sm:text-xl font-bold text-right w-32 sm:w-40">
            {Number(toAmount).toLocaleString(undefined, {
              minimumFractionDigits: 6,
              maximumFractionDigits: 6,
            })}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-4 text-xs sm:text-sm text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Minimum received</span>
            <span>
              {minimumReceived.toLocaleString(undefined, {
                minimumFractionDigits: 6,
                maximumFractionDigits: 6,
              })}{" "}
              {toToken?.symbol ?? "--"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Swap rate</span>
            <div className="flex items-center gap-2">
              <span>
                {exchangeRate.toFixed(3)} {toToken?.symbol ?? "--"} per{" "}
                {fromToken?.symbol ?? "--"}
              </span>
              <Icon
                icon="cuida:swap-horizontal-arrows-outline"
                className="rounded-full bg-gray-700 p-1"
                width="18"
                height="19"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <span>Swap fees</span>
            <span>0.3%</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-2 sm:py-3 rounded-full font-bold text-white transition bg-primary hover:bg-primary-hover"
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapForm;
