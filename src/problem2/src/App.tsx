import "./App.css";
import CurrencySwap from "./components/CurrencySwap";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div>
      <CurrencySwap />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
