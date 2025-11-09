import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import resourceRoutes from './routes/resourceRoutes';
import './database'; // Initialize database

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
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

// API routes
app.use('/api', resourceRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 CRUD API Server Started Successfully            ║
║                                                       ║
║   📡 Server: http://localhost:${PORT}                   ║
║   🔧 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   📚 API Docs: http://localhost:${PORT}/                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
