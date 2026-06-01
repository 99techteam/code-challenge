import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Task from '../../components/Task';
import TokenSelector from '../../components/TokenSelector';
import { t } from '../../lib/i18n';
import {
  normalizeTokenPrices,
  fetchTokenPrices,
  simulateSwap,
  formatAmount,
} from './logic';
import { useSwapForm } from './useSwapForm';
import type { SwapRecord } from './types';

// ── Skeleton ───────────────────────────────────────────────────────────────
const FieldSkeleton = () => (
  <div className='h-[46px] rounded-xl bg-[var(--border)] animate-pulse flex-1' />
);

// ── History item ───────────────────────────────────────────────────────────
const HistoryItem = ({ record }: { record: SwapRecord }) => (
  <li className='flex items-start gap-3 py-3 border-b border-[var(--border)] last:border-0'>
    <div className='flex-1 min-w-0'>
      <p className='m-0 text-sm font-semibold text-[var(--text-h)]'>
        {formatAmount(record.fromAmount)} {record.fromSymbol}
        {' → '}
        {formatAmount(record.toAmount)} {record.toSymbol}
      </p>
      <p className='m-0 mt-0.5 text-xs text-[var(--text)]'>
        1 {record.fromSymbol} = {formatAmount(record.rate)} {record.toSymbol}
        {' · '}
        {record.timestamp.toLocaleTimeString()}
      </p>
    </div>
    <span className='shrink-0 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full'>
      Done
    </span>
  </li>
);

