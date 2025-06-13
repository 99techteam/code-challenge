import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "antd/dist/reset.css";
import { ThemeProvider } from "styled-components";

import ModuleForm from "./module_form/Container";

const queryClient = new QueryClient();

const theme = {
  primaryColor: "#1890ff",
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f0f2f5",
            padding: "20px",
          }}
        >
          <ModuleForm />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
