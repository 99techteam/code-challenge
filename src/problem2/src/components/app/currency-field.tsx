import type { Currency, CurrencyPrice } from "../../types";
import { CurrencyInput } from "./currency-input";
import { CurrencySelect } from "./currency-select";
import { Separator } from "../ui/separator";

export function CurrencyField(props: {
  className?: string;
  initData: Currency[];
  currency: string;
  amount: number;
  onChange: (payload: CurrencyPrice) => void;
}) {
  const { currency, amount, initData } = props;

  const handleCurrencyChange = (newCurrency: string) => {
    const price = initData.find((c) => c.currency === newCurrency)?.price ?? 0;
    props.onChange({
      currency: newCurrency,
      amount: amount,
      price: price,
    });
  };

  const handleAmountChange = (newAmount: number) => {
    const price = initData.find((c) => c.currency === currency)?.price ?? 0;
    props.onChange({
      currency: currency,
      amount: newAmount,
      price: price,
    });
  };

  return (
    <div className="border-2 flex h-12 rounded-md items-center w-full ">
      <CurrencySelect
        className="w-60"
        data={props.initData}
        value={currency}
        onChange={handleCurrencyChange}
      />
      <Separator orientation="vertical" />
      <CurrencyInput
        value={amount > 0 ? amount : undefined}
        onChange={handleAmountChange}
      />
    </div>
  );
}
