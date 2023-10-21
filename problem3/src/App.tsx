import { Route, Routes, useLocation } from "react-router-dom";
import { WalletPage } from "@/pages";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WalletPage />} />
    </Routes>
  );
}
