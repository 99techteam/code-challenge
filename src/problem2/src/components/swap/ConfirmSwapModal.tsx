import React from "react";
import { ArrowDownUp } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { Token } from "@/types";

interface ConfirmSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  exchangeRate: number;
  onConfirm: () => void;
}

export const ConfirmSwapModal: React.FC<ConfirmSwapModalProps> = ({
  isOpen,
  onClose,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  exchangeRate,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Swap">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={fromToken.icon}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="text-xl font-bold text-text-primary">{fromAmount}</div>
                <div className="text-sm text-text-secondary">{fromToken.symbol}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-3 z-10">
            <div className="bg-background-secondary p-1.5 rounded-full border border-gray-700">
              <ArrowDownUp
                size={16}
                className="text-text-secondary"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={toToken.icon}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="text-xl font-bold text-text-primary">{toAmount}</div>
                <div className="text-sm text-text-secondary">{toToken.symbol}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 py-2 border-t border-gray-800 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Rate</span>
            <span className="text-text-primary font-medium">
              1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Network Fee</span>
            <span className="text-text-primary font-medium">0.001 {fromToken.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Price Impact</span>
            <span className="text-success font-medium">0.05%</span>
          </div>
        </div>

        <Button
          className="w-full py-6 text-lg"
          onClick={onConfirm}>
          Confirm Swap
        </Button>
      </div>
    </Modal>
  );
};
