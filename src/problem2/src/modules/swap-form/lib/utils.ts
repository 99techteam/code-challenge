type Prices = Record<string, number>;

const MAX_INPUT_AMOUNT = 1_000_000_000_000;
const MAX_INPUT_DECIMALS = 6;
const AMOUNT_FORMAT = /^\d*\.?\d*$/;

export function getValidatedPayAmount(nextAmount: string): string | null {
  if (nextAmount === '') {
    return '';
  }

  if (!AMOUNT_FORMAT.test(nextAmount)) {
    return null;
  }

  const [, decimalPart = ''] = nextAmount.split('.');
  if (decimalPart.length > MAX_INPUT_DECIMALS) {
    return null;
  }

  const parsedAmount = Number(nextAmount);
  if (!Number.isFinite(parsedAmount)) {
    return null;
  }

  if (parsedAmount > MAX_INPUT_AMOUNT) {
    return String(MAX_INPUT_AMOUNT);
  }

  return nextAmount;
}

export function getReceiveAmount(
  payAmount: string,
  payCurrency: string,
  receiveCurrency: string,
  prices: Prices,
): string {
  const parsedPayAmount = Number(payAmount);
  const payPrice = prices[payCurrency];
  const receivePrice = prices[receiveCurrency];

  if (
    !Number.isFinite(parsedPayAmount) ||
    parsedPayAmount <= 0 ||
    !Number.isFinite(payPrice) ||
    !Number.isFinite(receivePrice) ||
    receivePrice <= 0
  ) {
    return '';
  }

  const calculatedAmount = (parsedPayAmount * payPrice) / receivePrice;
  return Number.isFinite(calculatedAmount)
    ? calculatedAmount.toFixed(MAX_INPUT_DECIMALS)
    : '';
}

export function getUsdNotional(
  amount: string,
  currency: string,
  prices: Prices,
): number | null {
  const parsedAmount = Number(amount);
  const price = prices[currency];

  if (
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0 ||
    !Number.isFinite(price)
  ) {
    return null;
  }

  return parsedAmount * price;
}

export function formatUsdValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}