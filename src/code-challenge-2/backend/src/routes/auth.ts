import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { pool } from '../db/pool';
import { registerSchema, loginSchema } from '../validators/auth';

const router = Router();

function zodErr(err: ZodError, res: Response) {
  return res.status(400).json({
    error: 'validation_error',
    details: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
  });
}

// POST /auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [body.email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'email already registered' });
    }

    const hash = await bcrypt.hash(body.password, 10);
    const { rows: [user] } = await pool.query<{ id: string; email: string; name: string; created_at: string }>(`
      INSERT INTO users (email, name, password) VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at
    `, [body.email, body.name, hash]);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET ?? 'dev-secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user });
  } catch (err) {
    if (err instanceof ZodError) return zodErr(err, res);
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    const { rows } = await pool.query<{ id: string; email: string; name: string; password: string }>(`
      SELECT id, email, name, password FROM users WHERE email = $1
    `, [body.email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET ?? 'dev-secret',
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    if (err instanceof ZodError) return zodErr(err, res);
    next(err);
  }
});

export default router;
