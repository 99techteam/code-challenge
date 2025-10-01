import type { Token } from "@/types";
import { useCallback } from "react";
import TokenSelector from "./TokenSelector";

const TokenInput = ({ 
  label, 
  token, 
  amount, 
  usdValue, 
  onAmountChange, 
  onTokenClick, 
  readOnly = false 
}: {
  label: string;
  token: Token;
  amount: string;
  usdValue: string;
  onAmountChange?: (value: string) => void;
  onTokenClick: () => void;
  readOnly?: boolean;
}) => {
  const handleInputChange = useCallback((value: string) => {
    if (!onAmountChange) return;
    
    if (value === '') {
      onAmountChange('');
      return;
    }

    const sanitized = value.replace(/^0+(?=\d)/, '');
    if (!/^\d*\.?\d*$/.test(sanitized)) return;
    
    onAmountChange(sanitized);
  }, [onAmountChange]);

  return (
    <div className="mb-2">
      <div className="text-sm mb-3 font-medium text-muted-foreground">{label}:</div>
      <div className="p-5 bg-muted rounded-lg hover:bg-muted/80">
        <div className="flex justify-between items-start mb-2">
          <TokenSelector token={token} onClick={onTokenClick} />
          <div className="text-right flex-1 ml-4 min-w-0">
            {readOnly ? (
              <div className="text-4xl font-bold font-mono break-all">
                {amount || '0.00'}
              </div>
            ) : (
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0.00"
                className="text-4xl font-bold outline-none text-right w-full bg-transparent font-mono focus:scale-105"
              />
            )}
            <div className="text-sm mt-1 text-muted-foreground break-all">
              ${usdValue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInput;