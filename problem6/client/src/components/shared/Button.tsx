/* eslint-disable no-unused-vars */
import styled, { css } from "styled-components";

const sizes: object = {
  small: css`
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    text-transform: uppercase;
    font-weight: 600;
    text-align: center;
  `,
  medium: css`
    font-size: 1.4rem;
    padding: 1.2rem 1.6rem;
    font-weight: 600;
  `,
  large: css`
    font-size: 1.6rem;
    padding: 1.2rem 2.4rem;
    font-weight: 500;
  `,
};

const variations: object = {
  primary: css`
    color: var(--color-brand-50);
    background-color: var(--color-primary);
  `,
  secondary: css`
    color: var(--color-grey-600);
    background: var(--color-white);
    border: 1px solid var(--color-grey-200);

    &:hover {
      background-color: var(--color-grey-100);
    }
  `,
  danger: css`
    color: var(--color-red-100);
    background-color: var(--color-red-700);

    &:hover {
      background-color: var(--color-red-800);
    }
  `,
};

const Button = styled.button<{
  $size?: string;
  $variation?: string;
  $width?: string;
}>`
  text-align: center;
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
  font-weight: 600;
  width: 100%;
  ${(props: any) => sizes[props.$size]}
  ${(props: any) => variations[props.$variation]}
  outline: none;
  border: none;

  &:focus {
    outline: none;
  }
`;

Button.defaultProps = {
  $variation: "primary",
  $size: "medium",
};
export default Button;
