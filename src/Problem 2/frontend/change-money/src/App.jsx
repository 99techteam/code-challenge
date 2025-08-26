import { useState } from "react";

import CurrencyForm from "./components/CurrencyForm.jsx";
import ResultDisplay from "./components/ResultDisplay.jsx";
import "./App.css";
import { useCurrencies } from "./hooks/useCurrencies.js";
import { useConvertCurrency } from "./hooks/useConvertCurrency.js";

function App() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({ from: "", to: "", amount: "" });

  const {
    currencies,
    isPending: currenciesLoading,
    error: currenciesError,
  } = useCurrencies();

  const {
    mutate: convertCurrency,
    isPending: conversionLoading,
    isSuccess,
    data,
    error: conversionError,
  } = useConvertCurrency();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = { from: "", to: "", amount: "" };

    if (!from) newErrors.from = "Source currency is required";
    if (!to) newErrors.to = "Target currency is required";
    if (!amount || amount <= 0)
      newErrors.amount = "Amount must be greater than 0";

    if (newErrors.from || newErrors.to || newErrors.amount) {
      setErrors(newErrors);
      return; // Toast error is handled in useConvertCurrency hook
    }

    setErrors({ from: "", to: "", amount: "" });
    convertCurrency({ amount, from, to });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">
          Currency Swap
        </h1>
        <CurrencyForm
          currencies={currencies}
          onSubmit={handleSubmit}
          loading={currenciesLoading || conversionLoading}
          from={from}
          to={to}
          amount={amount}
          setFrom={setFrom}
          setTo={setTo}
          setAmount={setAmount}
          errors={errors}
        />
        {currenciesError && (
          <p className="mt-4 text-center text-red-600">
            {currenciesError.message}
          </p>
        )}
        {conversionError && (
          <p className="mt-4 text-center text-red-600">
            {conversionError.message}
          </p>
        )}
        <ResultDisplay result={isSuccess ? data : null} />
      </div>
    </div>
  );
}

export default App;
