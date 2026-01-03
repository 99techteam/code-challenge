import { Request, Response, NextFunction } from 'express';

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, password, email } = req.body;

  if (
    !username ||
    typeof username !== 'string' ||
    username.trim().length === 0
  ) {
    res
      .status(400)
      .json({ error: 'Username is required and must be a non-empty string' });
    return;
  }

  if (username.length < 3 || username.length > 20) {
    res
      .status(400)
      .json({ error: 'Username must be between 3 and 20 characters' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res
      .status(400)
      .json({
        error: 'Password is required and must be at least 6 characters',
      });
    return;
  }

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  next();
};

export const validateScoreUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { increment } = req.body;

  if (increment === undefined || increment === null) {
    res.status(400).json({ error: 'Increment value is required' });
    return;
  }

  if (typeof increment !== 'number') {
    res.status(400).json({ error: 'Increment must be a number' });
    return;
  }

  if (increment <= 0) {
    res.status(400).json({ error: 'Increment must be a positive number' });
    return;
  }

  if (increment > 1000) {
    res.status(400).json({ error: 'Increment cannot exceed 1000 per request' });
    return;
  }

  next();
};
