import SwapPage from "../features/swap/SwapPage";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 w-screen">
        <SwapPage />
      </div>
    </>
  );
}
