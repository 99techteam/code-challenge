import type { Token } from "@/types";
import { Dialog, DialogContent } from "./ui/dialog";
import { ArrowDown, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

const SuccessDialog = ({ 
  open, 
  onOpenChange, 
  fromToken, 
  toToken, 
  fromAmount, 
  toAmount 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="relative">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Swap Successful!</h3>
          <p className="text-muted-foreground">Your transaction has been completed</p>
        </div>
        <div className="w-full p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">From:</span>
            <span className="font-bold">{fromAmount} {fromToken.symbol}</span>
          </div>
          <div className="flex justify-center">
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">To:</span>
            <span className="font-bold">{toAmount} {toToken.symbol}</span>
          </div>
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default SuccessDialog;