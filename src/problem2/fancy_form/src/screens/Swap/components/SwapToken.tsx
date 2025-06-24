import { Input } from "@/components/ui/input";
import ModalToken from "./ModalToken";
import { Controller } from "react-hook-form";
interface SwapInputProps {
  title: "From" | "To";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  name: "fromAmount" | "toAmount";
  onFocus: () => void;
}
const SwapInput: React.FC<SwapInputProps> = ({
  title,
  control,
  name,
  onFocus,
}) => {
  return (
    <div className="flex-col justify-between gap-2 mt-1 bg-input px-4 py-5 rounded-md shadow-xs">
      <div className="flex items-center justify-between w-full">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              type="text"
              placeholder="0.0"
              className="flex-1 h-7"
              value={field.value}
              onFocus={onFocus}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and decimal point
                if (/^\d*\.?\d*$/.test(value)) {
                  field.onChange(value);
                }
              }}
            />
          )}
        />
        <ModalToken title={title} />
      </div>
    </div>
  );
};
export default SwapInput;
