import { Router } from 'express';
import { resourceRouter } from '../modules/resource/resource.routes';

export const rootRouter = Router();

rootRouter.use('/resources', resourceRouter);
