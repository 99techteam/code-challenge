import { HTMLAttributes } from "react";
import styled from "styled-components";

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
    direction?: "row" | "row-reverse" | "column" | "column-reverse";
    justify?:
        | "flex-start"
        | "flex-end"
        | "center"
        | "space-between"
        | "space-around";
    align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
    wrap?: boolean;
    gap?: string;
}

// Define a styled component for Flex
const Flex = styled.div<FlexProps>`
    display: flex;
    flex-direction: ${(props) => props.direction || "row"};
    justify-content: ${(props) => props.justify || "flex-start"};
    align-items: ${(props) => props.align || "stretch"};
    flex-wrap: ${(props) => (props.wrap ? "wrap" : "nowrap")};
    gap: ${(props) => props.gap || "0"};
    /* Additional styling properties can be added here */
`;

export default Flex;
