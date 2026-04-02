import { MAX_DECIMALS, MAX_INPUT_LENGTH, MAX_INPUT_VALUE } from "./constants";

const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
    ...options,
  }).format(value);
};

const formatUsd = (value: number): string => {
  if (!Number.isFinite(value)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatTokenAmount = (value: number): string => {
  if (!Number.isFinite(value) || value === 0) return "0";

  const absValue = Math.abs(value);

  if (absValue >= 1000) {
    return formatNumber(value, { maximumFractionDigits: 2 });
  }

  if (absValue >= 1) {
    return formatNumber(value, { maximumFractionDigits: 4 });
  }

  if (absValue >= 0.0001) {
    return formatNumber(value, { maximumFractionDigits: 6 });
  }

  if (absValue > 0 && absValue < 0.000001) {
    return "< 0.000001";
  }

  return formatNumber(value, { maximumFractionDigits: 8 });
};

const formatRate = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return "0";

  if (value >= 1) {
    return formatNumber(value, { maximumFractionDigits: 4 });
  }

  return formatNumber(value, { maximumFractionDigits: 8 });
};

const sanitizeNumericInput = (input: string): string => {
  let value = input.replace(/[^\d.]/g, "");

  const firstDotIndex = value.indexOf(".");
  if (firstDotIndex !== -1) {
    const integerPart = value.slice(0, firstDotIndex + 1);
    const decimalPart = value
      .slice(firstDotIndex + 1)
      .replace(/\./g, "")
      .slice(0, MAX_DECIMALS);

    value = integerPart + decimalPart;
  }

  if (value.startsWith(".")) {
    value = `0${value}`;
  }

  const parts = value.split(".");
  let integerPart = parts[0] ?? "";
  const decimalPart = parts[1];

  if (integerPart.length > 1) {
    integerPart = integerPart.replace(/^0+(\d)/, "$1");
    if (integerPart === "") integerPart = "0";
  }

  value =
    decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;

  if (value.length > MAX_INPUT_LENGTH) {
    value = value.slice(0, MAX_INPUT_LENGTH);
  }

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue) && numericValue > MAX_INPUT_VALUE) {
    value = String(MAX_INPUT_VALUE);
  }

  return value;
};

export {
  formatNumber,
  formatUsd,
  formatTokenAmount,
  formatRate,
  sanitizeNumericInput,
};
