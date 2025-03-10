import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Currency } from "@/types";
import CurrencyOption from "../CurrentOption";

export type Option = {
  label: ReactNode;
  value: string;
};

export type CustomSelectProps = {
  value: string | null;
  placeholder?: string;
  currencies: Currency[];
  onChange: (value: string) => void;
};

export default function CurrenciesSelect(props: CustomSelectProps) {
  const { value, onChange, placeholder, currencies } = props;
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");

  const handleSearchValueChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const filteredCurrencies = useMemo(
    () =>
      currencies.filter((c) =>
        c.currency?.toLowerCase()?.includes(searchValue?.toLowerCase())
      ) || [],
    [currencies, searchValue]
  );

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.id === value),
    [currencies, value]
  );

  useEffect(() => {
    if (open) {
      setSearchValue("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCurrency ? (
            <CurrencyOption currency={selectedCurrency} />
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            className="h-9"
            onValueChange={handleSearchValueChange}
            onSeeking={(e) => console.log({ e })}
          />

          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            {filteredCurrencies.map((currency) => (
              <CommandItem
                key={currency.id}
                value={currency.id}
                onSelect={(currentValue: string) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <CurrencyOption currency={currency} />
                <Check
                  className={cn(
                    "ml-auto",
                    value === currency.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
