import { SwapProvider } from "./contexts/SwapContext";
import SwapScreen from "./screens/Swap";
function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-linear-[139.73deg,#E5FDFF,#F3EFFF]">
      <SwapProvider>
        <SwapScreen />
      </SwapProvider>
    </div>
  );
}

export default App;
