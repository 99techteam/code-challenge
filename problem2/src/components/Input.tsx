import styled from "styled-components";

const Input = styled.input`
  width: 100%;
  font-size: 2.4rem;
  background-color: var(--color-white);
  border-radius: 5px;
  border: 1px solid var(--color-grey-300);
  padding: 8px 1.6rem;
  box-shadow: var(--shadow-sm);
  align-self: flex-start;

  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--color-grey-400);
  }
`;

export default Input;
