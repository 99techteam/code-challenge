import styled from "styled-components";

const SwapPageContainer = styled.div`
    height: 100vh;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const SwapPageInner = styled.div`
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 32px;
    border: 1px solid #d2d9ee;
    padding: 12px;
`;

const Heading = styled.h1`
    font-size: 56px;
    font-weight: 700;
    margin-bottom: 32px;
    color: rgb(34, 34, 34);
    text-align: center;
    width: 100%;
`;

const SwapInputArrowButton = styled.div`
    background-color: #f5f5f5;
    padding: 16px;
    margin: -28px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 6px solid white;
    position: relative;
    z-index: 1;
    cursor: pointer;
`;

const SwapArrowIcon = styled.img`
    width: 20px;
    height: 20px;
`;

export {
    SwapPageContainer,
    SwapPageInner,
    Heading,
    SwapInputArrowButton,
    SwapArrowIcon,
};
