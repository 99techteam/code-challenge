import { describe, expect, it } from 'vitest';

import {
  decimalsForPrice,
  formatAmount,
  formatRelativeTime,
  parseAmount,
  sanitizeAmountInput,
} from '@/lib/format';

describe('decimalsForPrice', () => {
  it('gives expensive assets room to show a meaningful amount', () => {
    expect(decimalsForPrice(26_002.82)).toBe(6);
    expect(decimalsForPrice(1_645.93)).toBe(5);
  });

  it('keeps cheap assets at two places', () => {
    expect(decimalsForPrice(1)).toBe(2);
    expect(decimalsForPrice(0.004)).toBe(2);
  });

  it('never exceeds eight places, however expensive the asset', () => {
    expect(decimalsForPrice(1e12)).toBe(8);
  });

  it('falls back to two places for a price it cannot use', () => {
    expect(decimalsForPrice(0)).toBe(2);
    expect(decimalsForPrice(Number.NaN)).toBe(2);
  });
});

describe('formatAmount', () => {
  it('groups thousands and pads to the asset precision', () => {
    expect(formatAmount(2057.4171, 2)).toBe('2,057.42');
    expect(formatAmount(1.25, 6)).toBe('1.250000');
  });

  it('drops trailing zeros when padding is off', () => {
    expect(formatAmount(2, 5, false)).toBe('2');
    expect(formatAmount(2000, 2, false)).toBe('2,000');
    expect(formatAmount(1.123456789, 5, false)).toBe('1.12346');
  });

  it('renders nothing for a value that is not a number', () => {
    expect(formatAmount(Number.NaN, 2)).toBe('');
  });
});

describe('parseAmount', () => {
  it('reads grouped input back as a number', () => {
    expect(parseAmount('2,057.42')).toBe(2057.42);
  });

  it('treats unparseable input as zero rather than NaN', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('.')).toBe(0);
  });
});

describe('sanitizeAmountInput', () => {
  it('drops everything that is not a digit or a decimal point', () => {
    expect(sanitizeAmountInput('1a2b.5x')).toBe('12.5');
  });

  it('keeps only the first decimal point', () => {
    expect(sanitizeAmountInput('1.2.3.4')).toBe('1.234');
  });

  it('leaves a trailing point alone so a number can still be typed', () => {
    expect(sanitizeAmountInput('12.')).toBe('12.');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-09-20T12:00:00.000Z');
  const ago = (ms: number) => formatRelativeTime(now - ms, now);

  it('calls the last few seconds "just now"', () => {
    expect(ago(0)).toBe('just now');
    expect(ago(9_000)).toBe('just now');
  });

  it('counts in seconds, then minutes, then hours', () => {
    expect(ago(42_000)).toBe('42s ago');
    expect(ago(5 * 60_000)).toBe('5m ago');
    expect(ago(3 * 3_600_000)).toBe('3h ago');
  });

  it('keeps counting in days past the first one', () => {
    expect(ago(30 * 3_600_000)).toBe('1d ago');
    expect(ago(9 * 24 * 3_600_000)).toBe('9d ago');
  });

  it('never counts backwards if the clock disagrees', () => {
    expect(ago(-5_000)).toBe('just now');
  });
});
