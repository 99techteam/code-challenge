import type { NoticeTone, Notifier } from '../app/ports.ts';
import { byId } from './dom.ts';

type ToastTone = NoticeTone | 'loading';

// Fast operations finish before this, so their progress toast never flashes.
const PROGRESS_DELAY_MS = 300;

// Transient status message pinned to the bottom of the viewport. Being fixed,
// it never pushes page content around.
export class Toast implements Notifier {
  readonly #el = byId('toast', HTMLElement);
  readonly #durationMs: number;
  #timer: number | undefined;
  // Bumped on every show, so a stale dismiss can't hide a newer message.
  #shown = 0;

  constructor(durationMs = 3200) {
    this.#durationMs = durationMs;
  }

  notify(message: string, tone: NoticeTone): void {
    this.#show(message, tone);
    this.#timer = window.setTimeout(() => this.#hide(), this.#durationMs);
  }

  progress(message: string): () => void {
    let shown = -1;
    const pending = window.setTimeout(() => {
      shown = this.#show(message, 'loading');
    }, PROGRESS_DELAY_MS);

    return () => {
      window.clearTimeout(pending);
      if (shown === this.#shown) this.#hide();
    };
  }

  #show(message: string, tone: ToastTone): number {
    window.clearTimeout(this.#timer);
    const toast = this.#el;
    toast.textContent = message;
    toast.dataset.tone = tone;
    toast.hidden = false;
    toast.classList.remove('is-visible');
    void toast.offsetWidth; // reflow so the enter transition replays
    toast.classList.add('is-visible');
    return ++this.#shown;
  }

  #hide(): void {
    this.#el.classList.remove('is-visible');
    this.#el.hidden = true;
  }
}
