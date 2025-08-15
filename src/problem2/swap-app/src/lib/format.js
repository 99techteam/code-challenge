export const fmt = (n) =>
  Number(n).toFixed(6).replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");

export const validateAmount = (raw) => {
  if (!raw.trim()) return { ok: false, msg: "Please enter an amount." };
  const n = Number(raw);
  if (!isFinite(n)) return { ok: false, msg: "Amount must be a number." };
  if (n <= 0) return { ok: false, msg: "Amount must be greater than 0." };
  if (n > Number.MAX_SAFE_INTEGER)
    return { ok: false, msg: "Amount is too large." };
  return { ok: true, value: n };
};
