import React from "react";
import { ChevronDown } from "lucide-react";
import { Token } from "@/types";
import { cn } from "@/utils/cn";
import { Skeleton } from "@/components/ui";

interface TokenInputProps {
  label: string;
  amount: string;
  token: Token;
  onAmountChange?: (val: string) => void;
  onTokenClick: () => void;
  readOnly?: boolean;
  balance?: number;
  loading?: boolean;
  error?: string;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  label,
  amount,
  token,
  onAmountChange,
  onTokenClick,
  readOnly,
  balance,
  loading,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numbers and one decimal point
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      onAmountChange && onAmountChange(val);
    }
  };

  return (
    <div
      className={cn(
        "bg-background-secondary rounded-xl p-4 border border-gray-700 transition-colors hover:border-gray-600 focus-within:!border-primary",
        error && "!border-danger"
      )}>
      <div className="flex justify-between mb-2">
        <label className="text-sm text-text-secondary">{label}</label>
        {balance !== undefined && (
          <div className="text-sm text-text-secondary">
            Balance: <span className="text-text-primary font-medium">{balance}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {loading ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <input
            type="text"
            value={amount}
            onChange={handleChange}
            placeholder="0.00"
            className={cn(
              "bg-transparent text-2xl font-bold text-text-primary placeholder:text-gray-600 focus:outline-none w-full",
              readOnly && "cursor-default focus:ring-0"
            )}
            readOnly={readOnly}
          />
        )}

        <button
          onClick={onTokenClick}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-full pl-2 pr-3 py-1.5 transition-colors flex-shrink-0">
          <img
            src={token.icon}
            alt={token.symbol}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-semibold text-text-primary">{token.symbol}</span>
          <ChevronDown
            size={16}
            className="text-text-secondary"
          />
        </button>
      </div>
      {error && <div className="text-danger text-xs mt-2 font-medium">{error}</div>}
    </div>
  );
};
