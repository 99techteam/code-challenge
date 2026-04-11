import express, { Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth';
import campaignsRouter from './routes/campaigns';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

// CORS for local dev
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);
app.use('/campaigns', campaignsRouter);

// 404
app.use((_req: Request, res: Response) => res.status(404).json({ error: 'not found' }));

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`api running on http://localhost:${PORT}`));
}

export default app;
