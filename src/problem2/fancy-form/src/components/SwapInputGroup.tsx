import React from "react";
import FormInput from "./FormInput";
import CurrencySelect from "./CurrencySelect";
import type { Token } from "@models/token";

type SwapInputGroupProps = {
  label: string;
  amount: string;
  onAmountChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  tokenCurrency: string;
  onTokenChange: (id: string) => void;
  tokens: Token[];
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

export default function SwapInputGroup({
  label,
  amount,
  onAmountChange,
  readOnly,
  placeholder,
  tokenCurrency,
  onTokenChange,
  tokens,
  inputProps = {},
}: SwapInputGroupProps) {
  return (
    <div className="grid grid-cols-12 gap-3 items-end">
      <div className="col-span-7">
        <label className="text-sm font-medium">{label}</label>
        <FormInput
          value={amount}
          onChange={
            onAmountChange
              ? (e) => {
                  const v = e.target.value.replace(",", ".");
                  onAmountChange(v);
                }
              : undefined
          }
          readOnly={readOnly}
          placeholder={placeholder}
          {...inputProps}
        />
      </div>
      <div className="col-span-5">
        <CurrencySelect tokens={tokens} value={tokenCurrency} onChange={onTokenChange} label="" />
      </div>
    </div>
  );
}