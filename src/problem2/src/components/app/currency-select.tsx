import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import type { Currency } from "../../types";

export function CurrencySelect(props: {
  className?: string;
  data: Currency[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select onValueChange={props.onChange} value={props.value}>
      <SelectTrigger
        className={cn(
          props.className,
          "shadow-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
        )}
      >
        <SelectValue placeholder="Select a currency" />
      </SelectTrigger>
      <SelectContent>
        {props.data.map((currency) => (
          <SelectItem value={currency.currency} key={currency.currency}>
            <img
              src={"tokens/" + currency.currency.toUpperCase() + ".SVG"}
              width="20"
              height="20"
              alt={currency.currency}
            />
            {currency.currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
