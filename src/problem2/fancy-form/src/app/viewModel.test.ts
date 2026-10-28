import { test } from 'node:test';
import assert from 'node:assert';
import { createInitialState, type SwapState } from './state.ts';
import { toViewModel } from './viewModel.ts';

const loaded: SwapState = {
  ...createInitialState(),
  prices: new Map([
    ['ETH', 2000],
    ['USDC', 1],
  ]),
  symbols: ['ETH', 'USDC'],
  priceStatus: 'live',
};

test('toViewModel shows a loading badge and no rate before prices arrive', () => {
  const vm = toViewModel(createInitialState());
  assert.deepStrictEqual(vm.badge, { label: 'Connecting', state: 'loading' });
  assert.strictEqual(vm.rate, null);
  assert.strictEqual(vm.canSubmit, false);
});

test('toViewModel quotes the output amount and USD values', () => {
  const vm = toViewModel({ ...loaded, amountIn: '1.5' });
  assert.strictEqual(vm.amountOut, '3000');
  assert.strictEqual(vm.usdIn, '≈ $3,000.00');
  assert.strictEqual(vm.usdOut, '≈ $3,000.00');
  assert.deepStrictEqual(vm.rate, { text: '1 ETH = 2000 USDC', usd: '($2,000.00)' });
  assert.strictEqual(vm.canSubmit, true);
});

test('toViewModel blocks submit while a swap is in flight', () => {
  const vm = toViewModel({ ...loaded, amountIn: '1', submitting: true });
  assert.strictEqual(vm.canSubmit, false);
  assert.strictEqual(vm.submitting, true);
});
