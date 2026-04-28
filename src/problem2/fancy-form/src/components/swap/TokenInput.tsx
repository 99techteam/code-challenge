import { useCallback } from 'react';
import type { Token } from '@/types';
import type { SwapDirection } from '@/types/swap';
import { sanitizeAmountInput, formatUsd } from '@/utils/format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface TokenInputProps {
  direction: SwapDirection;
  token: Token | null;
  amount: string;
  usdValue: number;
  onAmountChange: (amount: string) => void;
  onTokenSelect: () => void;
  disabled?: boolean;
}

export function TokenInput({
  direction,
  token,
  amount,
  usdValue,
  onAmountChange,
  onTokenSelect,
  disabled = false,
}: TokenInputProps) {
  const label = direction === 'sell' ? 'You pay' : 'You receive';

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeAmountInput(e.target.value);
      if (sanitized !== null) {
        onAmountChange(sanitized);
      }
    },
    [onAmountChange],
  );

  return (
    <div
      className={`rounded-3xl p-4 transition-all duration-300 border ${direction === 'sell'
          ? 'bg-white/50 border-white/80 shadow-sm dark:bg-black/20 dark:border-white/5'
          : 'bg-white/30 border-white/40 dark:bg-black/40 dark:border-transparent'
        } hover:bg-white/70 dark:hover:bg-black/40`}
    >
      {/* Label */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>

      {/* Input + Token Selector Row */}
      <div className="flex items-center gap-3">
        {/* Amount Input using Shadcn Input but styling it essentially to look seamless */}
        <Input
          id={`${direction}-amount`}
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={handleInputChange}
          disabled={disabled}
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-3xl font-semibold text-slate-900 shadow-none outline-none focus-visible:ring-0 placeholder:text-slate-300 dark:text-white dark:placeholder:text-slate-900 sm:text-4xl"
        />

        {/* Token Selector Pill */}
        <Button
          id={`${direction}-token-selector`}
          variant="outline"
          onClick={onTokenSelect}
          className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-3 py-5 font-semibold shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 ${token
              ? 'bg-white text-slate-800 border-slate-200/50 hover:bg-slate-50 hover:border-slate-300/50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700'
              : 'bg-slate-900 text-white border-transparent hover:bg-slate-800 hover:text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
            }`}
        >
          {token ? (
            <>
              {token.hasIcon ? (
                <img
                  src={token.iconUrl}
                  alt={token.currency}
                  className="h-6 w-6 rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-[10px] font-bold text-white">
                  {token.currency.slice(0, 2)}
                </div>
              )}
              <span className="text-sm">{token.currency}</span>
              <ChevronDown className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="text-sm">Select token</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* USD Value */}
      <div className="mt-1.5 h-5 text-sm text-slate-400 dark:text-slate-500">
        {amount && parseFloat(amount) > 0 && token ? formatUsd(usdValue) : ''}
      </div>
    </div>
  );
}
