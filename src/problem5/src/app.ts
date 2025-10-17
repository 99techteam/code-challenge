// src/app.ts
import express, { Application } from 'express';
import resourceRoutes from './routes/resourceRoutes';
import errorHandler from './utils/errorHandler';
import { setupSwagger } from './config/swagger';

const app: Application = express();

app.use(express.json());


// Setup Swagger UI
setupSwagger(app as any);

// Routes
app.use('/api/resources', resourceRoutes);

// Global error handler
app.use(errorHandler);

export default app;