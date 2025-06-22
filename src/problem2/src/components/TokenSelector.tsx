import React, { useEffect, useMemo, useRef, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

interface DropdownOption {
  value: string;
  label: string;
  logo?: string;
  id?: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  inputClassName?: string;
  error?: string;
}

const TokenSelector: React.FC<DropdownProps> = ({
  label = "Select",
  options,
  selectedValue,
  onChange,
  placeholder = "Type to search...",
  containerClassName = "",
  inputClassName = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const filtered = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  const handleOptionClick = (value: string) => {
    onChange(value);
    setIsExpanded(false);
    setSearch("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative  ${containerClassName}`}>
      {!isExpanded ? (
        <div
          className={`flex flex-col h-[84px] rounded-lg border border-solid border-gray-250 bg-white px-4 py-2 text-2xl font-semibold hover:bg-[#f7f8f9] cursor-pointer ${inputClassName}`}
          onClick={() => setIsExpanded(true)}
        >
          <label className="text-sm w-fit font-normal text-[#636e82]">
            {label}
          </label>

          <div className="flex grow items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedOption?.logo && (
                <img
                  src={selectedOption.logo}
                  alt=""
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-xl font-semibold text-black">
                {selectedOption?.label}
              </span>
            </div>
            <ArrowDropDownIcon className="text-gray-400 text-lg" />
          </div>
        </div>
      ) : (
        <div className={`flex flex-col`}>
          <div className=" h-[84px] rounded-lg border border-solid border-gray-250 bg-white px-4 py-2 text-2xl font-semibold hover:bg-[#f7f8f9]">
            <div
              className={`flex items-center whitespace-nowrap w-full h-full text-black ${inputClassName}`}
            >
              <input
                className="m-0 w-full bg-transparent p-0 text-inherit outline-none appearance-none focus:outline-none text-[16px]"
                type="text"
                autoComplete="off"
                placeholder={placeholder}
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {filtered.length > 0 && (
            <ul className="absolute top-full left-0 z-50 mt-[-15px] w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl custom-scroll">
              {filtered.map((opt) => (
                <li
                  key={opt.id}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleOptionClick(opt.value)}
                >
                  <img
                    src={opt.logo}
                    alt={opt.value}
                    className="w-5 h-5 rounded-full"
                  />

                  <span className="text-sm text-gray-800">{opt.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
