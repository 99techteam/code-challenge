import { useMemo, useState } from "react";
import "./App.css";
import CurrencySelector from "./component/CurrencySelector";

function App() {
  const [error, setError] = useState("");
  const [sendAmount, setSendAmount] = useState("1");
  const [currencySend, setCurrencySend] = useState({
    code: "USD",
    flag: "🇺🇸",
    rate: 1,
  });

  const [currencyReceived, setCurrencyReceived] = useState({
    code: "VND",
    flag: "🇻🇳",
    rate: 25500,
  });
  const [showModal, setShowModal] = useState(false);
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSendAmount(value);

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setError("");
    } else {
      setError("Please enter a valid number");
    }
  };

  const exchangeRate = useMemo(() => {
    return currencyReceived.rate / currencySend.rate;
  }, [currencySend, currencyReceived]);
  const recipientGets = useMemo(() => {
    return !isNaN(+sendAmount) ? (+sendAmount * exchangeRate).toFixed(2) : 0;
  }, [sendAmount, exchangeRate]);

  const handleSwap = () => {
    if (!error && +sendAmount > 0) {
      setShowModal(true);
    }
  };

  return (
    <div className="form-container">
      <div className="rate-info">
        1 {currencySend.code} = {exchangeRate.toLocaleString()}{" "}
        {currencyReceived.code}
      </div>

      <div className="form-group">
        <label>You send</label>
        <div className={error ? "input-group error-input" : "input-group "}>
          <input value={sendAmount} onChange={handleAmountChange} />
          <span className="currency">
            <CurrencySelector
              selected={currencySend}
              onChange={setCurrencySend}
            />
          </span>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="form-group">
        <label>Recipient gets</label>
        <div className="input-group readonly">
          <input readOnly value={recipientGets.toLocaleString()} />
          <span className="currency">
            <CurrencySelector
              selected={currencyReceived}
              onChange={setCurrencyReceived}
            />
          </span>
        </div>
      </div>
      <div className="button-group">
        <button className="btn primary" onClick={handleSwap}>
          CONFIRM SWAP
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>✅ Swap completed!</h2>
            <p>
              Swap completed {sendAmount} {currencySend.code} to{" "}
              {recipientGets.toLocaleString()} {currencyReceived.code}
            </p>
            <button onClick={() => setShowModal(false)} className="btn close">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
