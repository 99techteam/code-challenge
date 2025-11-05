import React, { useState, useEffect } from "react";
import "./SwapForm.css";
import { API_URL, SVG_BASE_URL } from "../../constants";
import { formatLatestPrices } from "../../utils/formatLatestPrices";

export default function SwapForm() {
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    setLoadingPrices(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length >= 0) {
          setPrices(formatLatestPrices(data));
          setFromToken(data[0]);
          setToToken(data[0]);
          setLoadingPrices(false);
        }
      })
      .catch(() => {
        setError("Failed to load token prices.");
        setLoadingPrices(false);
      });
  }, []);

  const handleSwap = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (fromToken.currency === toToken.currency) {
      setError("Please select two different currencies.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const toAmount = (
        (Number(amount) * fromToken?.price) /
        toToken?.price
      ).toFixed(6);
      setResult(
        `${amount} ${fromToken?.currency} ≈ ${toAmount} ${toToken?.currency}`
      );
      setLoading(false);
    }, 1200);
    console.log("fromToken", fromToken);
    console.log("toToken", toToken);
  };

  return (
    <form className="swap-form" onSubmit={handleSwap}>
      <h2>Currency Swap</h2>
      {loadingPrices ? (
        <div className="swap-error">Loading token prices...</div>
      ) : (
        <>
          <div className="swap-row">
            <label>From</label>
            <select
              value={fromToken.currency}
              onChange={(e) =>
                setFromToken(prices.find((t) => t.currency === e.target.value))
              }
            >
              {prices.map((token) => (
                <option key={token.currency} value={token.currency}>
                  {token.currency}
                </option>
              ))}
            </select>
            <img
              src={`${SVG_BASE_URL}${fromToken?.currency}.svg`}
              alt={fromToken.currency}
              className="token-img"
            />
          </div>
          <div className="swap-row">
            <label>To</label>
            <select
              value={toToken?.currency}
              onChange={(e) =>
                setToToken(prices.find((t) => t.currency === e.target.value))
              }
            >
              {prices.map((token) => (
                <option key={token.currency} value={token.currency}>
                  {token.currency}
                </option>
              ))}
            </select>
            <img
              src={`${SVG_BASE_URL}${toToken?.currency}.svg`}
              alt={toToken?.currency}
              className="token-img"
            />
          </div>
          <div className="swap-row">
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </>
      )}
      {error && <div className="swap-error">{error}</div>}
      <button
        type="submit"
        className="swap-btn"
        disabled={loading || loadingPrices}
      >
        {loading ? "Swapping..." : "Swap"}
      </button>
      {result && <div className="swap-result">{result}</div>}
    </form>
  );
}
