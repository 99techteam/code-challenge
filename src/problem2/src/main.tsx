import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Toaster, UIProvider } from "./ui";

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root");

createRoot(el).render(
  <StrictMode>
    <UIProvider>
      <App />
      <Toaster />
    </UIProvider>
  </StrictMode>
);
