import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App.tsx";
import { QueryProvider } from "@api";
import { theme } from "./theme";
import { ExchangeModalProvider, ToastProvider } from "@contexts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryProvider>
        <ToastProvider>
          <ExchangeModalProvider>
            <App />
          </ExchangeModalProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
);
