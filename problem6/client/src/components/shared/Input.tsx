import React, { useState } from "react";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import styled, { css } from "styled-components";

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 2.4rem;
  width: 100%;
`;

const InputStyled = styled.input`
  width: 100%;
  padding: 0 1rem;
  padding-top: 2rem;
  font-size: 1.4rem;
  left: 0px;
  border: none;
  border-radius: 1rem;
  background-color: transparent;
  border-bottom: solid 2px var(--color-grey-200);
  &:focus {
    border-color: "var(--color-primary)";
    border-bottom: solid 2px var(--color-primary);
    outline: none;
  }
`;

const Label = styled.label<{ $focused: boolean; $hasValue: boolean }>`
  position: absolute;
  ${(props) =>
    props.$focused || props.$hasValue
      ? css`
          left: 0.5rem;
          top: 0;
        `
      : css`
          left: 1rem;
          top: 1.8rem;
        `};
  font-size: ${(props) =>
    props.$focused || props.$hasValue ? "1.2rem" : "1.4rem"};
  color: ${(props) =>
    props.$focused ? "var(--color-primary)" : "var(--color-grey-400)"};
  transition: all 0.3s;
  cursor: auto;
`;

const ShowPasswordButton = styled.button<{ $showPassword: boolean }>`
  position: absolute;
  right: 1rem;
  top: 2.8rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: ${(props) =>
    props.$showPassword ? "var(--color-primary)" : "inherit"};
`;

const ErrorInput = styled.p`
  margin-top: 5px;
  color: var(--color-primary);
  font-size: 1.2rem;
  font-weight: 600;
  text-align: left;
`;

interface IProps {
  id: string;
  type: React.HTMLInputTypeAttribute;
  label: string;
  register: any;
  hasValue: boolean;
  children?: React.ReactNode;
  error?: string;
}

export default function Input({
  type,
  id,
  label,
  error,
  children,
  register,
  hasValue,
}: IProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputFocus = () => setFocused(true);

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) =>
    setFocused(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <InputContainer>
      <InputStyled
        type={type !== "password" ? type : showPassword ? "text" : type}
        id={id}
        {...register}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        autoComplete="true"
      />
      <Label htmlFor={id} $focused={focused} $hasValue={hasValue}>
        {label}
      </Label>
      {type === "password" && (
        <ShowPasswordButton
          tabIndex={-1}
          type="button"
          onClick={toggleShowPassword}
          $showPassword={showPassword}
        >
          {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
        </ShowPasswordButton>
      )}
      {children}
      {error && <ErrorInput>{error}</ErrorInput>}
    </InputContainer>
  );
}
