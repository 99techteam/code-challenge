import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WalletPage } from './WalletPage';
import type { WalletBalance } from '../types';

// Mock the hooks
vi.mock('../hooks/useWalletBalances');
vi.mock('../hooks/usePrices');

// Import mocked hooks
import { useWalletBalances } from '../hooks/useWalletBalances';
import { usePrices } from '../hooks/usePrices';

describe('WalletPage', () => {
  const mockWalletBalances = vi.mocked(useWalletBalances);
  const mockPrices = vi.mocked(usePrices);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the page title', () => {
      mockWalletBalances.mockReturnValue([]);
      mockPrices.mockReturnValue({});

      render(<WalletPage />);

      expect(screen.getByText('Wallet Page')).toBeInTheDocument();
    });

    it('should render empty state when no balances', () => {
      mockWalletBalances.mockReturnValue([]);
      mockPrices.mockReturnValue({});

      render(<WalletPage />);

      expect(screen.getByText('No balances available')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      mockWalletBalances.mockReturnValue([]);
      mockPrices.mockReturnValue({});

      render(<WalletPage />);

      expect(screen.getByRole('main')).toHaveAttribute(
        'aria-label',
        'Wallet balances'
      );
      expect(screen.getByRole('grid')).toHaveAttribute(
        'aria-label',
        'Wallet balance list'
      );
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Filtering Logic', () => {
    it('should filter out balances with amount <= 0', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
        { currency: 'BTC', amount: 0, blockchain: 'Osmosis' },
        { currency: 'USDC', amount: -5, blockchain: 'Arbitrum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000, BTC: 50000, USDC: 1 });

      render(<WalletPage />);

      // Only ETH should be rendered
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.queryByText('BTC')).not.toBeInTheDocument();
      expect(screen.queryByText('USDC')).not.toBeInTheDocument();
    });

    it('should filter out unsupported blockchains', () => {
      const balances = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
        { currency: 'BTC', amount: 2.5, blockchain: 'Bitcoin' },
      ] as WalletBalance[];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000, BTC: 50000 });

      render(<WalletPage />);

      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.queryByText('BTC')).not.toBeInTheDocument();
    });

    it('should keep valid balances', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' },
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000, OSMO: 1, ARB: 1 });

      render(<WalletPage />);

      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('OSMO')).toBeInTheDocument();
      expect(screen.getByText('ARB')).toBeInTheDocument();
    });
  });

  describe('Sorting Logic', () => {
    it('should sort balances by blockchain priority', async () => {
      const balances: WalletBalance[] = [
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' }, // Priority: 30
        { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' }, // Priority: 100
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' }, // Priority: 50
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ARB: 1, OSMO: 1, ETH: 2000 });

      const { container } = render(<WalletPage />);

      await waitFor(() => {
        const rows = container.querySelectorAll('[role="row"]');
        expect(rows).toHaveLength(3);
      });

      const currencies = screen.getAllByLabelText(/Currency:/);
      expect(currencies[0]).toHaveTextContent('OSMO'); // Priority 100
      expect(currencies[1]).toHaveTextContent('ETH'); // Priority 50
      expect(currencies[2]).toHaveTextContent('ARB'); // Priority 30
    });

    it('should handle equal priorities consistently', () => {
      const balances: WalletBalance[] = [
        { currency: 'ZIL', amount: 100, blockchain: 'Zilliqa' }, // Priority: 20
        { currency: 'NEO', amount: 50, blockchain: 'Neo' }, // Priority: 20
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ZIL: 0.05, NEO: 10 });

      render(<WalletPage />);

      expect(screen.getByText('ZIL')).toBeInTheDocument();
      expect(screen.getByText('NEO')).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('should format balance amounts with 2 decimal places', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.234567, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000 });

      render(<WalletPage />);

      expect(screen.getByLabelText('Amount: 1.23')).toBeInTheDocument();
    });

    it('should calculate USD values correctly', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 2, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000 });

      render(<WalletPage />);

      // USD value should be 2 * 2000 = 4000
      expect(screen.getByText('$4,000.00')).toBeInTheDocument();
    });

    it('should handle missing prices (0 USD value)', () => {
      const balances: WalletBalance[] = [
        { currency: 'UNKNOWN', amount: 100, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({});

      render(<WalletPage />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Row Keys', () => {
    it('should use stable keys (currency + blockchain)', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1, blockchain: 'Ethereum' },
        { currency: 'ETH', amount: 2, blockchain: 'Arbitrum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000 });

      const { container } = render(<WalletPage />);

      const rows = container.querySelectorAll('[role="row"]');
      expect(rows).toHaveLength(2);

      // Both rows should be present (different keys)
      expect(screen.getAllByText('ETH')).toHaveLength(2);
    });
  });

  describe('Integration: Complete Workflow', () => {
    it('should filter, sort, format, and render correctly', () => {
      const balances: WalletBalance[] = [
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' },
        { currency: 'INVALID', amount: 0, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: 100.567, blockchain: 'Osmosis' },
        { currency: 'ETH', amount: 1.234, blockchain: 'Ethereum' },
        { currency: 'NEG', amount: -10, blockchain: 'Neo' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({
        ARB: 1.5,
        OSMO: 1.2,
        ETH: 2000,
      });

      const { container } = render(<WalletPage />);

      // Should render only 3 valid balances
      const rows = container.querySelectorAll('[role="row"]');
      expect(rows).toHaveLength(3);

      // Check order: OSMO (100), ETH (50), ARB (30)
      const currencies = screen.getAllByLabelText(/Currency:/);
      expect(currencies[0]).toHaveTextContent('OSMO');
      expect(currencies[1]).toHaveTextContent('ETH');
      expect(currencies[2]).toHaveTextContent('ARB');

      // Check formatting
      expect(screen.getByLabelText('Amount: 100.57')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount: 1.23')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount: 50.00')).toBeInTheDocument();

      // Check USD values
      expect(screen.getByText('$120.68')).toBeInTheDocument(); // 100.567 * 1.2
      expect(screen.getByText('$2,468.00')).toBeInTheDocument(); // 1.234 * 2000
      expect(screen.getByText('$75.00')).toBeInTheDocument(); // 50 * 1.5
    });
  });

  describe('Props', () => {
    it('should accept and apply className prop', () => {
      mockWalletBalances.mockReturnValue([]);
      mockPrices.mockReturnValue({});

      const { container } = render(<WalletPage className='custom-class' />);

      expect(
        container.querySelector('.wallet-page.custom-class')
      ).toBeInTheDocument();
    });

    it('should forward additional props', () => {
      mockWalletBalances.mockReturnValue([]);
      mockPrices.mockReturnValue({});

      render(<WalletPage data-testid='wallet-page-test' />);

      expect(screen.getByTestId('wallet-page-test')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty balances array', () => {
      mockWalletBalances.mockReturnValue([]);
      mockPrices.mockReturnValue({});

      render(<WalletPage />);

      expect(screen.getByText('No balances available')).toBeInTheDocument();
    });

    it('should handle empty prices object', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({});

      render(<WalletPage />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle all balances being filtered out', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 0, blockchain: 'Ethereum' },
        { currency: 'BTC', amount: -5, blockchain: 'Osmosis' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({});

      render(<WalletPage />);

      expect(screen.getByText('No balances available')).toBeInTheDocument();
    });

    it('should handle very large number of balances', () => {
      const balances: WalletBalance[] = Array.from({ length: 100 }, (_, i) => ({
        currency: `COIN${i}`,
        amount: i + 1,
        blockchain: 'Ethereum' as const,
      }));

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue(
        Object.fromEntries(balances.map((b) => [b.currency, 1]))
      );

      const { container } = render(<WalletPage />);

      const rows = container.querySelectorAll('[role="row"]');
      expect(rows).toHaveLength(100);
    });

    it('should handle very small balance amounts', () => {
      const balances: WalletBalance[] = [
        { currency: 'BTC', amount: 0.00000001, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ BTC: 50000 });

      render(<WalletPage />);

      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('should handle very large balance amounts', () => {
      const balances: WalletBalance[] = [
        { currency: 'SHIB', amount: 1000000000, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ SHIB: 0.00001 });

      render(<WalletPage />);

      expect(screen.getByText('1000000000.00')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    it('should not recompute when prices change (not in dependency)', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000 });

      const { rerender } = render(<WalletPage />);

      expect(screen.getByText('$2,000.00')).toBeInTheDocument();

      // Change prices
      mockPrices.mockReturnValue({ ETH: 3000 });
      rerender(<WalletPage />);

      // USD value should update even though balances didn't change
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });

    it('should recompute when balances change', () => {
      const balances1: WalletBalance[] = [
        { currency: 'ETH', amount: 1, blockchain: 'Ethereum' },
      ];

      const balances2: WalletBalance[] = [
        { currency: 'BTC', amount: 2, blockchain: 'Osmosis' },
      ];

      mockWalletBalances.mockReturnValue(balances1);
      mockPrices.mockReturnValue({ ETH: 2000, BTC: 50000 });

      const { rerender } = render(<WalletPage />);

      expect(screen.getByText('ETH')).toBeInTheDocument();

      // Change balances
      mockWalletBalances.mockReturnValue(balances2);
      rerender(<WalletPage />);

      expect(screen.queryByText('ETH')).not.toBeInTheDocument();
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have semantic HTML structure', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000 });

      render(<WalletPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('should have descriptive labels', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
      ];

      mockWalletBalances.mockReturnValue(balances);
      mockPrices.mockReturnValue({ ETH: 2000 });

      render(<WalletPage />);

      expect(screen.getByLabelText('Currency: ETH')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount: 1.50')).toBeInTheDocument();
      expect(screen.getByLabelText('Blockchain: Ethereum')).toBeInTheDocument();
    });
  });
});
