import { Currency } from "@/types";
import CurrencyLogo from "../CurrencyLogo";

export type CurrencyOptionProps = {
  currency: Currency;
};

export default function CurrencyOption(props: CurrencyOptionProps) {
  const { currency } = props;
  return (
    <div className="flex gap-3">
      <CurrencyLogo currencyCode={currency.currency} />
      <div>{currency.currency}</div>
    </div>
  );
}
