import { createInitialState } from './app/state.ts';
import { Store } from './app/store.ts';
import { SwapController } from './app/SwapController.ts';
import { FALLBACK_PRICES } from './data/fallbackPrices.ts';
import { FallbackPriceSource } from './services/FallbackPriceSource.ts';
import { HttpPriceSource } from './services/HttpPriceSource.ts';
import { SimulatedSwapExecutor } from './services/SimulatedSwapExecutor.ts';
import { StaticPriceSource } from './services/StaticPriceSource.ts';
import { DomSwapFormView } from './ui/DomSwapFormView.ts';
import { Toast } from './ui/Toast.ts';
import { TokenPickerModal } from './ui/TokenPickerModal.ts';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

// Composition root: the only place that picks concrete implementations.
const controller = new SwapController({
  store: new Store(createInitialState()),
  prices: new FallbackPriceSource(new HttpPriceSource(PRICES_URL), new StaticPriceSource(FALLBACK_PRICES)),
  executor: new SimulatedSwapExecutor(),
  view: new DomSwapFormView(),
  picker: new TokenPickerModal(),
  notifier: new Toast(),
});

void controller.start();
