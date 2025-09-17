import { Router } from 'express';
import itemRoutes from './item.routes';

const router = Router();

// Mount item routes
router.use('/items', itemRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;