import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/common/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  leftSlot?: React.ReactNode;
}

export interface SelectProps {
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled = false,
  className,
}: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        {/* BUTTON */}
        <Listbox.Button
          className={cn(
            "w-full flex items-center justify-between gap-2 w-[7.5rem]",
            "rounded-xl px-3 py-2",
            "bg-slate-900 border border-slate-700",
            "text-sm text-white",

            // hover
            "hover:bg-slate-800 hover:border-white/20",

            // focus clean (NO browser ring)
            "focus:outline-none focus-visible:outline-none",
            "ring-0 focus:ring-0 focus-visible:ring-0",

            // open state
            "data-[headlessui-state=open]:bg-slate-800",
            "data-[headlessui-state=open]:border-white/20",

            // cursor
            "cursor-pointer",

            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {/* LEFT: ICON + LABEL */}
          <div className="flex items-center gap-2">
            {selectedOption?.leftSlot && (
              <span className="flex h-5 w-5 items-center justify-center flex-shrink-0">
                {selectedOption.leftSlot}
              </span>
            )}

            <span className="truncate leading-none">
              {selectedOption?.label ?? (
                <span className="text-white/50">{placeholder}</span>
              )}
            </span>
          </div>

          {/* RIGHT: CHEVRON */}
          <ChevronDown className="h-5 w-5 text-white/60 flex-shrink-0" />
        </Listbox.Button>

        {/* OPTIONS */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={cn(
              "absolute z-20 mt-1 w-full max-h-60 overflow-auto",
              "rounded-xl border border-slate-700 bg-slate-900",
              "py-1 shadow-lg"
            )}
          >
            {options.map((opt) => (
              <Listbox.Option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={({ active, disabled }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2",
                    "text-sm text-white",
                    "select-none transition-colors",

                    !disabled && "cursor-pointer",
                    active && !disabled && "bg-slate-700",
                    disabled && "opacity-50 cursor-not-allowed"
                  )
                }
              >
                {({ selected }) => (
                  <>
                    {opt.leftSlot && (
                      <span className="flex h-5 w-5 items-center justify-center flex-shrink-0">
                        {opt.leftSlot}
                      </span>
                    )}

                    <span
                      className={cn(
                        "truncate leading-none",
                        selected && "font-semibold"
                      )}
                    >
                      {opt.label}
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
