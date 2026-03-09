export function validateAmount(value: string): string | null {
  if (value === "" || value == null) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return "Enter a valid number";
  if (num <= 0) return "Amount must be greater than 0";
  return null;
}
