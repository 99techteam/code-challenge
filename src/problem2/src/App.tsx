import "./App.css";
import SwapForm from "@components/SwapForm";
import { Toaster } from "react-hot-toast";
import GlobalLoader from "@components/GlobalLoader";

const App = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col gap-4 p-4 overflow-hidden">
      <GlobalLoader />
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold">Fancy Form</h1>
      <div>
        <SwapForm />
      </div>
    </div>
  );
};

export default App;
