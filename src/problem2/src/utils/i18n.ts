import en from '../locales/en.json'

/**
 * Get translated string by dot-separated key (e.g. "swap.title").
 * Params: use {{paramName}} in locale value, then t("key", { paramName: "value" })
 */
function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (acc, k) => (acc != null && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
    obj,
  )
}

export function t(key: string, params?: Record<string, string | number>): string {
  const value = getNested(en as Record<string, unknown>, key)
  const str = typeof value === 'string' ? value : key
  if (!params) return str
  return Object.entries(params).reduce(
    (s, [k, v]) =>
      s.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v)),
    str,
  )
}