// ── Main component ─────────────────────────────────────────────────────────
export default function Problem2() {
  const queryClient = useQueryClient();

  // ── API: token prices ──────────────────────────────────────────────────
  const {
    data: tokens = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['token-prices'],
    queryFn: fetchTokenPrices,
    select: normalizeTokenPrices,
    staleTime: 60_000,
  });

  // ── API: swap history (client state via setQueryData) ──────────────────
  const { data: history = [] } = useQuery<SwapRecord[]>({
    queryKey: ['swap-history'],
    queryFn: (): SwapRecord[] => [],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // ── Form hook ──────────────────────────────────────────────────────────
  const {
    fromTokenField,
    fromAmountField,
    toTokenField,
    errors,
    isValid,
    handleSubmit,
    setValue,
    rate,
    toAmount,
    fromToken,
    toToken,
    watchedFrom,
    watchedTo,
    watchedAmount,
    flipTokens,
    resetForm,
  } = useSwapForm(tokens);

  // ── Mutation: simulate swap ────────────────────────────────────────────
  const {
    mutate: submitSwap,
    isPending,
    isSuccess,
    reset: resetMutation,
  } = useMutation({
    mutationFn: () => simulateSwap(1500),
    onSuccess: () => {
      if (!fromToken || !toToken || rate === null) {
        return;
      }
      const record: SwapRecord = {
        id: crypto.randomUUID(),
        fromSymbol: fromToken.symbol,
        fromAmount: Number(watchedAmount),
        toSymbol: toToken.symbol,
        toAmount: Number(watchedAmount) * rate,
        rate,
        timestamp: new Date(),
      };
      queryClient.setQueryData<SwapRecord[]>(['swap-history'], (old = []) =>
        [record, ...old].slice(0, 10),
      );
    },
  });

  const onSubmit = handleSubmit(() => {
    submitSwap();
  });

  const onReset = () => {
    resetForm();
    resetMutation();
  };

  const hasRate = rate !== null && fromToken && toToken;

  return (
    <div className='problem-content'>
      {/* ── Task statement ─────────────────────────────────────────────── */}
      <Task title='Problem 2 — Fancy Form'>
        <p>Create a currency swap form based on the template provided.</p>
        <p>
          The submission is required to:
        </p>
        <ul>
          <li>Retrieve token prices from the provided API endpoint.</li>
          <li>Allow users to select tokens and input a swap amount.</li>
          <li>Display the converted output amount in real time.</li>
          <li>Provide UI feedback for pending and error states.</li>
        </ul>
        <p>
          The form must not use any form state management other than{' '}
          <code>react-hook-form</code>, and all token data must be fetched from
          the live endpoint below.
        </p>
        <pre>
          <code>https://interview.switcheo.com/prices.json</code>
        </pre>
      </Task>

      {/* ── Form card ──────────────────────────────────────────────────── */}
      <div className='w-full  rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow)] p-6'>
        <h2 className='m-0 mb-1 text-xl font-semibold text-[var(--text-h)] tracking-tight'>
          Swap
        </h2>
        <p className='m-0 mb-6 text-sm text-[var(--text)]'>
          Exchange tokens at real-time rates
        </p>

        {/* Error state */}
        {isError && (
          <div className='mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/30 text-sm text-red-500'>
            {error?.message ?? t('swap.error')}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className='flex flex-col gap-4'>
          {/* ── From section ─────────────────────────────────────────── */}
          <div className='rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4 flex flex-col gap-3'>
            <span className='text-xs font-semibold uppercase tracking-widest text-[var(--text)]'>
              {t('swap.from_label')}
            </span>
            <div className='flex gap-2 items-center'>
              {isLoading ? (
                <FieldSkeleton />
              ) : (
                <TokenSelector
                  {...fromTokenField}
                  tokens={tokens}
                  value={watchedFrom}
                  onChange={(e) => {
                    void fromTokenField.onChange(e);
                    setValue('toToken', watchedTo, {
                      shouldValidate: !!watchedTo,
                    });
                  }}
                  hasError={!!errors.fromToken}
                  placeholder={t('swap.select_token')}
                  disabledSymbol={watchedTo}
                />
              )}
              <div className='flex-1'>
                <input
                  {...fromAmountField}
                  id='fromAmount'
                  type='number'
                  step='any'
                  min='0'
                  placeholder={t('swap.amount_placeholder')}
                  disabled={isPending}
                  className={[
                    'w-full px-3 py-2.5 rounded-xl border bg-[var(--bg)]',
                    'text-right text-lg font-semibold text-[var(--text-h)]',
                    'placeholder:text-[var(--text)] placeholder:font-normal placeholder:opacity-50',
                    'transition-colors duration-150 focus:outline-none focus:ring-2',
                    'disabled:opacity-50 [appearance:textfield]',
                    '[&::-webkit-outer-spin-button]:appearance-none',
                    '[&::-webkit-inner-spin-button]:appearance-none',
                    errors.fromAmount
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent-border)]',
                  ].join(' ')}
                />
              </div>
            </div>

            {/* Errors — grid height animation */}
            <div
              className={[
                'grid transition-all duration-200',
                errors.fromToken || errors.fromAmount
                  ? 'grid-rows-[1fr]'
                  : 'grid-rows-[0fr]',
              ].join(' ')}
            >
              <div className='overflow-hidden flex flex-col gap-0.5'>
                {errors.fromToken && (
                  <span className='text-xs text-red-500'>
                    {errors.fromToken.message}
                  </span>
                )}
                {errors.fromAmount && (
                  <span className='text-xs text-red-500'>
                    {errors.fromAmount.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Flip button ──────────────────────────────────────────── */}
          <div className='flex justify-center -my-1 relative z-10'>
            <button
              type='button'
              onClick={flipTokens}
              disabled={isPending}
              className={[
                'w-9 h-9 rounded-full border-2 border-[var(--border)] bg-[var(--bg)]',
                'flex items-center justify-center cursor-pointer',
                'transition-all duration-200 text-[var(--text)]',
                'hover:border-[var(--accent)] hover:text-[var(--accent)]',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'active:scale-90',
              ].join(' ')}
              aria-label='Flip tokens'
            >
              <svg
                className='w-4 h-4'
                viewBox='0 0 16 16'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M5 3l-3 3 3 3M11 13l3-3-3-3M2 6h12M14 10H2' />
              </svg>
            </button>
          </div>

          {/* ── To section ───────────────────────────────────────────── */}
          <div className='rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4 flex flex-col gap-3'>
            <span className='text-xs font-semibold uppercase tracking-widest text-[var(--text)]'>
              {t('swap.to_label')}
            </span>
            <div className='flex gap-2 items-center'>
              {isLoading ? (
                <FieldSkeleton />
              ) : (
                <TokenSelector
                  {...toTokenField}
                  tokens={tokens}
                  value={watchedTo}
                  onChange={(e) => {
                    void toTokenField.onChange(e);
                    setValue('fromToken', watchedFrom, {
                      shouldValidate: !!watchedFrom,
                    });
                  }}
                  hasError={!!errors.toToken}
                  placeholder={t('swap.select_token')}
                  disabledSymbol={watchedFrom}
                />
              )}
              {/* Computed output — read-only */}
              <div className='flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-right min-h-[46px] flex items-center justify-end'>
                {toAmount ? (
                  <span className='text-lg font-semibold text-[var(--text-h)]'>
                    {toAmount}
                  </span>
                ) : (
                  <span className='text-lg font-semibold text-[var(--text)] opacity-30'>
                    0.00
                  </span>
                )}
              </div>
            </div>

            <div
              className={[
                'grid transition-all duration-200',
                errors.toToken ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              ].join(' ')}
            >
              <div className='overflow-hidden'>
                {errors.toToken && (
                  <span className='text-xs text-red-500'>
                    {errors.toToken.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Rate display ─────────────────────────────────────────── */}
          <div
            className={[
              'flex items-center justify-between px-3 py-2 rounded-lg',
              'text-xs bg-[var(--code-bg)]',
              'transition-all duration-200',
              hasRate
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-1 pointer-events-none select-none',
            ].join(' ')}
          >
            <span className='text-[var(--text)]'>Rate</span>
            <span className='font-medium text-[var(--text-h)]'>
              {hasRate &&
                t('swap.rate_display', {
                  from: fromToken.symbol,
                  rate: formatAmount(rate),
                  to: toToken.symbol,
                })}
            </span>
          </div>

          {/* ── Actions ──────────────────────────────────────────────── */}
          <div className='flex gap-2.5 mt-1'>
            <button
              type='submit'
              disabled={isPending || isLoading || !isValid}
              className={[
                'flex-1 flex items-center justify-center gap-2 min-w-0',
                'px-5 py-2.5 rounded-xl text-sm font-semibold text-white',
                'transition-all duration-150 cursor-pointer',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'bg-[var(--accent)] hover:enabled:shadow-[0_4px_16px_var(--accent-border)]',
                'active:enabled:scale-[0.98]',
              ].join(' ')}
            >
              {isPending && (
                <svg
                  className='w-4 h-4 animate-spin shrink-0'
                  viewBox='0 0 24 24'
                  fill='none'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='3'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                  />
                </svg>
              )}
              {isPending ? t('swap.submitting') : t('swap.submit')}
            </button>
            <button
              type='button'
              onClick={onReset}
              disabled={isPending}
              className={[
                'px-5 py-2.5 rounded-xl border border-[var(--border)]',
                'text-sm font-semibold text-[var(--text)] cursor-pointer',
                'transition-all duration-150 hover:bg-[var(--code-bg)]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-[0.98]',
              ].join(' ')}
            >
              {t('swap.reset')}
            </button>
          </div>
        </form>

        {/* ── Success result ────────────────────────────────────────────── */}
        <div
          className={[
            'grid transition-all duration-300',
            isSuccess && history.length > 0
              ? 'grid-rows-[1fr] mt-4'
              : 'grid-rows-[0fr]',
          ].join(' ')}
        >
          <div className='overflow-hidden'>
            {isSuccess && history[0] && (
              <div className='pt-4 border-t border-[var(--border)]'>
                <div className='flex items-center gap-2 mb-1.5'>
                  <svg
                    className='w-4 h-4 text-emerald-500 shrink-0'
                    viewBox='0 0 16 16'
                    fill='none'
                  >
                    <circle
                      cx='8'
                      cy='8'
                      r='7'
                      stroke='currentColor'
                      strokeWidth='1.5'
                    />
                    <path
                      d='M5 8l2 2 4-4'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span className='text-sm font-semibold text-emerald-500'>
                    {t('swap.result_heading')}
                  </span>
                </div>
                <p className='m-0 text-sm text-[var(--text-h)]'>
                  {t('swap.result_detail', {
                    fromAmount: formatAmount(history[0].fromAmount),
                    from: history[0].fromSymbol,
                    toAmount: formatAmount(history[0].toAmount),
                    to: history[0].toSymbol,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── History panel ──────────────────────────────────────────────────── */}
      <div
        className={[
          'w-full max-w-md mt-4 transition-all duration-300',
          history.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className='rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4'>
          <h3 className='m-0 mb-2 text-xs font-bold uppercase tracking-widest text-[var(--text)]'>
            {t('swap.history_heading')}
          </h3>
          <ul className='list-none m-0 p-0'>
            {history.map((record) => (
              <HistoryItem key={record.id} record={record} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
