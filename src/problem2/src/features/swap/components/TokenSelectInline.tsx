import { TokenIcon } from "./TokenIcon";

interface Props {
  symbol: string;
}

export function TokenSelectInline({ symbol }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <TokenIcon symbol={symbol} size={24} />
      <span>{symbol}</span>
      <span className="opacity-60">▾</span>
    </div>
  );
}
