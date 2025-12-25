import { describe, it, expect } from 'vitest';
import {
  filterValidBalances,
  sortBalancesByPriority,
  formatBalance,
  formatBalances,
} from './balanceHelpers';
import type { WalletBalance } from '../types';

describe('balanceHelpers', () => {
  describe('filterValidBalances', () => {
    it('should filter out balances with amount <= 0', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
        { currency: 'BTC', amount: 0, blockchain: 'Osmosis' },
        { currency: 'USDC', amount: -5, blockchain: 'Arbitrum' },
      ];

      const result = filterValidBalances(balances);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        currency: 'ETH',
        amount: 1.5,
        blockchain: 'Ethereum',
      });
    });

    it('should filter out balances with unsupported blockchain (priority -99)', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
        // @ts-expect-error - Testing runtime behavior with invalid blockchain
        { currency: 'BTC', amount: 2.5, blockchain: 'Bitcoin' },
      ];

      const result = filterValidBalances(balances);

      expect(result).toHaveLength(1);
      expect(result[0].blockchain).toBe('Ethereum');
    });

    it('should keep all valid balances', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' },
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' },
      ];

      const result = filterValidBalances(balances);

      expect(result).toHaveLength(3);
    });

    it('should return empty array when all balances are invalid', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 0, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: -10, blockchain: 'Osmosis' },
      ];

      const result = filterValidBalances(balances);

      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty input', () => {
      const result = filterValidBalances([]);
      expect(result).toHaveLength(0);
    });

    it('should handle edge case of very small positive amounts', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 0.0001, blockchain: 'Ethereum' },
        { currency: 'BTC', amount: 0.00000001, blockchain: 'Osmosis' },
      ];

      const result = filterValidBalances(balances);

      expect(result).toHaveLength(2);
    });
  });

  describe('sortBalancesByPriority', () => {
    it('should sort balances by priority in descending order', () => {
      const balances: WalletBalance[] = [
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' }, // Priority: 30
        { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' }, // Priority: 100
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' }, // Priority: 50
      ];

      const result = sortBalancesByPriority(balances);

      expect(result[0].blockchain).toBe('Osmosis'); // 100
      expect(result[1].blockchain).toBe('Ethereum'); // 50
      expect(result[2].blockchain).toBe('Arbitrum'); // 30
    });

    it('should maintain stable order for equal priorities', () => {
      const balances: WalletBalance[] = [
        { currency: 'ZIL', amount: 100, blockchain: 'Zilliqa' }, // Priority: 20
        { currency: 'NEO', amount: 50, blockchain: 'Neo' }, // Priority: 20
      ];

      const result = sortBalancesByPriority(balances);

      // Both have same priority, original order should be maintained
      expect(result).toHaveLength(2);
      expect(result[0].currency).toBe('ZIL');
      expect(result[1].currency).toBe('NEO');
    });

    it('should not mutate original array', () => {
      const balances: WalletBalance[] = [
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' },
        { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' },
      ];

      const originalOrder = [...balances];
      sortBalancesByPriority(balances);

      expect(balances).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const result = sortBalancesByPriority([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single balance', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
      ];

      const result = sortBalancesByPriority(balances);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(balances[0]);
    });

    it('should sort all supported blockchains correctly', () => {
      const balances: WalletBalance[] = [
        { currency: 'NEO', amount: 10, blockchain: 'Neo' }, // 20
        { currency: 'ETH', amount: 1, blockchain: 'Ethereum' }, // 50
        { currency: 'ZIL', amount: 100, blockchain: 'Zilliqa' }, // 20
        { currency: 'OSMO', amount: 200, blockchain: 'Osmosis' }, // 100
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' }, // 30
      ];

      const result = sortBalancesByPriority(balances);

      expect(result[0].blockchain).toBe('Osmosis'); // 100
      expect(result[1].blockchain).toBe('Ethereum'); // 50
      expect(result[2].blockchain).toBe('Arbitrum'); // 30
      // Neo and Zilliqa can be in either order (both 20)
      expect(['Neo', 'Zilliqa']).toContain(result[3].blockchain);
      expect(['Neo', 'Zilliqa']).toContain(result[4].blockchain);
    });
  });

  describe('formatBalance', () => {
    it('should format whole numbers with 2 decimal places', () => {
      expect(formatBalance(100)).toBe('100.00');
    });

    it('should format decimal numbers with 2 decimal places', () => {
      expect(formatBalance(1.5)).toBe('1.50');
    });

    it('should round to 2 decimal places', () => {
      expect(formatBalance(1.234)).toBe('1.23');
      expect(formatBalance(1.235)).toBe('1.24'); // Rounds up
    });

    it('should format zero', () => {
      expect(formatBalance(0)).toBe('0.00');
    });

    it('should format negative numbers', () => {
      expect(formatBalance(-5.5)).toBe('-5.50');
    });

    it('should format very small numbers', () => {
      expect(formatBalance(0.001)).toBe('0.00');
      expect(formatBalance(0.005)).toBe('0.01'); // Rounds up
    });

    it('should format very large numbers', () => {
      expect(formatBalance(1000000)).toBe('1000000.00');
    });
  });

  describe('formatBalances', () => {
    it('should add formatted property to each balance', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.5, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' },
      ];

      const result = formatBalances(balances);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        currency: 'ETH',
        amount: 1.5,
        blockchain: 'Ethereum',
        formatted: '1.50',
      });
      expect(result[1]).toEqual({
        currency: 'OSMO',
        amount: 100,
        blockchain: 'Osmosis',
        formatted: '100.00',
      });
    });

    it('should preserve all original properties', () => {
      const balances: WalletBalance[] = [
        { currency: 'ETH', amount: 1.234567, blockchain: 'Ethereum' },
      ];

      const result = formatBalances(balances);

      expect(result[0].currency).toBe('ETH');
      expect(result[0].amount).toBe(1.234567); // Original amount preserved
      expect(result[0].blockchain).toBe('Ethereum');
      expect(result[0].formatted).toBe('1.23');
    });

    it('should handle empty array', () => {
      const result = formatBalances([]);
      expect(result).toHaveLength(0);
    });

    it('should format multiple balances correctly', () => {
      const balances: WalletBalance[] = [
        { currency: 'A', amount: 0.001, blockchain: 'Ethereum' },
        { currency: 'B', amount: 1000000, blockchain: 'Osmosis' },
        { currency: 'C', amount: -5.5, blockchain: 'Arbitrum' },
      ];

      const result = formatBalances(balances);

      expect(result[0].formatted).toBe('0.00');
      expect(result[1].formatted).toBe('1000000.00');
      expect(result[2].formatted).toBe('-5.50');
    });
  });

  describe('Integration: Complete workflow', () => {
    it('should filter, sort, and format balances correctly', () => {
      const balances: WalletBalance[] = [
        { currency: 'ARB', amount: 50, blockchain: 'Arbitrum' },
        { currency: 'INVALID', amount: 0, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: 100.567, blockchain: 'Osmosis' },
        { currency: 'ETH', amount: 1.234, blockchain: 'Ethereum' },
        { currency: 'NEG', amount: -10, blockchain: 'Neo' },
      ];

      // Step 1: Filter
      const filtered = filterValidBalances(balances);
      expect(filtered).toHaveLength(3);

      // Step 2: Sort
      const sorted = sortBalancesByPriority(filtered);
      expect(sorted[0].blockchain).toBe('Osmosis');
      expect(sorted[1].blockchain).toBe('Ethereum');
      expect(sorted[2].blockchain).toBe('Arbitrum');

      // Step 3: Format
      const formatted = formatBalances(sorted);
      expect(formatted[0].formatted).toBe('100.57');
      expect(formatted[1].formatted).toBe('1.23');
      expect(formatted[2].formatted).toBe('50.00');
    });
  });
});
