import styled from "styled-components";
import { css } from "styled-components";

const Heading = styled.header<{ $as: string }>`
  color: #333;
  ${(props) =>
    props.$as === "h1" &&
    css`
      font-size: 3rem;
      font-weight: 600;
    `}
  ${(props) =>
    props.$as === "h2" &&
    css`
      font-size: 2.6rem;
      font-weight: 600;
    `}
    ${(props) =>
    props.$as === "h3" &&
    css`
      font-size: 2.2rem;
      font-weight: 600;
    `}
    ${(props) =>
    props.$as === "h4" &&
    css`
      font-size: 1.8rem;
      font-weight: 600;
    `}
      ${(props) =>
    props.$as === "h5" &&
    css`
      font-size: 1.4rem;
      font-weight: 600;
    `}
      ${(props) =>
    props.$as === "h6" &&
    css`
      font-size: 1.2rem;
      font-weight: 600;
    `}
    
  line-height: 1.4;
`;

export default Heading;
