import { test } from 'node:test';
import assert from 'node:assert';
import { validateSwap } from './validation.ts';

const base = { from: 'ETH', to: 'USDC', amountIn: '1', hasRate: true };

test('validateSwap accepts a positive amount between two priced tokens', () => {
  assert.deepStrictEqual(validateSwap(base), { valid: true, error: '' });
});

test('validateSwap reports user errors', () => {
  assert.strictEqual(validateSwap({ ...base, to: 'ETH' }).error, 'Select two different currencies to swap.');
  assert.strictEqual(validateSwap({ ...base, amountIn: 'abc' }).error, 'Enter a valid number.');
  assert.strictEqual(validateSwap({ ...base, amountIn: '0' }).error, 'Amount must be greater than zero.');
});

test('validateSwap treats empty input or missing rate as incomplete, not an error', () => {
  assert.deepStrictEqual(validateSwap({ ...base, amountIn: '' }), { valid: false, error: '' });
  assert.deepStrictEqual(validateSwap({ ...base, hasRate: false }), { valid: false, error: '' });
});
