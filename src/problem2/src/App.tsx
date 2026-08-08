import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import CurrencySwap from "./components/CurrencySwap";
import "./App.css";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="app">
        <CurrencySwap />
      </div>
    </ErrorBoundary>
  );
};

export default App;
