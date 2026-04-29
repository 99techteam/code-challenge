import { useEffect, useMemo, useState } from "react";
import SwapForm from "./components/SwapForm.jsx";
import { fetchTokenPrices } from "./api/prices.js";
import { formatCurrency, formatNumber, parseFormattedNumber } from "./utils/format.js";
import { calculateOutput, createBalances, validateSwap } from "./utils/swap.js";

export default function App() {
  const [tokens, setTokens] = useState([]);
  const [balances, setBalances] = useState({});
  const [priceSource, setPriceSource] = useState("loading");
  const [amountText, setAmountText] = useState("");
  const [fromSymbol, setFromSymbol] = useState("");
  const [toSymbol, setToSymbol] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchTokenPrices().then(({ source, tokens: loadedTokens }) => {
      if (!isMounted) {
        return;
      }

      setTokens(loadedTokens);
      setBalances(createBalances(loadedTokens));
      setPriceSource(source);
      setFromSymbol(loadedTokens.some((token) => token.symbol === "ETH") ? "ETH" : loadedTokens[0]?.symbol || "");
      setToSymbol(loadedTokens.some((token) => token.symbol === "USDC") ? "USDC" : loadedTokens[1]?.symbol || "");
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const fromToken = useMemo(() => tokens.find((token) => token.symbol === fromSymbol), [fromSymbol, tokens]);
  const toToken = useMemo(() => tokens.find((token) => token.symbol === toSymbol), [toSymbol, tokens]);
  const amount = parseFormattedNumber(amountText);
  const fromBalance = balances[fromSymbol] || 0;
  const toBalance = balances[toSymbol] || 0;
  const hasAmount = amountText !== "" && Number.isFinite(amount) && amount > 0;
  const outputAmount = calculateOutput(amount, fromToken, toToken);
  const outputText = hasAmount ? formatNumber(outputAmount, 8) : "";
  const errorMessage = validateSwap({ amountText, amount, balance: fromBalance, fromSymbol, toSymbol });
  const isFormLocked = isSubmitting || priceSource === "loading";
  const canSubmit = !errorMessage && hasAmount && !isFormLocked && Boolean(fromToken && toToken);
  const rateLabel = fromToken && toToken
    ? `1 ${fromToken.symbol} = ${formatNumber(fromToken.price / toToken.price, 8)} ${toToken.symbol}`
    : "";

  function clearSuccess() {
    setSuccessMessage("");
  }

  function handleAmountChange(nextAmount) {
    clearSuccess();
    setAmountText(nextAmount);
  }

  function handleFromTokenChange(nextSymbol) {
    clearSuccess();
    setFromSymbol(nextSymbol);

    // Keep selections distinct to avoid an awkward "same token" error state.
    if (nextSymbol && nextSymbol === toSymbol) {
      setToSymbol(fromSymbol);
    }
  }

  function handleToTokenChange(nextSymbol) {
    clearSuccess();
    setToSymbol(nextSymbol);

    if (nextSymbol && nextSymbol === fromSymbol) {
      setFromSymbol(toSymbol);
    }
  }

  function handleSwitch() {
    clearSuccess();
    if (!fromSymbol || !toSymbol) {
      return;
    }
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearSuccess();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    // Simulate a backend swap request before updating the local wallet balances.
    window.setTimeout(() => {
      const receivedAmount = outputAmount;

      setBalances((currentBalances) => ({
        ...currentBalances,
        [fromSymbol]: (currentBalances[fromSymbol] || 0) - amount,
        [toSymbol]: (currentBalances[toSymbol] || 0) + receivedAmount
      }));
      setAmountText("");
      setIsSubmitting(false);
      setSuccessMessage(
        `Swap confirmed: ${formatNumber(amount, 6)} ${fromSymbol} for ${outputText} ${toSymbol}.`
      );
    }, 900);
  }

  return (
    <main className="mx-auto grid min-h-screen w-[min(460px,calc(100%_-_24px))] items-center py-5">
      <SwapForm
        tokens={tokens}
        amountText={amountText}
        outputText={outputText}
        fromSymbol={fromSymbol}
        toSymbol={toSymbol}
        fromBalanceLabel={`Balance: ${formatNumber(fromBalance, 6)}`}
        toBalanceLabel={`Balance: ${formatNumber(toBalance, 6)}`}
        fromValueLabel={hasAmount && fromToken ? formatCurrency(amount * fromToken.price) : "$0.00"}
        toValueLabel={hasAmount && toToken ? formatCurrency(outputAmount * toToken.price) : "$0.00"}
        rateLabel={rateLabel}
        hasAmount={hasAmount}
        priceSource={priceSource}
        errorMessage={errorMessage}
        successMessage={successMessage}
        isSubmitting={isSubmitting}
        isFormLocked={isFormLocked}
        canSubmit={canSubmit}
        onAmountChange={handleAmountChange}
        onFromTokenChange={handleFromTokenChange}
        onToTokenChange={handleToTokenChange}
        onSwitch={handleSwitch}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
