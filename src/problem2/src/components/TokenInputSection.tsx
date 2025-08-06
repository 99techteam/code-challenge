import React from "react";
import type { EnrichedToken } from "@/types/swap";
import { TokenSelector } from "./TokenSelector";
import { Input } from "@/components/ui/input";

interface TokenInputSectionProps {
  label: string;
  token: EnrichedToken | null;
  amount: string;
  onTokenSelect: (token: EnrichedToken) => void;
  onAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  tokens: EnrichedToken[];
}

export const TokenInputSection: React.FC<TokenInputSectionProps> = ({
  label,
  token,
  amount,
  onTokenSelect,
  onAmountChange,
  onKeyDown,
  readOnly = false,
  autoFocus = false,
  placeholder = "0.0",
  tokens,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        {token && token.price && <span>${token.price.toFixed(6)}</span>}
      </div>
      <div className="glass-card p-4 space-y-3 hover:shadow-lg transition-all duration-300">
        <TokenSelector
          selectedToken={token}
          tokens={tokens}
          onSelectToken={onTokenSelect}
          placeholder="Select token"
        />
        {readOnly ? (
          <Input
            type="text"
            placeholder={placeholder}
            value={amount}
            className="input-glass text-2xl font-semibold text-right bg-transparent select-none"
            readOnly
            tabIndex={-1}
            style={{ userSelect: "none" }}
          />
        ) : (
          <Input
            type="text"
            placeholder={placeholder}
            value={amount}
            onChange={onAmountChange}
            onKeyDown={onKeyDown}
            className="input-glass text-2xl font-semibold text-right bg-transparent focus:ring-0"
            autoFocus={autoFocus}
          />
        )}
      </div>
    </div>
  );
};
