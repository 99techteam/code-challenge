import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TokenSelector } from "@/components/TokenSelector";
import { cn } from "@/utils/cn";
import { type Token } from "@/services";
import { UseFormRegisterReturn } from "react-hook-form";

interface SwapCardProps {
  title: string;
  token: Token | null;
  amount: string;
  onAmountChange: (amount: string) => void;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  showMax?: boolean;
  onMaxClick?: () => void;
  className?: string;
  register?: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}

export function SwapCard({
  title,
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  tokens,
  showMax = false,
  onMaxClick,
  className,
  register,
  error,
  disabled = false,
}: SwapCardProps) {
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);

  return (
    <div
      className={cn(
        "p-4 bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm shadow-lg",
        className
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm text-gray-200 font-medium">{title}</h3>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <TokenSelector
          token={token}
          tokens={tokens}
          onSelect={onTokenSelect}
          isOpen={isTokenSelectorOpen}
          onOpenChange={setIsTokenSelectorOpen}
          disabled={disabled}
        />

        <div className="flex-1 text-right">
          <Input
            {...register}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "text-right text-2xl font-semibold bg-transparent border-none p-0 h-auto placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
              error && "text-red-300",
              disabled ? "text-white/70 cursor-not-allowed" : "text-white"
            )}
            placeholder="0"
            type="number"
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center text-gray-300">
          Balance: {token ? token.balance : "--"}
          {showMax && token && (
            <Button
              onClick={onMaxClick}
              variant="ghost"
              size="sm"
              disabled={disabled}
              className={cn(
                "text-xs mx-1 px-2 py-1 h-auto",
                disabled
                  ? "text-teal-300/70 cursor-not-allowed"
                  : "text-teal-300 hover:text-teal-200 hover:bg-teal-500/20"
              )}
            >
              Max
            </Button>
          )}
        </span>
        <span className="text-gray-300">{token ? token.value : "--"}</span>
      </div>

      {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
    </div>
  );
}
