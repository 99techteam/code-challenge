import { describe, it, expect } from 'vitest';
import { formatInput, computeOutput } from './precision';

describe('precision', () => {
    describe('formatInput', () => {
        it('should format valid numeric input', () => {
            expect(formatInput('123.456')).toBe('123.456');
        });

        it('should remove invalid characters', () => {
            expect(formatInput('abc123!?')).toBe('123');
        });

        it('should limit decimal places', () => {
            expect(formatInput('123.456789', 4)).toBe('123.4567');
        });

        it('should return empty string for invalid input', () => {
            expect(formatInput('abc')).toBe('');
            expect(formatInput('')).toBe('');
        });
    });
    describe('computeOutput', () => {
        // Mock tokens data
        const tokens = [
            { id: '1', price: 2, currency: 'tokenA', logo: '', date: '' },
            { id: '2', price: 4, currency: 'tokenB', logo: '', date: '' },
            { id: '3', price: 0, currency: 'tokenC', logo: '', date: '' },
            { id: '4', price: 8, currency: 'tokenD', logo: '', date: '' },
        ];

        it('should compute correct output for valid input', () => {
            expect(computeOutput('1', '2', 10, tokens)).toBe(5);
            expect(computeOutput('2', '1', 8, tokens)).toBe(16);
        });

        it('should return 0 for invalid or missing input', () => {
            expect(computeOutput('', '2', 10, tokens)).toBe(0);
            expect(computeOutput('1', '', 10, tokens)).toBe(0);
            expect(computeOutput('1', '3', -5, tokens)).toBe(0);
            expect(computeOutput('1', '3', 10, tokens)).toBe(0);
            expect(computeOutput('2', '3', 10, tokens)).toBe(0);
        });
    });
});
