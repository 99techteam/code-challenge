import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSwap } from "@/contexts/SwapContext";
import TokenLogo from "./TokenLogo";
interface SwapSuccessModalProps {
  fromAmount: string;
  toAmount: string;
  resetForm: () => void;
  open: boolean;
  setOpen: (val: boolean) => void;
}
const SwapSuccessModal: React.FC<SwapSuccessModalProps> = ({
  fromAmount,
  toAmount,
  resetForm,
  open,
  setOpen,
}) => {
  const { tokenFrom, tokenTo } = useSwap();
  if (!tokenFrom || !tokenTo) {
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white text-text rounded-lg p-6 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Swap Successful!
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-center">
          <p className="text-gray-400">You have successfully swapped</p>
          <div className="flex justify-center items-center gap-2 mt-2">
            <TokenLogo tokenName={tokenFrom.currency} />
            <span className="text-lg font-semibold">
              {fromAmount} {tokenFrom.currency}
            </span>
            <span className="text-gray-400">to</span>
            <TokenLogo tokenName={tokenTo.currency} />
            <span className="text-lg font-semibold">
              {toAmount} {tokenTo.currency}
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <DialogClose asChild>
            <Button onClick={resetForm}>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapSuccessModal;
