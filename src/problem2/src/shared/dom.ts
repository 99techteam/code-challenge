export function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required page element was not found: ${selector}`);
  return element;
}

export function getElements<T extends Element>(selector: string): T[] {
  return [...document.querySelectorAll<T>(selector)];
}
