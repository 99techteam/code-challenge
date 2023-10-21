import { Route, Routes, useLocation } from "react-router-dom";
import { Form } from "@/layout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Form />} />
    </Routes>
  );
}
