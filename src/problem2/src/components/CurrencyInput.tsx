import { memo, useId } from 'react';
import CurrencySelect from './CurrencySelect';
import type { TokenPrice } from '../hooks/useTokenPrices';

interface CurrencyInputProps {
  label: string;
  amount: string;
  currency: string;
  tokens: TokenPrice[];
  price: number;
  readOnly?: boolean;
  onAmountChange?: (val: string) => void;
  onCurrencyChange: (val: string) => void;
  onBlur?: () => void;
}

export const CurrencyInput = memo(function CurrencyInput({
  label,
  amount,
  currency,
  tokens,
  price,
  readOnly = false,
  onAmountChange,
  onCurrencyChange,
  onBlur
}: CurrencyInputProps) {
  const inputId = useId();

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-3 border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <label htmlFor={inputId} className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5 block">{label}</label>
      <div className="flex items-center gap-3">
        <input
          id={inputId}
          type="text"
          inputMode={readOnly ? undefined : "decimal"}
          value={amount}
          readOnly={readOnly}
          onChange={(e) => onAmountChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder="0.00"
          className={`bg-transparent text-xl text-slate-900 dark:text-white font-semibold outline-none w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 ${readOnly ? 'cursor-not-allowed' : ''}`}
        />
        <CurrencySelect 
          value={currency} 
          onChange={onCurrencyChange} 
          tokens={tokens} 
        />
      </div>
      <div className="mt-2 text-xs text-slate-500 font-medium">
        1 {currency} = ${price.toFixed(2)}
      </div>
    </div>
  );
});

export default CurrencyInput;
