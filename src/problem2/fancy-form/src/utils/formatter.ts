export const formatNumber = (n: number, decimals = 6) => {
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: decimals })
    : "-";
};
