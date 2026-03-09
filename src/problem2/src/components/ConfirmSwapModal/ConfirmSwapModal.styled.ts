import styled from "styled-components";

const ConfirmSwapModalContainer = styled.div`
    position: fixed;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.35);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ConfirmSwapModalInner = styled.div`
    max-width: 375px;
    background-color: white;
    border-radius: 16px;
    padding: 32px;
    position: relative;
    margin: 16px;
`;

const ConfirmSwapModalContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 16px;
    color: black;
    margin-top: 16px;
`;

const Description = styled.p`
    font-size: 16px;
    color: #6e6e6e;
    text-align: center;
    line-height: 1.5;
`;

const TokenSwapInformation = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 32px 0;
`;

const CloseModalIcon = styled.img`
    position: absolute;
    cursor: pointer;
    padding: 16px 8px 16px;
    top: 16px;
    right: 16px;
`;

export {
    ConfirmSwapModalContainer,
    ConfirmSwapModalInner,
    ConfirmSwapModalContent,
    Title,
    TokenSwapInformation,
    Description,
    CloseModalIcon,
};
