import styled, { keyframes } from "styled-components";

import LoadingIcon from "../../assets/img/icons/loading.svg";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div``;

const LoadingContent = styled.img`
    width: 32px;
    height: 32px;
    animation: ${rotate} 2s linear infinite;
`;

const Loading = () => {
    return (
        <LoadingContainer>
            <LoadingContent src={LoadingIcon} alt="loading" />
        </LoadingContainer>
    );
};

export default Loading;
