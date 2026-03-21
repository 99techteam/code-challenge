import 'reflect-metadata';
import express from 'express';
import { rootRouter } from './routes';
import { errorMiddleware } from './common/middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', rootRouter);

  app.use(errorMiddleware);

  return app;
}
