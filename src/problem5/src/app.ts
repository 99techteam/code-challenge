import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import itemRoutes from './items/routes';
import './db/connection';

export function buildApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'CRUD API Server is running',
      version: '1.0.0',
      endpoints: {
        health: 'GET /',
        createResource: 'POST /api/resources',
        listResources: 'GET /api/resources',
        getResource: 'GET /api/resources/:id',
        updateResource: 'PUT /api/resources/:id',
        deleteResource: 'DELETE /api/resources/:id'
      }
    });
  });

  app.use('/api', itemRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('unhandled:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message
    });
  });

  return app;
}

const app = buildApp();
export default app;
