import { useState } from "react";
import type { TokenData } from "../types/currency";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SwapInputProps {
  swapToken: TokenData | null;
  setSwapToken: (token: TokenData) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  tokens: TokenData[];
  label: string;
  disabled?: boolean;
}

const TokenIcon = ({ icon, name }: { icon: string; name: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !icon) {
    return (
      <div className="size-4 rounded-full bg-linear-to-br from-[#e3ef26] to-[#0c342c] flex items-center justify-center text-xs font-bold text-white mr-1">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={icon}
      alt={name}
      className="size-4 mr-1"
      onError={() => setHasError(true)}
    />
  );
};

const SwapInput = ({
  swapToken,
  setSwapToken,
  onAmountChange,
  amount,
  label,
  tokens,
  disabled = false,
}: SwapInputProps) => {
  return (
    <div className="grid grid-cols-2 my-3">
      <Field className="w-full max-w-48">
        <Select
          value={swapToken?.name || ""}
          onValueChange={(value) => {
            const selected = tokens.find((token) => token.name === value);
            if (selected) setSwapToken(selected);
          }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {tokens.map((token) => (
                <SelectItem key={token.name} value={token.name}>
                  <TokenIcon icon={token.icon} name={token.name} />
                  {token.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <Input
          type="number"
          onChange={(e) => onAmountChange(e.target.value)}
          value={amount}
          disabled={disabled}
          placeholder={label}
        />
      </Field>
    </div>
  );
};

export default SwapInput;
