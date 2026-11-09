export interface WalletBalance {
  id: string;
  currency: string;
  blockchain: string;
  amount: number;
}

export type Prices = Readonly<Record<string, number | undefined>>;

const priorities: Readonly<Record<string, number | undefined>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

export function getPriority(blockchain: string): number {
  return Object.hasOwn(priorities, blockchain) ? priorities[blockchain]! : -99;
}

export function sortBalances(balances: readonly WalletBalance[]): WalletBalance[] {
  return balances
    .map(balance => ({ balance, priority: getPriority(balance.blockchain) }))
    .filter(({ balance, priority }) => priority > -99 && Number.isFinite(balance.amount) && balance.amount > 0)
    .sort((left, right) => right.priority - left.priority)
    .map(({ balance }) => balance);
}

export function getUsdValue(balance: WalletBalance, prices: Prices): number | null {
  const price = Object.hasOwn(prices, balance.currency) ? prices[balance.currency] : undefined;
  if (price === undefined || !Number.isFinite(price) || price < 0) return null;
  const value = price * balance.amount;
  return Number.isFinite(value) ? value : null;
}
