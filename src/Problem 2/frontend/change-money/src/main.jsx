import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{ margin: "8px" }}
      toastOptions={{
        success: {
          duration: 3000,
        },
        erorr: {
          duration: 5000,
        },
        style: {
          fontSize: "16px",
          maxWidth: "400px",
          backgroundColor: "grey-0",
          color: "grey-800",
        },
      }}
    />
  </QueryClientProvider>
);
