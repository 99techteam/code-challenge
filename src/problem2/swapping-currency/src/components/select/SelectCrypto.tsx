import { Crypto } from "@/types/crypto";
import React, { useState, useRef, useEffect } from "react";
import Button from "../button/Button";
import './index.scss';

interface SelectCryptoProps {
  data: Crypto[];
  defaultValue?: Crypto;
  onChange?: (value: Crypto) => void;
  title?: string;
}

const SelectCrypto: React.FC<SelectCryptoProps> = ({
  data,
  defaultValue,
  onChange,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Crypto | null>(
    data.find((item) => item.currency === defaultValue?.currency) || null
  );
  const selectRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (item: Crypto) => {
    setSelectedItem(item);
    setIsOpen(false);
    if (onChange) {
      onChange(item); // Trả về toàn bộ đối tượng được chọn
    }
  };

  // Hàm để lấy icon dựa trên tên, trả về thẻ img với src được tạo động
  const getCryptoIcon = (name: string): React.ReactNode => {
    const iconPath = `/assets/crypto-icons/${name}.svg`;
    return (
      <div className="rounded-full w-[25px] h-[25px] flex justify-center items-center m-auto overflow-hidden">
        <img
          src={iconPath}
          alt={name}
          className="max-w-[25px] max-h-[25px]"
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <div className="relative" ref={selectRef}>
      {title && <div className="text-grey-60 text-body-2xs mb-2">{title}</div>}
      <Button
        type="button"
        className="flex items-center justify-between px-4 py-2 bg-transparent border border-grey-100 rounded-md shadow-sm focus:outline-none w-[165px]"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-start gap-2 text-white">
          <span>
            {getCryptoIcon(
              selectedItem ? selectedItem.currency : defaultValue?.currency
            )}
          </span>
          <span>
            {selectedItem ? selectedItem.currency : defaultValue?.currency}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-blue-100 border border-grey-100 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {data.length > 0 ? (
            data.map((item) => (
              <Button
                key={item.currency}
                type="button"
                className={`flex gap-2 w-full p-2 bg-blue-100 focus:outline-none hover:bg-blue-80 text-white items-center justify-start ${
                  selectedItem?.currency === item.currency && "active-button"
                }`}
                onClick={() => handleSelect(item)}
              >
                <span>{getCryptoIcon(item.currency)}</span>
                <span>{item.currency}</span>
              </Button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No data</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectCrypto;
