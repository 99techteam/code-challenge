"use client";
import {
  ArrowUpDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Separator } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CurrencySelectComponent from "./currency-select-component";
import FormInputContainer from "@/components/reusable/form-input-container";
import { useCurrencySwap } from "../use-currency-swap";
const CurrencySwapForm = () => {
  const {
    control,
    errors,
    isValid,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    exchangeRate,
    handleFromAmountChange,
    handleSwapCurrencies,
    handleSubmit,
    isPending,
    error,
    isSuccess,
  } = useCurrencySwap();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* From Currency Section */}
      <div className="space-y-3">
        <FormInputContainer
          control={control}
          errors={errors}
          name="fromCurrency"
          label="From"
          vertialAlign
          render={({ field }) => (
            <CurrencySelectComponent
              value={fromCurrency}
              onChange={field.onChange}
            />
          )}
        />
        <FormInputContainer
          control={control}
          errors={errors}
          name="fromAmount"
          label=""
          vertialAlign
          render={({ field }) => (
            <Input
              id="from-amount"
              type="number"
              disabled={!fromCurrency || !toCurrency}
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => {
                field.onChange(e);
                handleFromAmountChange(e);
              }}
              className="h-12 text-lg pl-8 pr-4"
              step="0.01"
              min="0"
            />
          )}
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSwapCurrencies}
          className="rounded-full h-10 w-10 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* To Currency Section */}
      <div className="space-y-3">
        <FormInputContainer
          control={control}
          errors={errors}
          name="toCurrency"
          label="To"
          vertialAlign
          render={({ field }) => (
            <CurrencySelectComponent
              value={toCurrency}
              onChange={field.onChange}
            />
          )}
        />

        <Input
          id="to-amount"
          type="number"
          placeholder="0.00"
          value={toAmount}
          readOnly
          className="h-12 text-lg pl-8 pr-4 bg-gray-50"
        />
      </div>

      {/* Exchange Rate Display */}
      {fromCurrency !== toCurrency && exchangeRate > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Exchange Rate
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              1 {fromCurrency.split("-")[0]} = {exchangeRate.toFixed(4)}{" "}
              {toCurrency.split("-")[0]}
            </Badge>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 stroke-green-600" />
          <AlertDescription className="text-green-800">
            Swap completed successfully! Your transaction is being processed.
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        disabled={isPending || !isValid}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Swap...
          </>
        ) : (
          `Swap `
        )}
      </Button>
    </form>
  );
};

export default CurrencySwapForm;
