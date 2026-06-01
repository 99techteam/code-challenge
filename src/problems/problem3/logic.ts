// ── Types ─────────────────────────────────────────────────────────────────────

export type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo'

export interface BoxProps {
  [key: string]: unknown
}

export interface WalletBalance {
  currency: string
  amount: number
  blockchain: Blockchain
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string
  usdValue: number
}

// ── Pure logic ────────────────────────────────────────────────────────────────

export const getPriority = (blockchain: Blockchain): number => {
  switch (blockchain) {
    case 'Osmosis':  return 100
    case 'Ethereum': return 50
    case 'Arbitrum': return 30
    case 'Zilliqa':  return 20
    case 'Neo':      return 20
    default:         return -99
  }
}

// ── Mock hooks ────────────────────────────────────────────────────────────────

export const useWalletBalances = (): WalletBalance[] => {
  return [
    { currency: 'OSMO',  amount: 120.5,  blockchain: 'Osmosis'  },
    { currency: 'ETH',   amount: 2.75,   blockchain: 'Ethereum' },
    { currency: 'ARB',   amount: 500,    blockchain: 'Arbitrum' },
    { currency: 'ZIL',   amount: 0,      blockchain: 'Zilliqa'  },
    { currency: 'NEO',   amount: -5,     blockchain: 'Neo'      },
  ]
}

export const usePrices = (): Record<string, number> => {
  return {
    OSMO: 0.42,
    ETH:  3200,
    ARB:  1.15,
  }
}
