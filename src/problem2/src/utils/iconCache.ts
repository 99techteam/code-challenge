import { API_CONFIG } from './constants';

// Global icon cache outside component scope
const iconMapCache: Record<string, string> = {};

export const getTokenIconUrl = (currency: string): string => {
  if (!currency) return '';
  
  if (iconMapCache[currency]) {
    return iconMapCache[currency];
  }

  const iconUrl = `${API_CONFIG.TOKEN_ICONS_BASE_URL}/${currency}.svg`;
  iconMapCache[currency] = iconUrl;
  return iconUrl;
};

export const preloadIcon = (currency: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load icon for ${currency}`));
    img.src = getTokenIconUrl(currency);
  });
};

export const clearIconCache = () => {
  Object.keys(iconMapCache).forEach(key => delete iconMapCache[key]);
};
