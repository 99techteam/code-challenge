import { Router } from 'express';
import bookRoutes from './bookRoutes';
import metricsRoutes from './metricsRoutes';

const router = Router();

router.use('/books', bookRoutes);
router.use('/metrics', metricsRoutes);

export default router;
