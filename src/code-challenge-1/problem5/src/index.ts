import express, { Request, Response, NextFunction } from 'express';
import { initDb } from './db';
import resourcesRouter from './resources.router';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/resources', resourcesRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not found' });
});

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

// initialise DB then start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('failed to initialise database:', err);
    process.exit(1);
  });

export default app;
