import { CheckCircle, X } from "lucide-react";
import { Token } from "../../types";
import { TokenIcon } from "./token-icon";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { cn } from "../../utils";

interface SuccessModalProps {
  fromAmount: string;
  toAmount: string;
  fromToken: Token;
  toToken: Token;
  onClose: () => void;
}

export function SuccessModal({
  fromAmount,
  toAmount,
  fromToken,
  toToken,
  onClose,
}: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
        className={cn(
          "relative w-full max-w-sm",
          "bg-card border border-border rounded-3xl p-6",
          "shadow-2xl shadow-gray-300/60",
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
          className="flex justify-center mb-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-emerald-400" />
          </div>
        </motion.div>

        <h2 className="text-xl font-bold text-center mb-1">Swap Confirmed!</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Your transaction was submitted successfully
        </p>

        <div className="bg-secondary/60 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TokenIcon token={fromToken} size="md" />
              <div>
                <p className="text-sm font-semibold text-red-400">
                  -{fromAmount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fromToken.symbol}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-muted-foreground text-sm">→</span>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse sm:flex-row">
              <TokenIcon token={toToken} size="md" />
              <div className="text-right sm:text-left">
                <p className="text-sm font-semibold text-emerald-400">
                  +{parseFloat(toAmount).toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {toToken.symbol}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="swap"
            size="sm"
            className="flex-1 w-full"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
