import styled from "styled-components";

const Button = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background-color: var(--color-primary);
  color: var(--color-white);
  border-radius: 1rem;
  font-size: 1.8rem;
  outline: none;
  border: none;
  box-shadow: var(--shadow-around);
  display: flex;
  justify-content: center;
  text-transform:uppercase;

  &:focus {
    outline: none;
  }
`;

export default Button;
