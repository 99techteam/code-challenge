import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

export function CurrencyInput(props: {
  className?: string;
  value?: number;
  onChange: (value: number) => void;
}) {
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    let value = input.valueAsNumber;
    
    // Handle NaN or invalid numbers
    if (Number.isNaN(value) || value < 0) {
      value = 0;
    }
    
    // Limit to reasonable precision (8 decimal places)
    if (value > 0) {
      value = Math.round(value * 100000000) / 100000000;
    }
    
    // Limit maximum value to prevent overflow
    if (value > 1000000000) {
      value = 1000000000;
    }
    
    props.onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent negative numbers and certain characters
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  return (
    <Input
      className={cn(
        "text-xl shadow-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
        props.className
      )}
      type="number"
      min={0}
      max={1000000000}
      step="any"
      placeholder="Amount"
      value={props.value || ""}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  );
}
