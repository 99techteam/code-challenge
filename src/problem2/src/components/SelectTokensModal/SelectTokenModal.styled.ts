import styled from "styled-components";

const SelectTokensModalContainer = styled.div`
    position: fixed;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.35);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const SelectTokensModalInner = styled.div`
    width: 375px;
    padding-bottom: 32px;
    background-color: white;
    border-radius: 16px;
`;

const SelectTokensModalHeader = styled.div`
    // padding-left: 24px;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const SelectTokenModalSearchInputBox = styled.div`
    border-radius: 12px;
    background-color: white;
    border: 1px solid #d2d9ee;
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: 8px;
    margin-top: 8px;
`;

const SelectTokenModalSearchInput = styled.input`
    padding: 4px 0;
    border: none;
    outline: none;
    color: rgb(34, 34, 34);
    background-color: white;
    &::placeholder {
        color: rgb(125, 125, 125);
    }
    font-size: 15px;
    font-weight: 500;
    width: 100%;
    // margin-top: 16px;
    margin-left: 8px;
`;

const SearchInputIcon = styled.img`
    width: 20px;
    height: 20px;
`;

const Title = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: rgb(34, 34, 34);
`;

const CloseModalIcon = styled.img`
    cursor: pointer;
    padding: 16px 8px 16px;
`;

const SelectTokensModalContent = styled.div`
    height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
`;

const SubTitle = styled.h3`
    font-size: 14px;
    font-weight: 700;
    color: rgb(155, 155, 155);
    width: 100%;
    margin: 16px;
`;

const TokenImageItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin-bottom: 16px;
    padding: 8px 16px;
    border-radius: 8px;
    transition: 0.3s;
    &:hover {
        background-color: #d2d9ee60;
    }
`;

const Currency = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: rgb(34, 34, 34);
    width: 100%;
    width: 100%;
    height: 100%;
`;

export {
    SelectTokensModalContainer,
    SelectTokensModalInner,
    SelectTokensModalHeader,
    Title,
    SubTitle,
    CloseModalIcon,
    SelectTokensModalContent,
    TokenImageItem,
    Currency,
    SelectTokenModalSearchInput,
    SelectTokenModalSearchInputBox,
    SearchInputIcon,
};
