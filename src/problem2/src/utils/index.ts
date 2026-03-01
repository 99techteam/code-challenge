export function getMockBalance(currency: string): number {
  let hash = 0
  for (let i = 0; i < currency.length; i++) {
    hash = ((hash << 5) - hash + currency.charCodeAt(i)) | 0
  }
  return Math.abs(hash % 100000) / 1000
}
