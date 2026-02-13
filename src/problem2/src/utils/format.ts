export const convertAmount = (
  amount: number,
  fromPrice: number,
  toPrice: number
): number | null => {
  if (!fromPrice || !toPrice || toPrice === 0) return null;
  return (Number(amount) * fromPrice) / toPrice;
};

export const formatDisplayAmount = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  if (value === 0) return '0';
  const formatted = Number(value).toLocaleString('en-US', {
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
  });
  return formatted.replace(/\.?0+$/, '') || '0';
};

/** Returns exchange rate string: "1 FROM ≈ X TO" */
export const getRateLabel = (
  fromSymbol: string,
  toSymbol: string,
  fromPrice: number,
  toPrice: number
): string => {
  if (!toPrice) return '';
  const rate = fromPrice / toPrice;
  const formatted = rate >= 1e6 ? rate.toExponential(2) : formatDisplayAmount(rate) || '0';
  return `1 ${fromSymbol} ≈ ${formatted} ${toSymbol}`;
};

/** Format relative time (e.g. "Updated 2 min ago") */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return 'Updated just now';
  if (sec < 3600) return `Updated ${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `Updated ${Math.floor(sec / 3600)} hr ago`;
  return `Updated ${Math.floor(sec / 86400)} day(s) ago`;
};
