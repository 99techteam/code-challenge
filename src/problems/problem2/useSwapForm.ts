import { useForm } from 'react-hook-form';
import { computeRate, computeToAmount } from './logic';
import { t } from '../../lib/i18n';
import type { TokenInfo, SwapFormValues } from './types';

export const useSwapForm = (tokens: TokenInfo[]) => {
  // onTouched: first error shown on blur, re-validates on change after that
  // prevents showing errors mid-typing on untouched fields
  const form = useForm<SwapFormValues>({ mode: 'onTouched' });

  // eslint-disable-next-line react-hooks/incompatible-library
  const [watchedFrom, watchedAmount, watchedTo] = form.watch([
    'fromToken',
    'fromAmount',
    'toToken',
  ]);

  const fromToken = tokens.find((tk) => tk.symbol === watchedFrom);
  const toToken = tokens.find((tk) => tk.symbol === watchedTo);

  const rate = computeRate(fromToken, toToken);
  const toAmount = computeToAmount(watchedAmount, rate);

  // ── Registered fields with validation rules ────────────────────
  const fromTokenField = form.register('fromToken', {
    required: t('validation.required'),
  });

  const fromAmountField = form.register('fromAmount', {
    required: t('validation.required'),
    validate: {
      number: (v) => !isNaN(Number(v)) || t('validation.amount_number'),
      positive: (v) => Number(v) > 0 || t('validation.amount_positive'),
    },
  });

  const toTokenField = form.register('toToken', {
    required: t('validation.required'),
    validate: (v) => v !== watchedFrom || t('validation.same_token'),
  });

  // ── Actions ────────────────────────────────────────────────────
  const flipTokens = () => {
    // Only swap the token selectors — fromAmount is user input, toAmount is derived
    // shouldValidate only fires on fields already touched to avoid premature errors
    form.setValue('fromToken', watchedTo, {
      shouldValidate: form.getFieldState('fromToken').isTouched,
    });
    form.setValue('toToken', watchedFrom, {
      shouldValidate: form.getFieldState('toToken').isTouched,
    });
  };

  const resetForm = () => {
    form.reset();
  };

  return {
    // Registered fields (spread directly onto inputs)
    fromTokenField,
    fromAmountField,
    toTokenField,

    // Form state
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    handleSubmit: form.handleSubmit,
    setValue: form.setValue,

    // Derived
    rate,
    toAmount,
    fromToken,
    toToken,
    watchedFrom,
    watchedTo,
    watchedAmount,

    // Actions
    flipTokens,
    resetForm,
  };
};
