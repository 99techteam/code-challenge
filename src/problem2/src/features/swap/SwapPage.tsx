import { useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/common/components/Toast";

import { Card } from "@/features/swap/components/Card";
import { AmountPanel } from "@/features/swap/components/AmountPanel";
import { InfoRow } from "@/features/swap/components/InfoRow";
import { TokenSelector } from "@/features/swap/components/TokenSelector";
import { Button } from "@/common/components/Button";
import { Input } from "@/common/components/Input";

import {
  getDefaultFromToken,
  getDefaultToToken,
  mapPricesToTokens,
} from "@/features/swap/services/swapToken.service";

import { useTokenPrices } from "@/features/swap/hooks/useTokenPrices";
import { useSwapBigNumber } from "@/features/swap/hooks/useSwap";

import { swapSchema } from "./validation/swapSchema";
import type { SwapForm } from "./validation/swapSchema";

import { sanitizeNumericInput } from "@/common/utils/number";

export default function SwapPage() {
  const { data: pricesData } = useTokenPrices();
  const priceMap = useMemo(() => {
    if (!pricesData) return {};
    return mapPricesToTokens(pricesData as any);
  }, [pricesData]);
  const availableTokens = useMemo(() => Object.keys(priceMap), [priceMap]);

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");

  useEffect(() => {
    if (availableTokens.length >= 2 && !fromToken && !toToken) {
      queueMicrotask(() => {
        const defaultFrom = getDefaultFromToken(availableTokens);
        const defaultTo = getDefaultToToken(availableTokens, defaultFrom);
        setFromToken(defaultFrom);
        setToToken(defaultTo);
      });
    }
  }, [availableTokens, fromToken, toToken]);

  // React Hook Form
  const { control, handleSubmit, setValue, reset, watch } = useForm<SwapForm>({
    resolver: zodResolver(swapSchema) as any,
    defaultValues: {
      fromAmount: "0",
      slippage: "1",
    },
  });

  const fromAmount = watch("fromAmount");
  const slippage = watch("slippage");

  // Swap calculation
  const { rate, output } = useSwapBigNumber(
    priceMap,
    fromToken ? fromToken.toUpperCase() : "",
    toToken ? toToken.toUpperCase() : "",
    fromAmount || ""
  );

  const minReceived = useMemo(() => {
    const slippageBN = new BigNumber(slippage || "0").dividedBy(100);
    return output.multipliedBy(new BigNumber(1).minus(slippageBN));
  }, [output, slippage]);

  const COMMISSION_FIXED = new BigNumber(2.48);
  const FEE_PERCENT = new BigNumber(0.003);

  const feeAmount = useMemo(() => output.multipliedBy(FEE_PERCENT), [output]);
  const totalExpectedAfterFees = useMemo(
    () =>
      output
        .multipliedBy(new BigNumber(1).minus(FEE_PERCENT))
        .minus(COMMISSION_FIXED),
    [output]
  );

  const outputFormatted = useMemo(() => {
    if (!output || output.isZero()) return "0";
    return output.decimalPlaces(6).toString();
  }, [output]);

  const onSubmit = (data: SwapForm) => {
    const errors: string[] = [];

    // Validate slippage
    if (!data.slippage || Number(data.slippage) <= 0) {
      errors.push("Slippage must be 0 or positive");
    }

    // Show all error toasts if any
    if (errors.length > 0) {
      errors.forEach((msg) => showToast({ type: "error", message: msg }));
      return; // Stop submission
    }

    // Success: show swap toast
    showToast({
      type: "success",
      message: (
        <>
          Swap submitted:{" "}
          <b>
            {data.fromAmount} {fromToken}
          </b>{" "}
          →{" "}
          <b>
            {outputFormatted} {toToken}
          </b>
        </>
      ),
    });

    // Reset form only on success
    reset({ fromAmount: "0", slippage: "1" });
  };

  const handleSwapTokens = () => {
    const tmp = fromToken;
    setFromToken(toToken);
    setToToken(tmp);
    setValue("fromAmount", outputFormatted);
  };

  return (
    <>
      <Card className="w-full max-w-md space-y-5">
        <div>
          <h1 className="text-lg font-semibold">Swap</h1>
          <p className="text-sm text-white/50">
            Swap Any Assets Simply And Securely With Coin-Ex Algorithm.
          </p>
        </div>

        <div className="relative">
          <Controller
            name="fromAmount"
            control={control}
            render={({ field }) => (
              <AmountPanel
                className="mb-4"
                token={
                  <TokenSelector
                    value={fromToken}
                    tokens={availableTokens}
                    onChange={setFromToken}
                  />
                }
                value={field.value}
                onChange={(val) => field.onChange(sanitizeNumericInput(val))}
                fiatValue={`$${new BigNumber(field.value || 0)
                  .multipliedBy(priceMap[(fromToken || "").toUpperCase()] || 0)
                  .toFixed(6)}`}
              />
            )}
          />

          <div className="absolute inset-x-0 bottom-[calc(50%-14px)] z-20 flex justify-center pointer-events-none">
            <Button
              variant="ghost"
              onClick={handleSwapTokens}
              className="pointer-events-auto !p-0 h-9 w-9 rounded-full bg-gradient-to-b from-[#2b2f38] to-[#1c2028] border border-white/10 shadow-md text-white/80 cursor-pointer transition hover:border-white/20 hover:shadow-lg active:brightness-125"
            >
              ⇅
            </Button>
          </div>

          <AmountPanel
            className="mt-4"
            token={
              <TokenSelector
                value={toToken}
                tokens={availableTokens}
                onChange={setToToken}
              />
            }
            value={outputFormatted}
            fiatValue={`$${output
              .multipliedBy(priceMap[toToken.toUpperCase()] || 0)
              .toFixed(6)}`}
          />
        </div>

        <Controller
          name="slippage"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2 items-center">
              <span className="text-white/60">Slippage %:</span>
              <Input
                type="text"
                value={field.value}
                onChange={(val) => field.onChange(sanitizeNumericInput(val))}
                className="w-16"
              />
            </div>
          )}
        />

        <div className="space-y-2 pt-2">
          <InfoRow
            label="Conversion Rate"
            value={`1 ${fromToken} = ${rate.toFixed(6)} ${toToken}`}
          />
          <InfoRow
            label="Minimum Received"
            value={`${minReceived.toFixed(6)} ${toToken} ($${minReceived
              .multipliedBy(priceMap[toToken.toUpperCase()] || 0)
              .toFixed(6)})`}
          />
          <InfoRow
            label="Commission"
            value={`$${COMMISSION_FIXED.toFixed(2)}`}
          />
          <InfoRow
            label="Fee (0.3%)"
            value={`${feeAmount.toFixed(6)} ${toToken} ($${feeAmount
              .multipliedBy(priceMap[toToken.toUpperCase()] || 0)
              .toFixed(6)})`}
          />
          <InfoRow
            label="Total Expected After Fees"
            value={`${totalExpectedAfterFees.toFixed(
              6
            )} ${toToken} ($${totalExpectedAfterFees
              .multipliedBy(priceMap[toToken.toUpperCase()] || 0)
              .toFixed(6)})`}
          />
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={
            !fromAmount || Number(fromAmount) <= 0 || !fromToken || !toToken
          }
          className={`
            w-full py-3 text-white font-semibold rounded-xl
            bg-gradient-to-r from-blue-600 to-blue-400
            hover:from-blue-700 hover:to-blue-500
            active:brightness-110 transition
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          Confirm Swap
        </Button>
      </Card>
    </>
  );
}
