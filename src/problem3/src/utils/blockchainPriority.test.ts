import { describe, it, expect } from 'vitest';
import { getPriority } from './blockchainPriority';
import type { Blockchain } from '../types';

describe('blockchainPriority', () => {
  describe('getPriority', () => {
    it('should return correct priority for Osmosis', () => {
      expect(getPriority('Osmosis' as Blockchain)).toBe(100);
    });

    it('should return correct priority for Ethereum', () => {
      expect(getPriority('Ethereum' as Blockchain)).toBe(50);
    });

    it('should return correct priority for Arbitrum', () => {
      expect(getPriority('Arbitrum' as Blockchain)).toBe(30);
    });

    it('should return correct priority for Zilliqa', () => {
      expect(getPriority('Zilliqa' as Blockchain)).toBe(20);
    });

    it('should return correct priority for Neo', () => {
      expect(getPriority('Neo' as Blockchain)).toBe(20);
    });

    it('should return -99 for unsupported blockchain', () => {
      // @ts-expect-error - Testing runtime behavior with invalid blockchain
      expect(getPriority('Bitcoin')).toBe(-99);
    });

    it('should return -99 for undefined blockchain', () => {
      // @ts-expect-error - Testing runtime behavior with undefined
      expect(getPriority(undefined)).toBe(-99);
    });

    it('should have consistent priority ordering', () => {
      const priorities = [
        getPriority('Osmosis' as Blockchain),
        getPriority('Ethereum' as Blockchain),
        getPriority('Arbitrum' as Blockchain),
        getPriority('Zilliqa' as Blockchain),
        getPriority('Neo' as Blockchain),
      ];

      expect(priorities[0]).toBeGreaterThan(priorities[1]); // Osmosis > Ethereum
      expect(priorities[1]).toBeGreaterThan(priorities[2]); // Ethereum > Arbitrum
      expect(priorities[2]).toBeGreaterThan(priorities[3]); // Arbitrum > Zilliqa
      expect(priorities[3]).toBe(priorities[4]); // Zilliqa === Neo
    });
  });
});
