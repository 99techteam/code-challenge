import React from "react";

import { tokens } from "src/assets";
import styles from "./input.module.css";
import { ReactComponent as ArrowDownIcon } from "src/assets/icons/arrow-down.svg";
import { TokenType } from "../list-tokens-modal";
import { roundNumber } from "src/utils/formats";

interface InputProps {
  label?: string;
  tokenInfo?: TokenType;
  id: string;
  value: string;
  type?: "text" | "number";
  className?: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  onSelectCurrency?: () => void;
}

const Input = ({
  label,
  tokenInfo,
  onSelectCurrency,
  ...props
}: InputProps) => {
  return (
    <div className={styles.container}>
      <label htmlFor={props.id}>{label}</label>
      <div className={styles.inputWrapper}>
        <input className={styles.input + ` ${props.className}`} {...props} />
        {tokenInfo?.currency ? (
          <div className={styles.currencyWrapper} onClick={onSelectCurrency}>
            {React.createElement(tokens[tokenInfo.currency].ReactComponent)}
            <div className={styles.currencyName}>
              {tokenInfo.currency.toUpperCase()}
            </div>
            <ArrowDownIcon fill="#fff" height={14} />
          </div>
        ) : (
          <div className={styles.selectTokenWrapper} onClick={onSelectCurrency}>
            <div className={styles.text}>Select token</div>
            <ArrowDownIcon fill="#fff" height={14} />
          </div>
        )}
      </div>
      {Number(props.value) > 0 && (
        <div className={styles.price}>
          ${roundNumber(Number(tokenInfo?.price) * Number(props.value))}
        </div>
      )}
    </div>
  );
};

export default Input;
