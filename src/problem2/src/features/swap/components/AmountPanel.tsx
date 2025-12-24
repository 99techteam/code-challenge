import { Input } from "@/common/components/Input";
import { cn } from "@/common/utils/cn";
import type { ReactNode } from "react";

interface Props {
  token: ReactNode;
  value: string;
  onChange?: (value: string) => void;
  fiatValue: string;
  className?: string;
}

export function AmountPanel({
  token,
  value,
  onChange,
  fiatValue,
  className,
}: Props) {
  const editable = Boolean(onChange);

  // validate input to allow only numbers and one decimal point
  const handleChange = (val: string) => {
    let newVal = val.replace(/[^0-9.]/g, "");
    const parts = newVal.split(".");
    if (parts.length > 2) {
      newVal = parts[0] + "." + parts.slice(1).join("");
    }
    if (onChange) onChange(newVal);
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-4 bg-gradient-to-b from-[#2a2f3a] to-[#1c2029] border border-white/10",
        className
      )}
    >
      <div className="flex justify-between items-center text-xs text-white/60 mb-2">
        {token}
      </div>

      <div className="flex justify-between items-end gap-4">
        {editable ? (
          <Input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="0.0"
            className="flex-1 text-[32px] font-semibold tracking-tight truncate"
          />
        ) : (
          <div className="flex-1 text-[32px] font-semibold tracking-tight text-white truncate">
            {value}
          </div>
        )}

        <div className="text-[15px] font-medium text-white/60 whitespace-nowrap truncate">
          {fiatValue}
        </div>
      </div>
    </div>
  );
}
