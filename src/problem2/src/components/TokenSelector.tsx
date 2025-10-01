import type { Token } from "@/types";
import { Button } from "./ui/button";

const TokenSelector = ({ token, onClick }: { token: Token; onClick: () => void }) => (
  <Button
    onClick={onClick}
    variant="secondary"
    className="h-auto px-4 py-3 min-w-[140px] transition-all duration-200 hover:scale-105 justify-start"
  >
    <div className="flex flex-col items-start">
      <span className="font-bold text-lg">{token.symbol}</span>
      <span className="text-xs text-muted-foreground">{token.name}</span>
    </div>
  </Button>
);

export default TokenSelector;