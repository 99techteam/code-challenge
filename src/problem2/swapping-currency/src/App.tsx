import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DappLayout from "./layout/DappLayout";

// Pages
const Home = React.lazy(() => import("@/pages/home"));
const NotFound = React.lazy(() => import("@/pages/notfound"));

function App() {
  return (
    <Suspense fallback={<></>}>
      <BrowserRouter>
        <Routes>
          <Route element={<DappLayout />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
