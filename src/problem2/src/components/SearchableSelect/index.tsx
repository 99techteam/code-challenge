import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  FC,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import "./styles.css";

interface OptionType {
  label: string | ReactNode;
  value: string;
}

interface SearchableSelectProps {
  options: OptionType[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  onOpenChange?: (isOpen: boolean) => void;
  zIndex?: number;
}

const SearchableSelect: FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  isClearable = true,
  isSearchable = true,
  disabled = false,
  "aria-label": ariaLabel,
  onOpenChange,
  zIndex = 100,
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [dropdownPlacement, setDropdownPlacement] = useState<"bottom" | "top">(
    "bottom",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredOptions = options.filter((option) =>
    option.value.toString().toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleSelectChange = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchValue("");
    setHighlightedIndex(-1);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setHighlightedIndex(0);
  };

  const handleClear = () => {
    setSearchValue("");
    onChange("");
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onOpenChange?.(newIsOpen);
    if (newIsOpen && isSearchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelectChange(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchValue("");
        break;
    }
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onOpenChange?.(false);
        setSearchValue("");
      }
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  // Auto adjust dropdown placement based on available space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 300; // Approximate max dropdown height
      const spaceBelow = window.innerHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;

      // If not enough space below but more space above, place on top
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPlacement("top");
      } else {
        setDropdownPlacement("bottom");
      }
    }
  }, [isOpen]);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div
      ref={containerRef}
      className={`select-container ${isOpen ? "is-open" : ""}`}
      style={{ zIndex: isOpen ? 10000 : zIndex }}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
    >
      {isClearable && value && !disabled && (
        <button
          onClick={handleClear}
          className="clear-button"
          aria-label="Clear selection"
          type="button"
        >
          ×
        </button>
      )}
      <div className="select-wrapper">
        <button
          onClick={handleToggle}
          className="dropdown-btn"
          disabled={disabled}
          aria-label={ariaLabel || "Select option"}
          type="button"
        >
          <span>{selectedLabel || placeholder}</span>
          <span style={{ fontSize: "12px", opacity: 0.6 }}>▼</span>
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className={`dropdown ${dropdownPlacement}`}
            role="listbox"
          >
            {isSearchable && (
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="search-dropdown"
                placeholder="Search..."
                aria-label="Search options"
              />
            )}

            <div className="options-list">
              {filteredOptions.length === 0 ? (
                <div className="no-options">No options found</div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    ref={(el) => (optionRefs.current[index] = el)}
                    onClick={() => handleSelectChange(option.value)}
                    className={`option-item ${
                      value === option.value ? "selected" : ""
                    } ${highlightedIndex === index ? "highlighted" : ""}`}
                    role="option"
                    aria-selected={value === option.value}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectChange(option.value);
                      }
                    }}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;
