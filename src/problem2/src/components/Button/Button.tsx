import React from "react";
import styled from "styled-components";
import Loading from "../Loading/Loading";
import { ButtonVariant } from "../../types";

interface ButtonProps {
    variant?: ButtonVariant;
    disabled?: boolean;
    title: string;
    loading?: boolean;
    onClick?: () => void;
}

const ButtonContainer = styled.button<Omit<ButtonProps, "title">>`
    /* Shared styles */
    // padding: 16px 0;
    height: 64px;
    font-size: 20px;
    font-weight: 600;
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    border-radius: 24px;
    border: none;
    outline: none;
    transition: all 0.3s ease;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;

    margin-top: 16px;

    ${({ variant }) =>
        variant === "primary" &&
        `
      background-color: #FFE2F1;
      color: #fb118e;
    `}
    ${({ variant }) =>
        variant === "secondary" &&
        `
      background-color: #fb118e;
      color: white;
    `}
    ${({ variant }) =>
        variant === "disabled" &&
        `
      background-color: #F5F6FC;
      color: #BBBFCF;
    `}

    &:hover {
        opacity: 0.8;
    }
`;

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    disabled,
    title,
    loading,
    onClick,
}) => {
    return (
        <ButtonContainer
            onClick={onClick}
            variant={variant}
            disabled={disabled}
            title={title}
        >
            {loading && <Loading />}
            {title}
        </ButtonContainer>
    );
};

export default Button;
