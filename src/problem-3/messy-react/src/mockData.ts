export const MOCK_BALANCES = [
  { blockchain: "Osmosis",  currency: "OSMO",  amount: 1340.75 },
  { blockchain: "Ethereum", currency: "ETH",   amount: 2.48    },
  { blockchain: "Arbitrum", currency: "ARB",   amount: 850.0   },
  { blockchain: "Zilliqa",  currency: "ZIL",   amount: 12000   },
  { blockchain: "Neo",      currency: "NEO",   amount: 35.5    },
  { blockchain: "Ethereum", currency: "USDC",  amount: 0       },
  { blockchain: "Solana",   currency: "SOL",   amount: 10      },
];

export const MOCK_PRICES: Record<string, number> = {
  OSMO:  0.52,
  ETH:   3_420.00,
  ARB:   1.15,
  ZIL:   0.018,
  NEO:   14.30,
  USDC:  1.00,
  SOL:   142.00,
};