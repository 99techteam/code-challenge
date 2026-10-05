import Decimal from 'decimal.js';

export const Amount = Decimal.clone({
  precision: 50,
  rounding: Decimal.ROUND_DOWN,
});
export interface Token {
  currency: string;
  price: number;
  date: string;
  name: string;
}
const TOKEN_NAMES: Record<string, string> = {
  ETH: 'Ethereum',
  USDC: 'USD Coin',
  WBTC: 'Wrapped Bitcoin',
  SWTH: 'Switcheo',
  ATOM: 'Cosmos',
  OSMO: 'Osmosis',
  BLUR: 'Blur',
  BUSD: 'Binance USD',
  USD: 'US Dollar',
  bNEO: 'Staked NEO',
  GMX: 'GMX',
  LUNA: 'Terra',
  ZIL: 'Zilliqa',
  OKB: 'OKB',
  wstETH: 'Wrapped stETH',
  KUJI: 'Kujira',
};

export function normalizePrices(data: unknown): Token[] {
  if (!Array.isArray(data)) throw new Error('Invalid price response.');
  const unique = new Map<string, Token>();
  for (const item of data) {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.currency !== 'string' ||
      !/^[a-zA-Z0-9]{1,20}$/.test(item.currency) ||
      typeof item.price !== 'number' ||
      !Number.isFinite(item.price) ||
      item.price <= 0 ||
      typeof item.date !== 'string' ||
      !Number.isFinite(Date.parse(item.date))
    )
      continue;
    const previous = unique.get(item.currency);
    // Prefer the newest observation; the last record wins when timestamps tie.
    if (!previous || Date.parse(item.date) >= Date.parse(previous.date)) {
      unique.set(item.currency, {
        currency: item.currency,
        price: item.price,
        date: item.date,
        name: TOKEN_NAMES[item.currency] || item.currency,
      });
    }
  }
  if (unique.size < 2)
    throw new Error('Not enough priced tokens are available.');
  return [...unique.values()].sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}

export function validateAmount(value: string): string {
  if (!value) return '';
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value))
    return 'Enter a valid positive amount.';
  const amount = new Amount(value);
  if (amount.lte(0)) return 'Amount must be greater than zero.';
  if (amount.gt('1000000000000')) return 'Amount must not exceed 1 trillion.';
  if ((value.split('.')[1] || '').length > 18)
    return 'Use up to 18 decimal places.';
  return '';
}

export function validatePair(from?: Token, to?: Token): string {
  return from && to && from.currency === to.currency
    ? 'Choose two different tokens to swap.'
    : '';
}

export function getQuote(
  amount: string,
  from?: Pick<Token, 'price'>,
  to?: Pick<Token, 'price'>,
): Decimal | null {
  if (
    !amount ||
    validateAmount(amount) ||
    !from ||
    !to ||
    !Number.isFinite(from.price) ||
    !Number.isFinite(to.price) ||
    from.price <= 0 ||
    to.price <= 0
  )
    return null;
  return new Amount(amount).mul(from.price).div(to.price);
}

export function formatAmount(value: Decimal.Value): string {
  const number = new Amount(value);
  if (number.isZero()) return '0';
  if (number.abs().lt('1e-18')) return '< 0.000000000000000001';
  if (number.abs().gte('1e15'))
    return number.toSignificantDigits(6).toExponential();
  const rounded = number.abs().lt(1)
    ? number.toSignificantDigits(6)
    : number.toDecimalPlaces(6);
  const [whole, fraction] = rounded.toFixed().split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function usd(value: Decimal.Value): string {
  const number = Number(value);
  if (number > 0 && number < 0.01) return '< $0.01';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(number);
}
