import "./index.css";
import { CssBaseline } from "@mui/material";

import Header from "@components/Header";
import SwapPage from "@pages/SwapPage";
import { ThemeProvider } from "@context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <div className="w-full">
        <div className="fixed top-0 left-0 w-full z-50">
          <Header />
        </div>
        <div className="p-[30px] pt-[120px]">
          <SwapPage />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;