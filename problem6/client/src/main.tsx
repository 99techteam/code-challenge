import App from "./App";
import React from "react";
import store from "./store";
import ReactDOM from "react-dom/client";
import GlobalStyles from "./styles/GlobalStyle";
import { BrowserRouter } from "react-router-dom";
import { ToasterDisplay } from "@/components/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <ToasterDisplay />
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
