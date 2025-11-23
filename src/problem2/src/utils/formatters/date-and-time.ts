import type { Price } from '../types'

export const getLatestUniqueTokens = (data: Price[]) => {
  const map = new Map()

  data.forEach(item => {
    const existing = map.get(item.currency)

    // If no record yet OR the new one is more recent, replace it
    if (!existing || new Date(item.date) > new Date(existing.date)) {
      map.set(item.currency, item)
    }
  })

  return Array.from(map.values())
}
