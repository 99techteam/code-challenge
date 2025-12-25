import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletRow } from './WalletRow';
import type { FormattedWalletBalance } from '../types';

describe('WalletRow', () => {
  const createMockBalance = (
    overrides?: Partial<FormattedWalletBalance>
  ): FormattedWalletBalance => ({
    currency: 'ETH',
    amount: 1.5,
    blockchain: 'Ethereum',
    formatted: '1.50',
    ...overrides,
  });

  describe('Rendering', () => {
    it('should render currency', () => {
      const balance = createMockBalance({ currency: 'BTC' });
      render(<WalletRow balance={balance} usdValue={50000} />);

      expect(screen.getByText('BTC')).toBeInTheDocument();
    });

    it('should render formatted amount', () => {
      const balance = createMockBalance({ formatted: '2.50' });
      render(<WalletRow balance={balance} usdValue={5000} />);

      expect(screen.getByText('2.50')).toBeInTheDocument();
    });

    it('should render blockchain name', () => {
      const balance = createMockBalance({ blockchain: 'Osmosis' });
      render(<WalletRow balance={balance} usdValue={100} />);

      expect(screen.getByText('Osmosis')).toBeInTheDocument();
    });

    it('should render USD value formatted as currency', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={1234.56} />);

      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });

    it('should render all balance data together', () => {
      const balance = createMockBalance({
        currency: 'OSMO',
        amount: 100.123,
        formatted: '100.12',
        blockchain: 'Osmosis',
      });

      render(<WalletRow balance={balance} usdValue={50.75} />);

      expect(screen.getByText('OSMO')).toBeInTheDocument();
      expect(screen.getByText('100.12')).toBeInTheDocument();
      expect(screen.getByText('Osmosis')).toBeInTheDocument();
      expect(screen.getByText('$50.75')).toBeInTheDocument();
    });
  });

  describe('USD Value Formatting', () => {
    it('should format zero USD value', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={0} />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should format small USD values', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={0.01} />);

      expect(screen.getByText('$0.01')).toBeInTheDocument();
    });

    it('should format large USD values with commas', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={1000000.99} />);

      expect(screen.getByText('$1,000,000.99')).toBeInTheDocument();
    });

    it('should format negative USD values', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={-50.5} />);

      expect(screen.getByText('-$50.50')).toBeInTheDocument();
    });

    it('should round USD values to 2 decimal places', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={123.456} />);

      expect(screen.getByText('$123.46')).toBeInTheDocument();
    });

    it('should show exactly 2 decimal places even for whole numbers', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={100} />);

      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attributes', () => {
      const balance = createMockBalance();
      const { container } = render(
        <WalletRow balance={balance} usdValue={1000} />
      );

      const row = container.querySelector('[role="row"]');
      expect(row).toBeInTheDocument();

      const cells = container.querySelectorAll('[role="gridcell"]');
      expect(cells).toHaveLength(2);
    });

    it('should have aria-label for the row', () => {
      const balance = createMockBalance({ currency: 'ETH' });
      render(<WalletRow balance={balance} usdValue={2000} />);

      const row = screen.getByRole('row', { name: /Balance for ETH/i });
      expect(row).toBeInTheDocument();
    });

    it('should have aria-label for currency', () => {
      const balance = createMockBalance({ currency: 'BTC' });
      render(<WalletRow balance={balance} usdValue={50000} />);

      const currency = screen.getByLabelText('Currency: BTC');
      expect(currency).toBeInTheDocument();
      expect(currency).toHaveTextContent('BTC');
    });

    it('should have aria-label for amount', () => {
      const balance = createMockBalance({ formatted: '1.50' });
      render(<WalletRow balance={balance} usdValue={3000} />);

      const amount = screen.getByLabelText('Amount: 1.50');
      expect(amount).toBeInTheDocument();
      expect(amount).toHaveTextContent('1.50');
    });

    it('should have aria-label for USD value', () => {
      const balance = createMockBalance();
      render(<WalletRow balance={balance} usdValue={1234.56} />);

      const usdValue = screen.getByLabelText('USD Value: $1,234.56');
      expect(usdValue).toBeInTheDocument();
      expect(usdValue).toHaveTextContent('$1,234.56');
    });

    it('should have aria-label for blockchain', () => {
      const balance = createMockBalance({ blockchain: 'Arbitrum' });
      render(<WalletRow balance={balance} usdValue={500} />);

      const blockchain = screen.getByLabelText('Blockchain: Arbitrum');
      expect(blockchain).toBeInTheDocument();
      expect(blockchain).toHaveTextContent('Arbitrum');
    });
  });

  describe('CSS Classes', () => {
    it('should have correct CSS classes', () => {
      const balance = createMockBalance();
      const { container } = render(
        <WalletRow balance={balance} usdValue={1000} />
      );

      expect(container.querySelector('.wallet-row')).toBeInTheDocument();
      expect(container.querySelector('.wallet-cell-start')).toBeInTheDocument();
      expect(container.querySelector('.wallet-cell-end')).toBeInTheDocument();
      expect(container.querySelector('.wallet-currency')).toBeInTheDocument();
      expect(container.querySelector('.wallet-amount')).toBeInTheDocument();
      expect(container.querySelector('.wallet-usd-value')).toBeInTheDocument();
      expect(
        container.querySelector('.wallet-formatted-amount')
      ).toBeInTheDocument();
    });
  });

  describe('Different Blockchains', () => {
    it('should render Ethereum blockchain', () => {
      const balance = createMockBalance({ blockchain: 'Ethereum' });
      render(<WalletRow balance={balance} usdValue={2000} />);

      expect(screen.getByText('Ethereum')).toBeInTheDocument();
    });

    it('should render Osmosis blockchain', () => {
      const balance = createMockBalance({ blockchain: 'Osmosis' });
      render(<WalletRow balance={balance} usdValue={100} />);

      expect(screen.getByText('Osmosis')).toBeInTheDocument();
    });

    it('should render Arbitrum blockchain', () => {
      const balance = createMockBalance({ blockchain: 'Arbitrum' });
      render(<WalletRow balance={balance} usdValue={500} />);

      expect(screen.getByText('Arbitrum')).toBeInTheDocument();
    });

    it('should render Zilliqa blockchain', () => {
      const balance = createMockBalance({ blockchain: 'Zilliqa' });
      render(<WalletRow balance={balance} usdValue={50} />);

      expect(screen.getByText('Zilliqa')).toBeInTheDocument();
    });

    it('should render Neo blockchain', () => {
      const balance = createMockBalance({ blockchain: 'Neo' });
      render(<WalletRow balance={balance} usdValue={25} />);

      expect(screen.getByText('Neo')).toBeInTheDocument();
    });
  });

  describe('Different Currencies', () => {
    it('should render various cryptocurrencies', () => {
      const currencies = ['BTC', 'ETH', 'USDC', 'OSMO', 'ARB'];

      currencies.forEach((currency) => {
        const balance = createMockBalance({ currency });
        const { unmount } = render(
          <WalletRow balance={balance} usdValue={1000} />
        );

        expect(screen.getByText(currency)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long currency names', () => {
      const balance = createMockBalance({
        currency: 'VERYLONGCURRENCYNAME',
      });
      render(<WalletRow balance={balance} usdValue={100} />);

      expect(screen.getByText('VERYLONGCURRENCYNAME')).toBeInTheDocument();
    });

    it('should handle very large amounts', () => {
      const balance = createMockBalance({
        amount: 999999999.99,
        formatted: '999999999.99',
      });
      render(<WalletRow balance={balance} usdValue={1000000000} />);

      expect(screen.getByText('999999999.99')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000,000.00')).toBeInTheDocument();
    });

    it('should handle very small amounts', () => {
      const balance = createMockBalance({
        amount: 0.00000001,
        formatted: '0.00',
      });
      render(<WalletRow balance={balance} usdValue={0.01} />);

      expect(screen.getByText('0.00')).toBeInTheDocument();
      expect(screen.getByText('$0.01')).toBeInTheDocument();
    });

    it('should handle special characters in currency', () => {
      const balance = createMockBalance({
        currency: 'USD-C',
      });
      render(<WalletRow balance={balance} usdValue={100} />);

      expect(screen.getByText('USD-C')).toBeInTheDocument();
    });
  });

  describe('Component Isolation', () => {
    it('should render independently with different data', () => {
      const balance1 = createMockBalance({
        currency: 'ETH',
        formatted: '1.50',
        blockchain: 'Ethereum',
      });

      const balance2 = createMockBalance({
        currency: 'BTC',
        formatted: '0.05',
        blockchain: 'Osmosis',
      });

      const { container: container1 } = render(
        <WalletRow balance={balance1} usdValue={3000} />
      );

      const { container: container2 } = render(
        <WalletRow balance={balance2} usdValue={2500} />
      );

      expect(container1).not.toEqual(container2);
    });

    it('should not affect other components when props change', () => {
      const balance = createMockBalance();
      const { rerender } = render(
        <WalletRow balance={balance} usdValue={1000} />
      );

      expect(screen.getByText('$1,000.00')).toBeInTheDocument();

      const updatedBalance = createMockBalance({ currency: 'BTC' });
      rerender(<WalletRow balance={updatedBalance} usdValue={50000} />);

      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
      expect(screen.queryByText('ETH')).not.toBeInTheDocument();
    });
  });
});

