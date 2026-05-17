import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX = 200;

const envInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const createRateLimiter = (): RateLimitRequestHandler =>
  rateLimit({
    windowMs: envInt("RATE_LIMIT_WINDOW_MS", DEFAULT_WINDOW_MS),
    limit: envInt("RATE_LIMIT_MAX", DEFAULT_MAX),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too Many Requests" },
  });
