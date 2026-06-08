import { useCallback, useMemo, useReducer, useState } from 'react';
import type { ChangeEventHandler } from 'react';

import { Button } from '@/components/common/button';

import type { Currency } from '@/types/currency';
import type { SelectOption } from '@/types/option';

import { CurrencyInput } from '../currency-input';

import { initialState, swapReducer } from './reducer';

interface CurrencyFormProps {
  currencies: Currency[];
}

export function CurrencyForm({ currencies }: CurrencyFormProps) {
  const [state, dispatch] = useReducer(swapReducer, initialState);

  /* There are some images have name random like stEVMOS.svg
    It should be fix from the image's owner in order to show all the images successfully.
    Currently, the image pattern name is uppercase all the name (e.g: STEEM.svg)
  */
  const buildOptions = useCallback(
    (list: Currency[]): SelectOption[] =>
      list.map(({ currency }) => ({
        label: currency.toUpperCase(),
        value: currency,
        icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`,
      })),
    []
  );

  const fromCurrencyOptions = useMemo(
    () => buildOptions(currencies.filter((c) => c.currency !== state.toName)),
    [currencies, state.toName, buildOptions]
  );

  const toCurrencyOptions = useMemo(
    () => buildOptions(currencies.filter((c) => c.currency !== state.fromName)),
    [currencies, state.fromName, buildOptions]
  );

  const [touched, setTouched] = useState({
    fromName: false,
    fromAmount: false,
    toName: false,
    toAmount: false,
  });

  const isValid = !!state.fromName && !!state.fromAmount && !!state.toName && !!state.toAmount;

  const selectErrorMsg = 'Please select the currency';
  const amountErrorMsg = 'Please enter positive number';

  const handleFromCurrencyNameChange = useCallback(
    (value: string) => {
      const found = currencies.find((c) => c.currency === value);
      if (!found) return;
      setTouched((prev) => ({ ...prev, fromName: true }));
      dispatch({ type: 'SET_FROM_CURRENCY', name: value, price: found.price });
    },
    [currencies]
  );

  const handleToCurrencyNameChange = useCallback(
    (value: string) => {
      const found = currencies.find((c) => c.currency === value);
      if (!found) return;
      setTouched((prev) => ({ ...prev, toName: true }));
      dispatch({ type: 'SET_TO_CURRENCY', name: value, price: found.price });
    },
    [currencies]
  );

  const handleFromCurrencyChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setTouched((prev) => ({ ...prev, fromAmount: true }));
    dispatch({ type: 'SET_FROM_AMOUNT', fromAmount: e.target.value });
  }, []);

  const handleToCurrencyChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setTouched((prev) => ({ ...prev, toAmount: true }));
    dispatch({ type: 'SET_TO_AMOUNT', toAmount: e.target.value });
  }, []);

  const handleSwap = useCallback(() => {
    if (!isValid) return;
    dispatch({ type: 'SWAP' });
  }, [isValid]);

  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
      <h5 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-zinc-100">
        Swap
      </h5>
      <CurrencyInput
        label="Amount to send"
        placeHolder="0"
        onChangeSelect={handleFromCurrencyNameChange}
        onChange={handleFromCurrencyChange}
        value={state.fromAmount}
        selectValue={state.fromName}
        options={fromCurrencyOptions}
        selectError={touched.fromName && !state.fromName ? selectErrorMsg : undefined}
        amountError={touched.fromAmount && !state.fromAmount ? amountErrorMsg : undefined}
      />
      <CurrencyInput
        label="Amount to receive"
        placeHolder="0"
        onChangeSelect={handleToCurrencyNameChange}
        onChange={handleToCurrencyChange}
        value={state.toAmount}
        selectValue={state.toName}
        options={toCurrencyOptions}
        selectError={touched.toName && !state.toName ? selectErrorMsg : undefined}
        amountError={touched.toAmount && !state.toAmount ? amountErrorMsg : undefined}
      />
      <Button onClick={handleSwap} className="w-full" disabled={!isValid}>
        CONFIRM SWAP
      </Button>
    </div>
  );
}
