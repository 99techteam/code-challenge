import { Route, Routes } from "react-router-dom";
import { ChallengePage, HomePage, LoginPage, RegisterPage } from "@/pages";
import LayoutGlobal from "./layouts/LayoutGlobal";
import { PAGES_CONSTANT } from "./constants";

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutGlobal />}>
        <Route path={PAGES_CONSTANT.home} element={<HomePage />} />
        <Route path={PAGES_CONSTANT.login} element={<LoginPage />} />
        <Route path={PAGES_CONSTANT.register} element={<RegisterPage />} />
        <Route path={PAGES_CONSTANT.challenge} element={<ChallengePage />} />
      </Route>
    </Routes>
  );
}
