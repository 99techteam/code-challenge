import { useState, useRef, useEffect } from "react";
import type { Token } from "@models/token";
import SelectButton from "./SelectButton";
import { TOKEN_ICON_URL } from "@constants/constants";

type Props = {
  tokens: Token[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
};

export default function CurrencySelect({ tokens, value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = tokens.find((t) => t.currency === value);

  return (
    <div className="flex flex-col relative" ref={ref}>
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <SelectButton
        onClick={() => setOpen((v) => !v)}
        aria-label={label ?? "Select token"}
        open={open}
        icon={
          selected && (
            <img
              src={`${TOKEN_ICON_URL}${selected.currency}.svg`}
              alt={selected.currency}
              className="w-5 h-5"
            />
          )
        }
      >
        {selected && <span>{selected.currency}</span>}
      </SelectButton>
      {open && (
        <div
          className="absolute z-10 mt-10 w-full bg-white border rounded shadow"
          style={{ maxHeight: 240, overflowY: "auto" }}
        >
          {tokens.map((t) => (
            <button
              key={t.currency}
              type="button"
              className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-100 ${
                t.currency === value ? "bg-slate-100" : ""
              }`}
              onClick={() => {
                onChange(t.currency);
                setOpen(false);
              }}
            >
              <img
                src={`./assets/icons/${t.currency}.svg`}
                alt={t.currency}
                className="w-5 h-5"
              />
              <span>{t.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}