import { el } from './dom.ts';

// Token icons ship locally under public/tokens/ (served next to the page).
const ICON_BASE = `${import.meta.env.BASE_URL}tokens/`;

// Stable hue per symbol, used to tint the initials fallback.
function hueOf(symbol: string): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function createTokenAvatar(symbol: string): HTMLSpanElement {
  const avatar = el('span', 'token-avatar');
  avatar.style.setProperty('--avatar-hue', String(hueOf(symbol)));

  const icon = el('img', 'token-icon');
  icon.alt = '';
  icon.decoding = 'async';
  icon.loading = 'lazy';
  // Broken or missing icons fall back to the initials avatar.
  icon.addEventListener('error', () => avatar.classList.add('is-fallback'), { once: true });
  icon.src = ICON_BASE + encodeURIComponent(symbol) + '.svg';

  avatar.append(icon, el('span', 'token-fallback', symbol.slice(0, 2).toUpperCase()));
  return avatar;
}
