import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrencySwapStore } from '../store/currency-swap';
import type { CurrencyPrice } from '../types';

// Mock data
const mockBTC: CurrencyPrice = {
  currency: 'BTC',
  amount: 1,
  price: 50000
};

const mockETH: CurrencyPrice = {
  currency: 'ETH',
  amount: 16.666667,
  price: 3000
};


describe('Currency Swap Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useCurrencySwapStore.getState();
    store.updateFromCurrency({ currency: '', amount: 0, price: 0 });
    store.updateToCurrency({ currency: '', amount: 0, price: 0 });
    useCurrencySwapStore.setState({
      fromCurrency: null,
      toCurrency: null
    });
  });

  it('initializes with null currencies', () => {
    const { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    
    expect(fromCurrency).toBeNull();
    expect(toCurrency).toBeNull();
  });

  it('updates from currency correctly', () => {
    const { updateFromCurrency } = useCurrencySwapStore.getState();
    
    updateFromCurrency(mockBTC);
    
    const { fromCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency).toEqual(mockBTC);
  });

  it('updates to currency correctly', () => {
    const { updateToCurrency } = useCurrencySwapStore.getState();
    
    updateToCurrency(mockETH);
    
    const { toCurrency } = useCurrencySwapStore.getState();
    expect(toCurrency).toEqual(mockETH);
  });

  it('swaps currencies when both are set', () => {
    const { updateFromCurrency, updateToCurrency, swapCurrencies } = useCurrencySwapStore.getState();
    
    // Set initial currencies
    updateFromCurrency(mockBTC);
    updateToCurrency(mockETH);
    
    // Verify initial state
    let { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency).toEqual(mockBTC);
    expect(toCurrency).toEqual(mockETH);
    
    // Swap currencies
    swapCurrencies();
    
    // Verify swapped state
    ({ fromCurrency, toCurrency } = useCurrencySwapStore.getState());
    expect(fromCurrency).toEqual(mockETH);
    expect(toCurrency).toEqual(mockBTC);
  });

  it('does not swap when fromCurrency is null', () => {
    const { updateToCurrency, swapCurrencies } = useCurrencySwapStore.getState();
    
    // Set only to currency
    updateToCurrency(mockETH);
    
    // Try to swap
    swapCurrencies();
    
    // Should remain unchanged
    const { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency).toBeNull();
    expect(toCurrency).toEqual(mockETH);
  });

  it('does not swap when toCurrency is null', () => {
    const { updateFromCurrency, swapCurrencies } = useCurrencySwapStore.getState();
    
    // Set only from currency
    updateFromCurrency(mockBTC);
    
    // Try to swap
    swapCurrencies();
    
    // Should remain unchanged
    const { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency).toEqual(mockBTC);
    expect(toCurrency).toBeNull();
  });

  it('does not swap when both currencies are null', () => {
    const { swapCurrencies } = useCurrencySwapStore.getState();
    
    // Try to swap with null currencies
    swapCurrencies();
    
    // Should remain null
    const { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency).toBeNull();
    expect(toCurrency).toBeNull();
  });

  it('maintains currency data integrity during swap', () => {
    const { updateFromCurrency, updateToCurrency, swapCurrencies } = useCurrencySwapStore.getState();
    
    const originalBTC = { ...mockBTC };
    const originalETH = { ...mockETH };
    
    // Set currencies
    updateFromCurrency(originalBTC);
    updateToCurrency(originalETH);
    
    // Swap
    swapCurrencies();
    
    // Verify data integrity
    const { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency).toEqual(originalETH);
    expect(toCurrency).toEqual(originalBTC);
    
    // Verify original objects weren't mutated
    expect(originalBTC).toEqual(mockBTC);
    expect(originalETH).toEqual(mockETH);
  });

  it('allows multiple swaps', () => {
    const { updateFromCurrency, updateToCurrency, swapCurrencies } = useCurrencySwapStore.getState();
    
    // Set initial currencies
    updateFromCurrency(mockBTC);
    updateToCurrency(mockETH);
    
    // First swap
    swapCurrencies();
    let { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency).toEqual(mockETH);
    expect(toCurrency).toEqual(mockBTC);
    
    // Second swap (should return to original)
    swapCurrencies();
    ({ fromCurrency, toCurrency } = useCurrencySwapStore.getState());
    expect(fromCurrency).toEqual(mockBTC);
    expect(toCurrency).toEqual(mockETH);
  });

  it('updates currency with different amounts and prices', () => {
    const { updateFromCurrency, updateToCurrency } = useCurrencySwapStore.getState();
    
    // Update with different amounts
    const btcWithDifferentAmount = { ...mockBTC, amount: 2.5 };
    const ethWithDifferentAmount = { ...mockETH, amount: 0.8 };
    
    updateFromCurrency(btcWithDifferentAmount);
    updateToCurrency(ethWithDifferentAmount);
    
    const { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency?.amount).toBe(2.5);
    expect(toCurrency?.amount).toBe(0.8);
  });

  it('handles currency updates with same currency but different amounts', () => {
    const { updateFromCurrency } = useCurrencySwapStore.getState();
    
    // First update
    updateFromCurrency(mockBTC);
    let { fromCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency?.amount).toBe(1);
    
    // Update same currency with different amount
    const updatedBTC = { ...mockBTC, amount: 5 };
    updateFromCurrency(updatedBTC);
    ({ fromCurrency } = useCurrencySwapStore.getState());
    expect(fromCurrency?.amount).toBe(5);
    expect(fromCurrency?.currency).toBe('BTC');
  });

  it('preserves store state across multiple operations', () => {
    const { updateFromCurrency, updateToCurrency, swapCurrencies } = useCurrencySwapStore.getState();
    
    // Complex sequence of operations
    updateFromCurrency(mockBTC);
    updateToCurrency(mockETH);
    
    // Update amounts
    updateFromCurrency({ ...mockBTC, amount: 2 });
    updateToCurrency({ ...mockETH, amount: 33.333334 });
    
    // Swap
    swapCurrencies();
    
    // Verify final state
    const { fromCurrency, toCurrency } = useCurrencySwapStore.getState();
    expect(fromCurrency?.currency).toBe('ETH');
    expect(fromCurrency?.amount).toBe(33.333334);
    expect(toCurrency?.currency).toBe('BTC');
    expect(toCurrency?.amount).toBe(2);
  });
});
