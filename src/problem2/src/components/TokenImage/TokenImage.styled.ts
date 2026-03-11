import styled from "styled-components";

const TokenImageContainer = styled.img`
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;

    @media screen and (max-width: 768px) {
        width: ${(props) => Number(props.width) * 2 / 3}px;
        height: ${(props) => Number(props.height) * 2 / 3}px;
    }
`;

export { TokenImageContainer };
