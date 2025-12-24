import { Select } from "@/common/components/Select";
import { TokenIcon } from "@/features/swap/components/TokenIcon";
import type { SelectOption } from "@/common/components/Select";
import type { FC } from "react";

interface TokenSelectorProps {
  value?: string;
  tokens: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TokenSelector: FC<TokenSelectorProps> = ({
  value,
  tokens,
  onChange,
  disabled = false,
}) => {
  const options: SelectOption[] = tokens.map((t) => ({
    value: t,
    label: t,
    leftSlot: <TokenIcon symbol={t} size={24} />, // icon trong dropdown
  }));

  return (
    <Select
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      placeholder="Select token"
      className="text-white"
    />
  );
};
