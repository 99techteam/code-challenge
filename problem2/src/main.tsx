import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import GlobalStyles from "./styles/GlobalStyle";
import { BrowserRouter } from "react-router-dom";
import { ToasterDisplay } from "@/components";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalStyles />
    <ToasterDisplay />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
