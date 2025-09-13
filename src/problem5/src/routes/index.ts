import { Router } from 'express';
import resourceRoutes from './resources';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CRUD API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      resources: {
        create: 'POST /api/resources',
        list: 'GET /api/resources',
        getById: 'GET /api/resources/:id',
        update: 'PUT /api/resources/:id',
        delete: 'DELETE /api/resources/:id',
        stats: 'GET /api/resources/stats'
      }
    }
  });
});

// Resource routes
router.use('/resources', resourceRoutes);

export default router;