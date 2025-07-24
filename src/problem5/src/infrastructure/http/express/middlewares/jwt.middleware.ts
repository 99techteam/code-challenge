import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { logger } from '@/infrastructure/logging/logger';
import { env } from '@/config/env.config';

const JWT_SECRET = env.JWT_SECRET;

export function authenticateJWT(req: Request, res: Response, next: NextFunction): Response | void {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload as { id: string; role: string; scopes: string[] };
    next();
  } catch (err) {
    logger.warn('Invalid JWT token', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
