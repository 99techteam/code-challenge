import { Header } from "@/components/shared";
import { Outlet } from "react-router";
import styled from "styled-components";

const LayoutGlobalStyled = styled.div`
  height: 100vh;
`;

const Main = styled.main`
  height: 100%;
`;

const Container = styled.div`
  margin: 8rem auto 0;
  max-width: 120rem;
`;

export default function LayoutGlobal() {
  return (
    <LayoutGlobalStyled>
      <Header />
      <Main>
        <Container>
          <Outlet />
        </Container>
      </Main>
    </LayoutGlobalStyled>
  );
}
