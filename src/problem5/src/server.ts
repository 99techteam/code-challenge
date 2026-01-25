import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import resourceRoutes from './routes/resources';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CRUD API Documentation',
}));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CRUD API Server',
    version: '1.0.0',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      'GET /api/resources': 'List all resources (with optional filters)',
      'GET /api/resources/:id': 'Get resource by ID',
      'POST /api/resources': 'Create a new resource',
      'PUT /api/resources/:id': 'Update a resource',
      'DELETE /api/resources/:id': 'Delete a resource'
    }
  });
});

app.use('/api/resources', resourceRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
