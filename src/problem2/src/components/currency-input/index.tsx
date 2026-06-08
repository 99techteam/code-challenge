import { memo, useId, type ChangeEventHandler } from 'react';
import { Label } from '@/components/common/field/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select';
import { InputGroup, InputGroupInput } from '@/components/common/input/input-group';
import type { SelectOption } from '@/types/option';
import { sanitizeNumericInput } from '@/utils/money';

interface CurrencyInputProps {
  label: string;
  placeHolder: string;
  onChangeSelect: (value: string) => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  selectValue: string;
  options: SelectOption[];
  selectError?: string;
  amountError?: string;
}

export const CurrencyInput = memo(function CurrencyInput({
  label,
  placeHolder,
  selectValue,
  value,
  options,
  onChangeSelect,
  onChange,
  selectError,
  amountError,
}: CurrencyInputProps) {
  const id = useId();

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange({ ...e, target: { ...e.target, value: sanitizeNumericInput(e.target.value) } });
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <Select value={selectValue} onValueChange={onChangeSelect}>
          <SelectTrigger
            data-slot="input-group-control"
            className="rounded-md rounded-r-none border-y-0 border-l-0 border-r bg-transparent pr-2 shadow-none focus-visible:ring-0 focus-visible:z-1"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="pr-2 [&_svg]:hidden">
                <span className="flex items-center gap-2">
                  <div className="size-4">
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="size-4 shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <InputGroupInput
          id={id}
          className="h-full pl-3"
          placeholder={placeHolder}
          value={value}
          onChange={handleChange}
          type="text"
        />
      </InputGroup>
      {(selectError || amountError) && (
        <p className="text-sm text-red-500">{selectError ?? amountError}</p>
      )}
    </div>
  );
});
