import { useEffect, useRef, useState } from "react";
import "./CurrencySelector.css";
import { currencies, type Currency } from "../../constans/currency";

export default function CurrencySelector({
  selected,
  onChange,
}: {
  selected: Currency;
  onChange: (currency: Currency) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = currencies.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="currency-selector" ref={wrapperRef}>
      <button className="selected-currency" onClick={() => setOpen(!open)}>
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <span className="arrow">▾</span>
      </button>

      {open && (
        <div className="dropdown">
          <input
            type="text"
            placeholder="Type a currency / country"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="currency-list">
            {filtered.map((c) => (
              <div
                key={c.code}
                className={`currency-option ${
                  c.code === selected.code ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <span>{c.flag}</span>
                <div className="currency-details">
                  <strong>{c.code}</strong>
                </div>
                {c.code === selected.code && <span className="check">✔</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
