import { ToastProvider } from "./components/ui/Toast";
import { Layout } from "./components/layout/Layout";
import { ConfigProvider, theme } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SwapPage } from "./pages/swap";

function App() {
  return (
    <ToastProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#FCD535",
            colorBgContainer: "#2B3139",
            colorBgElevated: "#2B3139",
            colorText: "#EAECEF",
            colorBorder: "#474D57",
            fontFamily: "Inter, sans-serif",
            borderRadius: 10,
          },
          components: {
            Modal: {
              contentBg: "#2B3139",
              headerBg: "#2B3139",
            },
            Input: {
              colorBgContainer: "#1E2329",
            },
          },
        }}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={<SwapPage />}
              />
              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ConfigProvider>
    </ToastProvider>
  );
}

export default App;
