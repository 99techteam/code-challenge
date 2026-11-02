import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SwapForm from "./SwapForm";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SwapForm />
  </StrictMode>
);
