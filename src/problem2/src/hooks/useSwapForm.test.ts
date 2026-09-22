import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSwapForm } from '@/hooks/useSwapForm';
import { toTokens } from '@/lib/prices';

/** ETH at $1,600 and USDC at $1 keep the arithmetic easy to read in assertions. */
const TOKENS = toTokens([
  { currency: 'ETH', date: '2023-08-29T07:10:52.000Z', price: 1600 },
  { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 1 },
  { currency: 'WBTC', date: '2023-08-29T07:10:52.000Z', price: 26_000 },
]);

function setup() {
  return renderHook(() => useSwapForm(TOKENS));
}

// Values change synchronously, but react-hook-form runs the zod resolver
// asynchronously, so a validation message lands a tick after the edit. Tests
// that expect one wait for it.

describe('useSwapForm', () => {
  it('opens on the preferred pair with both sides already converted', () => {
    const { result } = setup();

    expect(result.current.from?.code).toBe('ETH');
    expect(result.current.to?.code).toBe('USDC');
    expect(result.current.fromValue).toBe('1.25');
    expect(result.current.toValue).toBe('2,000.00');
  });

  it('drives the other side from whichever field is typed into', () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '2');
    });
    expect(result.current.toValue).toBe('3,200.00');

    act(() => {
      result.current.setAmount('to', '800');
    });
    expect(result.current.fromValue).toBe('0.50000');
  });

  it('shows the raw text while a field is being edited and groups it afterwards', () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '1234.5');
    });
    expect(result.current.fromValue).toBe('1234.5');

    act(() => {
      result.current.blurField();
    });
    expect(result.current.fromValue).toBe('1,234.5');
  });

  it('keeps out characters that are not part of a number', () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '1a.2.3');
    });

    expect(result.current.fromValue).toBe('1.23');
  });

  it('trades the assets on a swap and leaves both amounts where they are', () => {
    const { result } = setup();
    const before = { from: result.current.fromValue, to: result.current.toValue };

    act(() => {
      result.current.swapSides();
    });

    expect(result.current.from?.code).toBe('USDC');
    expect(result.current.to?.code).toBe('ETH');
    expect(result.current.fromValue).toBe(before.to);
    expect(result.current.toValue).toBe(before.from);
    expect(result.current.swapCount).toBe(1);
  });

  it('never quotes an asset against itself', () => {
    const { result } = setup();

    act(() => {
      result.current.selectToken('from', 'USDC');
    });

    expect(result.current.from?.code).toBe('USDC');
    expect(result.current.to?.code).toBe('ETH');
  });

  it('re-prices when only one side changes asset', () => {
    const { result } = setup();

    act(() => {
      result.current.selectToken('to', 'WBTC');
    });

    expect(result.current.rate).toBeCloseTo(1600 / 26_000, 12);
    expect(result.current.toValue).toBe('0.076923');
  });

  it('stays quiet until the amount has been touched', () => {
    const { result } = setup();

    expect(result.current.fromError).toBeNull();
    expect(result.current.toError).toBeNull();
  });

  it('rejects an amount of zero', async () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '0');
    });

    await waitFor(() => {
      expect(result.current.fromError).toBe('Amount must be more than zero');
    });
  });

  it('asks for an amount once an emptied field is left, and not while it is in use', async () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '');
    });
    act(() => {
      result.current.blurField();
    });
    await waitFor(() => {
      expect(result.current.fromError).toBe('Enter an amount');
    });

    // Back in the field, an empty amount is work in progress again.
    act(() => {
      result.current.focusField('from');
    });
    expect(result.current.fromError).toBeNull();
  });

  it('rejects an amount too large to be meaningful', async () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '9999999999999');
    });

    await waitFor(() => {
      expect(result.current.fromError).toBe('Amount is too large to convert');
    });
  });

  it('puts the error on the field the amount was typed into', async () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('to', '0');
    });

    await waitFor(() => {
      expect(result.current.toError).toBe('Amount must be more than zero');
    });
    expect(result.current.fromError).toBeNull();
  });

  it('moves the error with its amount when the sides swap', async () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '0');
    });
    await waitFor(() => {
      expect(result.current.fromError).toBe('Amount must be more than zero');
    });

    act(() => {
      result.current.swapSides();
    });

    expect(result.current.toError).toBe('Amount must be more than zero');
    expect(result.current.fromError).toBeNull();
  });

  it('checks the amount again when the other field takes it over', async () => {
    const { result } = setup();

    act(() => {
      result.current.setAmount('from', '0');
    });
    act(() => {
      result.current.blurField();
    });
    await waitFor(() => {
      expect(result.current.fromError).toBe('Amount must be more than zero');
    });

    // "To" shows 0.00, so moving into it seeds an empty amount; leaving that
    // asks for one rather than repeating the error about zero.
    act(() => {
      result.current.focusField('to');
    });
    act(() => {
      result.current.blurField();
    });

    await waitFor(() => {
      expect(result.current.toError).toBe('Enter an amount');
    });
    expect(result.current.fromError).toBeNull();
  });

  it('seeds the first quotable pair when the feed has no preferred assets', () => {
    const feed = toTokens([
      { currency: 'SWTH', date: '2023-08-29T07:10:45.000Z', price: 0.004 },
      { currency: 'ZIL', date: '2023-08-29T07:10:50.000Z', price: 0.0165 },
    ]);
    const { result } = renderHook(() => useSwapForm(feed));

    expect(result.current.from?.code).toBe('SWTH');
    expect(result.current.to?.code).toBe('ZIL');
  });

  it('has nothing to quote before prices arrive', () => {
    const { result } = renderHook(() => useSwapForm([]));

    expect(result.current.from).toBeNull();
    expect(result.current.rate).toBeNull();
    expect(result.current.fromValue).toBe('');
  });
});
