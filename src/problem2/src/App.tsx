import React from "react";
import { ToastContainer } from "react-toastify";
import CurrencySwapContainer from "./components/CurrencySwapContainer";

import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";

const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      <CurrencySwapContainer />
      <ToastContainer />
    </div>
  );
};

export default App;
