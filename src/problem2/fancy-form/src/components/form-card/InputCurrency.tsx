import type { Token } from '@/common/types/token';
import { cn } from '@/lib/utils';
import { useBalanceStore } from '@/store/balance.store';
import { Controller, useFormContext } from 'react-hook-form';

import { Field, FieldContent, FieldError } from '../ui/field';
import { Input } from '../ui/input';
import { TokenSelector } from './TokenSelector';

interface InputCurrencyProps extends React.ComponentProps<'input'> {
  label: string;
  name: string;
  token: Token;
  setToken: (value: Token) => void;
}
export const InputCurrency = ({
  name,
  token,
  setToken,
  label,
  className,
  ...props
}: InputCurrencyProps) => {
  const { control } = useFormContext();
  const { getBalanceByCurrency } = useBalanceStore();

  const currentPayTokenBalance = getBalanceByCurrency(token?.currency || '');

  return (
    <div className="space-y-3 mb-2 relative z-10">
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => {
          return (
            <Field>
              <FieldContent>
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="pay-amount"
                    className="text-label-caps text-on-surface-variant font-bold"
                  >
                    {label}
                  </label>

                  <p>Balance: ${currentPayTokenBalance.amount}</p>
                </div>
                <div className="bg-surface-container-low border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all  focus-within:shadow-[0_0_30px_oklch(0.81_0.100_308/0.15)] group/input">
                  <Input
                    id="pay-amount"
                    type="number"
                    placeholder="0.0"
                    value={value || ''}
                    onChange={(e) => {
                      const numValue = parseFloat(e.target.value);
                      onChange(numValue);
                    }}
                    className={cn('text-display-lg!', className)}
                    {...props}
                  />
                  <TokenSelector selectedToken={token} onSelect={setToken} />
                </div>
              </FieldContent>
              <FieldError errors={[error]} />
            </Field>
          );
        }}
      />
    </div>
  );
};
