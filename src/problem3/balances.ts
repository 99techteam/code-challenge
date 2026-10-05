export interface WalletBalance {
  /** Stable, unique balance-position ID supplied by the data layer. */
  readonly id: string;
  readonly blockchain: string;
  readonly currency: string;
  readonly amount: number;
}

export type Prices = Readonly<Partial<Record<string, number>>>;

// Unknown chains remain valid inputs, but are excluded from this view.
function getPriority(blockchain: string): number {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
    case 'Neo':
      return 20;
    default:
      return -99;
  }
}

export function selectBalances(
  balances: readonly WalletBalance[],
): WalletBalance[] {
  const ranked: { balance: WalletBalance; priority: number }[] = [];

  for (const balance of balances) {
    const priority = getPriority(balance.blockchain);
    if (
      priority > -99 &&
      Number.isFinite(balance.amount) &&
      balance.amount > 0
    ) {
      ranked.push({ balance, priority });
    }
  }

  return ranked
    .sort((left, right) => right.priority - left.priority)
    .map(({ balance }) => balance);
}

const amountFormatter = new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 8,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatAmount(amount: number): string {
  return amountFormatter.format(amount);
}

export function getUsdValue(
  amount: number,
  price: number | undefined,
): number | null {
  if (price === undefined || !Number.isFinite(price) || price < 0) return null;
  const value = price * amount;
  return Number.isFinite(value) ? value : null;
}

export function formatUsd(value: number): string {
  return value > 0 && value < 0.01 ? '< $0.01' : usdFormatter.format(value);
}
