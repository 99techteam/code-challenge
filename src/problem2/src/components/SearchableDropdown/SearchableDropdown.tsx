import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";

type DropdownOption = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  ariaLabel: string;
  value: string;
  options: DropdownOption[];
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  noResultsText?: string;
  className?: string;
};

export function SearchableDropdown({
  className,
  id,
  ariaLabel,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "",
  leftIcon,
  rightIcon,
  noResultsText = "No options found",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listboxId = `${id}-listbox`;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    setQuery(selectedOption?.label ?? value);
  }, [selectedOption, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(selectedOption?.label ?? value);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, selectedOption, value]);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }
    return options.filter((option) =>
      `${option.label} ${option.value}`.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  const selectOption = (nextValue: string) => {
    const nextOption = options.find((option) => option.value === nextValue);
    onChange(nextValue);
    setQuery(nextOption?.label ?? nextValue);
    setIsOpen(false);
  };

  return (
    <div
      className={className ? `relative ${className}` : "relative"}
      ref={rootRef}
    >
      {leftIcon ? (
        <span className="pointer-events-none absolute left-[0.72rem] top-1/2 z-[2] -translate-y-1/2">
          {leftIcon}
        </span>
      ) : null}
      <Input
        variant="combobox"
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsOpen(true)}
        className={
          isOpen ?
            "border-indigo-300 ring-4 ring-indigo-500/12 dark:border-indigo-400 dark:ring-indigo-400/25"
          : ""
        }
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
          setIsOpen(true);

          const exactMatch = options.find(
            (option) => option.value === nextValue || option.label === nextValue,
          );
          if (exactMatch) {
            onChange(exactMatch.value);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            setQuery(selectedOption?.label ?? value);
          }
          if (event.key === "Enter" && filteredOptions.length > 0) {
            event.preventDefault();
            selectOption(filteredOptions[0].value);
          }
        }}
      />
      <Button
        variant="dropdownTrigger"
        disabled={disabled}
        aria-label={`Toggle ${ariaLabel} dropdown`}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        {rightIcon ?? "▾"}
      </Button>

      {isOpen ? (
        <ul
          className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-[5] m-0 max-h-[220px] list-none gap-0.5 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200/95 bg-white p-1.5 shadow-dropdown backdrop-blur-xl dark:border-slate-600 dark:bg-slate-950 dark:backdrop-blur-2xl"
          id={listboxId}
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <Button
                  variant="listItem"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option.value)}
                >
                  {option.label}
                </Button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-[0.82rem] font-medium text-slate-500 dark:text-slate-400">{noResultsText}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
