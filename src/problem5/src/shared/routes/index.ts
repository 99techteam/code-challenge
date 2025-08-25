import { Application, NextFunction, Request, Response } from 'express';
import ApiRoute from '@shared/routes/api';
import { authMiddleware } from '../middleware/auth.middleware';

const routes = (server: Application): void => {
  server.use('/api', authMiddleware, ApiRoute.router);
  server.all('/health', (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json('ok');
  });
};

export default routes;
