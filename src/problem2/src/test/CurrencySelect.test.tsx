import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CurrencySelect } from '../components/app/currency-select';
import type { Currency } from '../types';

// Mock data
const mockCurrencies: Currency[] = [
  {
    currency: 'BTC',
    date: new Date('2023-01-01'),
    price: 50000
  },
  {
    currency: 'ETH',
    date: new Date('2023-01-01'),
    price: 3000
  },
  {
    currency: 'USDT',
    date: new Date('2023-01-01'),
    price: 1
  }
];

describe('CurrencySelect Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with selected value', () => {
    render(
      <CurrencySelect
        data={mockCurrencies}
        value="BTC"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('BTC')).toBeInTheDocument();
  });

  it('displays all currency options when opened', async () => {
    const user = userEvent.setup();
    render(
      <CurrencySelect
        data={mockCurrencies}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('USDT')).toBeInTheDocument();
    });
  });

  it('displays currency icons for each option', async () => {
    const user = userEvent.setup();
    render(
      <CurrencySelect
        data={mockCurrencies}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByAltText('BTC')).toBeInTheDocument();
      expect(screen.getByAltText('ETH')).toBeInTheDocument();
      expect(screen.getByAltText('USDT')).toBeInTheDocument();
    });

    // Check icon sources
    expect(screen.getByAltText('BTC')).toHaveAttribute('src', 'tokens/BTC.SVG');
    expect(screen.getByAltText('ETH')).toHaveAttribute('src', 'tokens/ETH.SVG');
    expect(screen.getByAltText('USDT')).toHaveAttribute('src', 'tokens/USDT.SVG');
  });

  it('calls onChange when a currency is selected', async () => {
    const user = userEvent.setup();
    render(
      <CurrencySelect
        data={mockCurrencies}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });

    await user.click(screen.getByText('BTC'));

    expect(mockOnChange).toHaveBeenCalledWith('BTC');
  });

  it('updates value when prop changes', () => {
    const { rerender } = render(
      <CurrencySelect
        data={mockCurrencies}
        value="BTC"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('BTC')).toBeInTheDocument();

    // Re-render with different value
    rerender(
      <CurrencySelect
        data={mockCurrencies}
        value="ETH"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('ETH')).toBeInTheDocument();
  });
});
