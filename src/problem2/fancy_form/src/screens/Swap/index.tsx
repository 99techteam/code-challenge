import { Separator } from "@/components/ui/separator";
import { useSwap } from "@/contexts/SwapContext";
import { useSwapAmountSync } from "@/hooks/useSwapAmountSync";
import { ArrowsDownUpIcon, ArrowsLeftRightIcon } from "@phosphor-icons/react";
import SwapInput from "./components/SwapToken";
import { convertPrice } from "@/lib/convertPrice";
import SwapSuccessModal from "./components/SwapSuccessModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const SwapScreen = () => {
  const { tokenFrom, tokenTo, swapToken } = useSwap();
  const [open, setOpen] = useState(false);
  const {
    control,
    setLastEditedField,
    fromAmount,
    toAmount,
    reset,
    errors,
    isValid,
    handleSubmit,
  } = useSwapAmountSync(tokenFrom, tokenTo);
  const onSubmit = () => {
    setOpen(true);
  };
  const renderConvert = () => {
    if (!tokenFrom || !tokenTo) return null;
    return (
      <div className="flex items-center text-text mt-2 text-xs gap-x-1">
        1{tokenFrom?.currency} <ArrowsLeftRightIcon size={10} />
        {convertPrice(tokenFrom, tokenTo, 1)} {tokenTo?.currency}
      </div>
    );
  };
  return (
    <main className="min-w-[450px] max-w-[580px]">
      <div className="border rounded-md border-cardBorder bg-white shadow">
        <div className="pt-6 px-6 pb-10">
          <p className="text-textSubtle text-xs font-semibold">From</p>
          <SwapInput
            title="From"
            control={control}
            name="fromAmount"
            onFocus={() => setLastEditedField("from")}
          />
        </div>
        <div className="relative">
          <Separator />
          <div
            className="rounded-full size-10 border border-cardBorder flex items-center justify-center absolute left-1/2 -translate-x-1/2 bg-white -bottom-5 group cursor-pointer group "
            onClick={swapToken}
          >
            <ArrowsDownUpIcon
              size={20}
              className="group-hover:rotate-180 transition-all duration-200"
            />
          </div>
        </div>
        <div className="pb-6 px-6 pt-10">
          <p className="text-textSubtle text-xs font-semibold">To</p>
          <SwapInput
            title="To"
            control={control}
            name="toAmount"
            onFocus={() => setLastEditedField("to")}
          />
        </div>
      </div>
      <div className="p-6 bg-white rounded-md mt-6 shadow">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Button type="submit" className="w-full" disabled={!isValid}>
            Swap
          </Button>
        </form>
        {renderConvert()}
        {Object.values(errors).map((error) =>
          error?.message ? (
            <p key={error.message} className="text-red-500 text-xs mt-2">
              {error.message}
            </p>
          ) : null
        )}
      </div>
      <SwapSuccessModal
        open={open}
        setOpen={setOpen}
        fromAmount={fromAmount}
        toAmount={toAmount}
        resetForm={reset}
      />
    </main>
  );
};

export default SwapScreen;
