import { useEffect, useState } from 'react';
import { loadPrices, type TokenPrice } from './quote';

type PriceState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; tokens: TokenPrice[] };

export function usePrices() {
  const [state, setState] = useState<PriceState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadPrices(fetch, controller.signal).then(
      tokens => {
        if (!controller.signal.aborted) setState({ status: 'ready', tokens });
      },
      () => {
        if (!controller.signal.aborted) setState({ status: 'error' });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt(value => value + 1);
  }

  return { state, retry };
}
