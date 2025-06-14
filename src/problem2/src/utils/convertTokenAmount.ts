type ConvertTokenAmountProps = {
  fromAmount: string;
  fromToken: string;
  toToken: string;
  prices: Record<string, number>;
};

export function convertTokenAmount({
  fromAmount,
  fromToken,
  toToken,
  prices,
}: ConvertTokenAmountProps): string {
  const amount = Number(fromAmount);

  if (
    !fromAmount ||
    isNaN(amount) ||
    amount <= 0 ||
    !prices[fromToken] ||
    !prices[toToken]
  ) {
    return '';
  }

  const rate = prices[toToken] / prices[fromToken];
  return (amount * rate).toFixed(6);
}
