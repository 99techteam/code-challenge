// Look up an element by id and assert its type, failing loudly if the markup drifts.
export function byId<T extends HTMLElement>(id: string, type: { new (): T; prototype: T }): T {
  const node = document.getElementById(id);
  if (!(node instanceof type)) throw new Error(`Expected #${id} to be a ${type.name}`);
  return node;
}

// Create an element with a class and optional text content.
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
