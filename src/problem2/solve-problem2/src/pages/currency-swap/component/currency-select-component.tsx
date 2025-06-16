import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCurrencyQuery } from "@/query/use-get-currency-query";
import { useMemo } from "react";
import DynamicSVG from "@/components/reusable/svg-component";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// will have a separated reusable component for this with proper infinite scroll pagination when scaling
const CurrencySelectComponent = ({ value, onChange }: Props) => {
  const { data: currencyData } = useGetCurrencyQuery();

  // using memo because the list is long
  const currencyListWithIcon = useMemo(() => {
    return currencyData?.map((currency) => ({
      ...currency,
      icon: currency.currency,
    }));
  }, [currencyData]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 w-full">
        <SelectValue placeholder="Select Currency"></SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencyListWithIcon?.map((currency, index) => (
          <SelectItem
            key={`${currency.currency}-${currency.price}-${index}`}
            value={`${currency.currency}-${currency.price}-${index}`}
          >
            <div className="flex items-center gap-2">
              <DynamicSVG svgName={currency.icon} />
              <span className="font-medium">{currency.currency}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelectComponent;
