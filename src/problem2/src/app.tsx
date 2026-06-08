import { useMemo } from 'react';

import { Spinner } from '@/components/common/spinner/spinner';

import type { Currency } from '@/types/currency';

import { CurrencyForm } from '@/components/currency-form';

import { useFetch } from '@/hooks/use-fetch';

import { sanitizeCurrencies } from '@/utils/money';

function App() {
  const { data, loading, error } = useFetch<Currency[]>(
    'https://interview.switcheo.com/prices.json'
  );

  const currencies = useMemo(() => (data ? sanitizeCurrencies(data) : []), [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          Something is wrong, please refresh the page to continue.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <CurrencyForm currencies={currencies} />
    </div>
  );
}

export default App;
