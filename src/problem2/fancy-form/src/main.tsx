import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TokenProvider } from "./provider/token-prices-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <TokenProvider>
    <App />
  </TokenProvider>,
);
