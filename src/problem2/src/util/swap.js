export function getExchangeRate(tokens, fromCurrency, toCurrency) {
  const from = tokens.find((t) => t.currency === fromCurrency)
  const to = tokens.find((t) => t.currency === toCurrency)
  if (!from || !to) return null
  return from.price && to.price ? to.price / from.price : null
}

export function formatToAmount(value) {
  if (value < 1e-12) return '0'
  return value.toFixed(8).replace(/\.?0+$/, '')
}
