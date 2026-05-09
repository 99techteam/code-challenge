export interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

export function WalletRow({
  className,
  amount,
  usdValue,
  formattedAmount,
}: WalletRowProps) {
  return (
    <div className={className} data-amount={amount} data-usd-value={usdValue}>
      {formattedAmount}
    </div>
  );
}
