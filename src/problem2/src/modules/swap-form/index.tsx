import CurrencyInput from '@/components/common/CurrencyInput';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownUp } from 'lucide-react';
import { useMemo } from 'react';
import { useFetchPrices } from './api/queries';
import { useSwapQuote } from './hook/useSwapQuote';
import { formatUsdValue, getUsdNotional } from './lib/utils';

export default function SwapForm() {
  const {
    data,
    isLoading: pricesLoading,
    isError: pricesError,
    error,
    isFetching: pricesFetching,
    refetch: refetchPrices,
  } = useFetchPrices();
  const currencies = useMemo(() => data?.currencies ?? [], [data?.currencies]);
  const prices = useMemo(() => data?.prices ?? {}, [data?.prices]);
  const {
    payAmount,
    receiveAmount,
    payLoading,
    receiveLoading,
    resolvedPayCurrency,
    resolvedReceiveCurrency,
    swapButtonRotate,
    handleAmountChange,
    handleCurrencyChange,
    handleSwap,
    reset,
  } = useSwapQuote(currencies);

  const canSubmitSwap =
    !pricesLoading &&
    !pricesError &&
    Number(payAmount) > 0 &&
    Boolean(resolvedPayCurrency) &&
    Boolean(resolvedReceiveCurrency);

  const handleSubmitSwap = () => {
    reset();
  };

  const usdPayNotional = getUsdNotional(payAmount, resolvedPayCurrency, prices);
  const usdReceiveNotional = getUsdNotional(receiveAmount, resolvedReceiveCurrency, prices);
  const usdPayValue =
    usdPayNotional === null ? '$0' : formatUsdValue(usdPayNotional);
  const usdReceiveValue =
    usdReceiveNotional === null ? '$0' : formatUsdValue(usdReceiveNotional);

  return (
    <form className="flex flex-col rounded-2xl border border-border-soft bg-surface p-2.5 shadow-panel sm:rounded-3xl sm:p-3">
      <div className="px-2 py-2.5 sm:px-4 sm:py-3">
        <h2 className="m-0 text-base font-semibold text-text-strong">
          Currency Swap
        </h2>
        <p className="mt-1.5 text-[13px] text-text-muted">
          Live quote based on latest available token prices.
        </p>
      </div>

      {pricesLoading ? (
        <div className="relative mb-2 flex flex-col gap-1">
          <Skeleton className="mb-1 h-[96px] w-full rounded-2xl bg-surface-alt sm:h-[104px]" />
          <Skeleton className="h-[96px] w-full rounded-2xl bg-surface-alt sm:h-[104px]" />
        </div>
      ) : pricesError ? (
        <div className="mb-2 rounded-2xl border border-danger-soft bg-danger-soft px-4 py-5 text-center sm:px-5 sm:py-6">
          <p className="text-sm font-medium text-danger">
            Unable to load live prices right now.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
            onClick={() => {
              void refetchPrices();
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="mb-2 flex flex-col">
          <div className="relative">
            <CurrencyInput
              amount={payAmount}
              currency={resolvedPayCurrency}
              onAmountChange={handleAmountChange('pay')}
              onCurrencyChange={handleCurrencyChange('pay')}
              options={currencies}
              usdValue={usdPayValue}
              isAmountLoading={payLoading || pricesFetching}
            />

            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full border-[3px] border-canvas bg-surface text-text-strong shadow-sm transition-colors hover:bg-surface-muted hover:text-brand sm:size-10 sm:border-4"
                onClick={handleSwap}
              >
                <span
                  className="transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `rotate(${swapButtonRotate ? 180 : 0}deg)`,
                  }}
                >
                  <ArrowDownUp size={20} />
                </span>
              </button>
            </div>
          </div>

          <div className="mt-1">
            <CurrencyInput
              amount={receiveAmount}
              currency={resolvedReceiveCurrency}
              onAmountChange={handleAmountChange('receive')}
              onCurrencyChange={handleCurrencyChange('receive')}
              options={currencies}
              usdValue={usdReceiveValue}
              isAmountLoading={receiveLoading || pricesFetching}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmitSwap}
        disabled={!canSubmitSwap}
        className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground transition-colors duration-200 hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-border-strong disabled:opacity-60 sm:h-12"
      >
        Swap
      </button>
    </form>
  );
}
