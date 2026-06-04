import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFetchIcons } from '@/modules/swap-form/api/queries';

interface CurrencyInputProps {
  amount: string;
  currency: string;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: string) => void;
  options: string[];
  usdValue?: string;
  isAmountLoading?: boolean;
  readOnly?: boolean;
}

export default function CurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  options,
  usdValue,
  isAmountLoading = false,
  readOnly = false,
}: CurrencyInputProps) {
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { data: iconSvg, isLoading: isIconLoading } = useFetchIcons(currency);
  const iconSrc = iconSvg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(iconSvg)}`
    : '';

  const formatAmountForDisplay = (rawAmount: string) => {
    if (!rawAmount) {
      return '';
    }

    const parsedAmount = Number(rawAmount);
    if (!Number.isFinite(parsedAmount)) {
      return rawAmount;
    }

    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 6,
    }).format(parsedAmount);
  };

  const displayAmount =
    readOnly || !isAmountFocused ? formatAmountForDisplay(amount) : amount;
  const showUsdValue = typeof usdValue === 'string';

  return (
    <div className="relative rounded-2xl border border-border-soft bg-surface-alt px-4 py-4 transition-colors focus-within:border-brand focus-within:bg-surface sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Popover open={isCurrencyOpen} onOpenChange={setIsCurrencyOpen}>
          <PopoverTrigger
            type="button"
            className="flex w-fit max-w-[calc(100vw-4rem)] items-center rounded-full border border-border-soft bg-surface px-2.5 py-1.5 pl-2 text-text-strong transition-colors hover:bg-surface-muted sm:max-w-none sm:px-3"
          >
            <div className="mr-2 flex size-6 items-center justify-center overflow-hidden rounded-full bg-surface-muted">
              {currency && isIconLoading ? (
                <Skeleton className="size-full rounded-full bg-icon-muted" />
              ) : currency && iconSrc ? (
                <img src={iconSrc} alt={currency} />
              ) : (
                <div className="size-full rounded-full bg-icon-muted" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-base font-semibold text-text-strong sm:gap-2 sm:text-lg">
              <span className="truncate">{currency || 'Select'}</span>
              <ChevronDown size={18} className="text-text-subtle sm:size-5" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            sideOffset={8}
            align="start"
            className="w-[min(240px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border-soft bg-surface p-1 text-text-strong shadow-panel"
          >
            <Command className="h-[260px] bg-transparent text-text-strong">
              <CommandInput
                placeholder="Search currency..."
                className="text-text-strong placeholder:text-text-subtle"
              />
              <CommandList className="h-[212px]">
                <CommandEmpty className="flex h-full items-center justify-center text-text-muted">
                  No currency found.
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      data-checked={option === currency ? 'true' : undefined}
                      className="text-text-strong data-selected:bg-surface-muted data-selected:text-text-strong"
                      onSelect={(value) => {
                        onCurrencyChange(value);
                        setIsCurrencyOpen(false);
                      }}
                    >
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {isAmountLoading ? (
          <div className="flex w-full flex-1 flex-col items-end">
            <Skeleton className="h-11 w-full rounded-md bg-surface-muted" />
            {showUsdValue ? (
              <Skeleton className="mt-1 h-4 w-20 rounded-md bg-surface-muted" />
            ) : null}
          </div>
        ) : (
          <div className="flex w-full flex-1 flex-col items-end">
            <input
              type="text"
              inputMode="decimal"
              className="inline-block min-h-11 w-full appearance-none bg-transparent p-0 text-right text-[28px] font-medium leading-tight text-text-strong placeholder:text-text-subtle read-only:text-text-muted focus:outline-none sm:text-[34px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0"
              value={displayAmount}
              readOnly={readOnly}
              onFocus={() => {
                if (!readOnly) {
                  setIsAmountFocused(true);
                }
              }}
              onBlur={() => setIsAmountFocused(false)}
              onKeyDown={(e) => {
                if (
                  e.key === '-' ||
                  e.key === 'e' ||
                  e.key === 'E' ||
                  e.key === ','
                ) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                if (readOnly) {
                  return;
                }

                onAmountChange(e.target.value.replace(/,/g, ''));
              }}
            />
            {showUsdValue ? (
              <p className="mt-1 text-right text-xs text-text-muted">
                {usdValue}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
