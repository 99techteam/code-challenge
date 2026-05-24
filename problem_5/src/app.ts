import express, { NextFunction, Request, Response } from 'express';
import { HttpException } from './exceptions/http.exception';
import { prisma } from './prisma';
import { createResourceRouter } from './routes/resource.routes';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', async (_req: Request, res: Response) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  });

  // Root route: simple service summary
  app.get('/', (_req: Request, res: Response) => {
    return res.json({ ok: true, service: 'resource-service', routes: ['/health', '/resources'] });
  });

  app.use('/resources', createResourceRouter());

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        error: error.message,
        ...(error.details ? { details: error.details } : {})
      });
    }
    // log full error server-side but only return generic message to clients
    // in production NODE_ENV should be 'production'
    // show details only in non-production environments
    // eslint-disable-next-line no-console
    console.error('Unexpected error:', error);
    const showDetails = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      error: 'internal server error',
      ...(showDetails ? { details: String(error) } : {})
    });
  });

  return app;
}
