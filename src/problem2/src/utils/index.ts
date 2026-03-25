import { BASE_TOKEN_IMAGE_URL } from "@/constants";
import type { IToken, RawToken } from "@/types";

export function sleep(ms: number = 1e3) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function uniqueLatestByCurrency<T extends { currency: string, date: string }>(tokens: T[]) {
  const map = new Map<string, T>()

  tokens.forEach((token) => {
    const existing = map.get(token.currency)

    if (!existing) {
      map.set(token.currency, token)
    } else {
      const currentDate = new Date(token.date)
      const existingDate = new Date(existing.date)

      if (currentDate > existingDate) {
        map.set(token.currency, token)
      }
    }
  })

  return Array.from(map.values())
}

export function compareByCurrency(a: IToken, b: IToken) {
  return a.currency.localeCompare(b.currency);
}

export function getTokenImageUrl(currency: string) {
  // Some tokens have different names in the API response compared to the image file names
  const currencyMap: Record<string, string> = {
    RATOM: 'rATOM',
    STATOM: 'stATOM',
    STEVMOS: 'stEVMOS',
    STLUNA: 'stLUNA',
    STOSMO: 'stOSMO',
  }

  const token = currencyMap[currency] || currency;

  return `${BASE_TOKEN_IMAGE_URL}/${token}.svg`
}

export function parseToken(token: RawToken): IToken {
  return {
    ...token,
    date: new Date(token.date),
    imageUrl: getTokenImageUrl(token.currency),
  }
}

export function calculateToken(amount: number, fromToken: IToken, toToken: IToken, fractionDigits: number = 4) {
  return Number((amount * fromToken.price / toToken.price).toFixed(fractionDigits))
}

export function validateExchange(fromToken: IToken | null, toToken: IToken | null, tokenSend: number, tokenReceive: number) {
  const errors: Record<string, string> = {}

  if (!fromToken) {
    errors.fromToken = "This field is required"
  }

  if (!toToken) {
    errors.toToken = "This field is required"
  }

  if (tokenSend <= 0) {
    errors.tokenSend = "Must be greater than 0"
  }

  if (tokenReceive <= 0) {
    errors.tokenReceive = "Must be greater than 0"
  }

  return errors
}