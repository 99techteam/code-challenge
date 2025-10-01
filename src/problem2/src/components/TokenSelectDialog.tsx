import type { Token } from "@/types";
import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

const TokenSelectDialog = ({ 
  open, 
  onOpenChange, 
  onSelect, 
  currentToken, 
  tokens 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (token: Token) => void;
  currentToken: Token;
  tokens: Token[];
}) => {
  const filteredTokens = useMemo(
    () => tokens.filter(t => t.symbol !== currentToken.symbol),
    [tokens, currentToken]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-1">
          {filteredTokens.map((token, index) => (
            <Button
              key={token.symbol}
              onClick={() => onSelect(token)}
              variant="ghost"
              className="w-full justify-start h-auto p-3 hover:bg-accent"
              style={{
                animationDelay: `${index * 20}ms`,
                animation: 'fadeSlideIn 0.3s ease-out forwards',
                opacity: 0
              }}
            >
              <div className="flex-1 text-left">
                <div className="font-bold">{token.symbol}</div>
                <div className="text-xs text-muted-foreground">{token.name}</div>
                <div className="text-xs text-muted-foreground">
                  ${token.price.toFixed(token.price < 1 ? 4 : 2)}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelectDialog;