import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { env } from '@/config/env.config';

const corsOptions: cors.CorsOptions = {
  origin: env.CORS_ORIGIN_LIST,
  credentials: true,
};

const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

export function applySecurityMiddleware(app: Express): void {
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(rateLimiter);
}
