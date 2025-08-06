import { describe, it, expect } from 'vitest';
import BigNumber from 'bignumber.js';
import {
  calculateExchangeAmount,
  validateAmount,
  sanitizeAmountInput
} from './precision';

describe('Precision Library', () => {
  describe('calculateExchangeAmount', () => {
    it('should calculate basic exchange correctly', () => {
      expect(calculateExchangeAmount('100', 2, 4)).toBe('50');
    });

    it('should return 0 when toPrice is 0', () => {
      expect(calculateExchangeAmount('100', 2, 0)).toBe('0');
    });

    it('should maintain precision in reverse conversions with decimals', () => {
      const original = '123.456789012345678901234567890';
      const fromPrice = 1.234567890123456789;
      const toPrice = 9.876543210987654321;
      
      const converted = calculateExchangeAmount(original, fromPrice, toPrice);
      const reverted = calculateExchangeAmount(converted, toPrice, fromPrice);
      
      const originalBN = new BigNumber(original);
      const revertedBN = new BigNumber(reverted);
      const diff = originalBN.minus(revertedBN).abs();
      
      expect(diff.isLessThan('1e-25')).toBe(true);
    });
  });

  describe('validateAmount', () => {
    it('should validate basic valid amounts', () => {
      expect(validateAmount('123.456', 18).isValid).toBe(true);
    });

    it('should reject invalid number formats', () => {
      expect(validateAmount('abc', 18).isValid).toBe(false);
    });

    it('should enforce decimal place limits', () => {
      expect(validateAmount('1.12345', 3).isValid).toBe(false);
    });
  });

  describe('sanitizeAmountInput', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizeAmountInput('$123.45!', 18)).toBe('123.45');
    });

    it('should limit decimal places', () => {
      expect(sanitizeAmountInput('123.456789', 3)).toBe('123.456');
    });
  });
});