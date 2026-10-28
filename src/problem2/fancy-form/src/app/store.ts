type Listener<T> = (state: T) => void;

// Minimal observable store: replaces state immutably and notifies subscribers.
export class Store<T extends object> {
  #state: T;
  readonly #listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.#state = initial;
  }

  get state(): T {
    return this.#state;
  }

  update(patch: Partial<T>): void {
    this.#state = { ...this.#state, ...patch };
    for (const listener of this.#listeners) listener(this.#state);
  }

  subscribe(listener: Listener<T>): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }
}
