import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0, 2.0];

const SlippageConfigDialog = ({ 
  open, 
  onOpenChange, 
  slippage, 
  setSlippage 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slippage: number;
  setSlippage: (slippage: number) => void;
}) => {
  const [customSlippage, setCustomSlippage] = useState('');

  const handlePresetClick = useCallback((value: number) => {
    setSlippage(value);
    setCustomSlippage('');
  }, [setSlippage]);

  const handleCustomChange = useCallback((value: string) => {
    setCustomSlippage(value);
    if (value) setSlippage(parseFloat(value));
  }, [setSlippage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Slippage Tolerance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            {SLIPPAGE_PRESETS.map((value) => (
              <Button
                key={value}
                onClick={() => handlePresetClick(value)}
                variant={slippage === value && !customSlippage ? "default" : "outline"}
                className="flex-1"
              >
                {value}%
              </Button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Custom %"
            value={customSlippage}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-full px-3 py-2 bg-input text-foreground rounded-lg outline-none focus:ring-2 focus:ring-primary"
            step="0.1"
            min="0.1"
            max="50"
          />
          <p className="text-sm text-muted-foreground">
            Your transaction will revert if the price changes unfavorably by more than this percentage.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlippageConfigDialog;