const ICON_ROOT = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

export function setTokenIcon(image: HTMLImageElement, symbol: string): void {
  image.src = `${ICON_ROOT}${encodeURIComponent(symbol)}.svg`;
  image.alt = `${symbol} token icon`;
  image.onerror = () => {
    image.onerror = null;
    image.style.display = 'none';
  };
  image.style.display = '';
}
