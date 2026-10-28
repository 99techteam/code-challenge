import { test } from 'node:test';
import assert from 'node:assert';
import type { SwapOrder } from '../domain/types.ts';
import type { NoticeTone, SwapFormHandlers, SwapViewModel, TokenPickRequest } from './ports.ts';
import { createInitialState } from './state.ts';
import { Store } from './store.ts';
import { SwapController } from './SwapController.ts';

// Wires the controller to in-memory fakes so each use case can be driven without a DOM.
function setup({ pickResult = null as string | null, failSwap = false, failPrices = false } = {}) {
  const store = new Store(createInitialState());
  const renders: SwapViewModel[] = [];
  const orders: SwapOrder[] = [];
  const notices: Array<[string, NoticeTone]> = [];
  const pickRequests: TokenPickRequest[] = [];
  const progress = { shown: [] as string[], dismissed: 0 };
  let handlers: SwapFormHandlers | undefined;

  const controller = new SwapController({
    store,
    prices: {
      load: async () => {
        if (failPrices) throw new Error('offline');
        return {
          prices: new Map([
            ['USDC', 1],
            ['ETH', 2000],
            ['BTC', 40000],
          ]),
          origin: 'live' as const,
        };
      },
    },
    executor: {
      execute: async (order) => {
        if (failSwap) throw new Error('rejected');
        orders.push(order);
      },
    },
    view: {
      bind: (h) => {
        handlers = h;
      },
      render: (model) => {
        renders.push(model);
      },
    },
    picker: {
      pick: async (request) => {
        pickRequests.push(request);
        return pickResult;
      },
    },
    notifier: {
      notify: (message, tone) => notices.push([message, tone]),
      progress: (message) => {
        progress.shown.push(message);
        return () => {
          progress.dismissed++;
        };
      },
    },
  });

  return { controller, store, renders, orders, notices, pickRequests, progress, handlers: () => handlers };
}

test('start binds the view, loads prices and renders them', async () => {
  const { controller, store, renders, handlers } = setup();
  await controller.start();
  assert.ok(handlers());
  assert.deepStrictEqual(store.state.symbols, ['BTC', 'ETH', 'USDC']);
  assert.strictEqual(renders[0]?.badge.state, 'loading');
  assert.strictEqual(renders.at(-1)?.badge.state, 'live');
});

test('loadPrices reports progress and always dismisses it', async () => {
  const ok = setup();
  await ok.controller.start();
  assert.deepStrictEqual(ok.progress, { shown: ['Loading prices…'], dismissed: 1 });

  const failed = setup({ failPrices: true });
  await assert.rejects(failed.controller.loadPrices());
  assert.strictEqual(failed.progress.dismissed, 1);
});

test('changeAmount strips thousands separators', async () => {
  const { controller, store } = setup();
  await controller.start();
  controller.changeAmount('1,250.5');
  assert.strictEqual(store.state.amountIn, '1250.5');
});

test('flip swaps the two tokens', async () => {
  const { controller, store } = setup();
  await controller.start();
  controller.flip();
  assert.strictEqual(store.state.from, 'USDC');
  assert.strictEqual(store.state.to, 'ETH');
});

test('pickToken updates the requested side, and ignores a dismissed picker', async () => {
  const picked = setup({ pickResult: 'BTC' });
  await picked.controller.start();
  await picked.controller.pickToken('to');
  assert.strictEqual(picked.store.state.to, 'BTC');
  assert.strictEqual(picked.pickRequests[0]?.title, 'Select token to receive');
  assert.strictEqual(picked.pickRequests[0]?.selected, 'USDC');

  const dismissed = setup();
  await dismissed.controller.start();
  await dismissed.controller.pickToken('from');
  assert.strictEqual(dismissed.store.state.from, 'ETH');
});

test('submit executes the quoted order, notifies and clears the amount', async () => {
  const { controller, store, orders, notices } = setup();
  await controller.start();
  controller.changeAmount('2');
  await controller.submit();
  assert.deepStrictEqual(orders, [{ from: 'ETH', to: 'USDC', amountIn: 2, amountOut: 4000 }]);
  assert.deepStrictEqual(notices, [['Swapped 2 ETH for 4000 USDC', 'success']]);
  assert.strictEqual(store.state.amountIn, '');
  assert.strictEqual(store.state.submitting, false);
});

test('submit does nothing for an invalid swap', async () => {
  const { controller, orders } = setup();
  await controller.start();
  controller.changeAmount('0');
  await controller.submit();
  assert.strictEqual(orders.length, 0);
});

test('submit reports a failed swap and keeps the amount', async () => {
  const { controller, store, notices } = setup({ failSwap: true });
  await controller.start();
  controller.changeAmount('1');
  await controller.submit();
  assert.deepStrictEqual(notices, [['Swap failed. Please try again.', 'error']]);
  assert.strictEqual(store.state.amountIn, '1');
  assert.strictEqual(store.state.submitting, false);
});
