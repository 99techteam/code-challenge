import styled from "styled-components";

const SwapSectionContainer = styled.div`
    border: 1px solid rgb(249, 249, 249);
    border-radius: 24px;
    padding: 16px;
    background-color: rgb(249, 249, 249);
`;

const Title = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: rgb(34, 34, 34);
    margin-bottom: 16px;
    width: 100%;
`;

const InputContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TextInput = styled.input`
    padding: 8px 0;
    border: none;
    outline: none;
    color: rgb(34, 34, 34);
    background-color: rgb(249, 249, 249);
    &::placeholder {
        color: rgb(125, 125, 125);
    }
    font-size: 32px;
    font-weight: 700;
    margin-right: 32px;
    width: 60%;
`;

const PriceInUSD = styled.p`
    color: rgb(125, 125, 125);
    font-size: 14px;
    margin-top: 16px;
    width: 100%;
    font-weight: 600;
`;

const SelectTokenButton = styled.div`
    background-color: #fb118e;
    padding: 12px 16px;
    color: white;
    display: flex;
    border-radius: 32px;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
        opacity: 0.6;
    }
`;

const SelectTokenButtonContent = styled.div`
    display: flex;
    align-items: center;
`;

const SelectTokenButtonTitle = styled.p`
    color: white;
    font-size: 14px;
    font-weight: 700;
    margin-right: 8px;
`;

const SelectTokenButtonImage = styled.div`
    margin-right: 8px;
`;

const SelectTokenButtonIcon = styled.img`
    width: 16px;
    height: 16px;
`;

export {
    SwapSectionContainer,
    Title,
    InputContent,
    TextInput,
    PriceInUSD,
    SelectTokenButton,
    SelectTokenButtonContent,
    SelectTokenButtonTitle,
    SelectTokenButtonImage,
    SelectTokenButtonIcon,
};
