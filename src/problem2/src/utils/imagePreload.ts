/**
 * Preload token images in background so dropdown shows them from cache.
 */

const preloadCache = new Set<string>();

export function preloadTokenImages(urls: string[], limit = 20): void {
  const toLoad = urls.filter(Boolean).filter((url) => !preloadCache.has(url));
  toLoad.slice(0, limit).forEach((url) => {
    preloadCache.add(url);
    const img = new Image();
    img.src = url;
  });
}
