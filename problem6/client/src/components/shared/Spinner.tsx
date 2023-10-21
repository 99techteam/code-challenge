import styled, { keyframes } from "styled-components";

// Define keyframes
const aniImage = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1) ;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1) ;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) ;
  }
`;

const ldsEclipse = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

// Create the styled-components
const Overlay = styled.div`
  background-color: var(--color-grey-800);
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 900;
  opacity: 0.8;
`;

const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  width: 100vw;
  height: 100vh;
`;

const ImageLoading = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 9rem;
  height: 9rem;
  background: url(https://brademar.com/wp-content/uploads/2022/10/CellphoneS-Logo-PNG-2.png)
    center no-repeat;
  background-size: contain;
  animation: ${aniImage} 1s linear infinite;
`;

const SpinnerLoading = styled.div`
  content: "";
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12rem;
  height: 12rem;
  border-radius: 100%;
  box-shadow: 0 4px 0 0 #000;
  animation: ${ldsEclipse} 0.3s linear infinite;
`;

// Usage in your React component

export default function Spinner() {
  return (
    <>
      <Overlay />
      <Container>
        <ImageLoading />
        <SpinnerLoading />
      </Container>
    </>
  );
}
