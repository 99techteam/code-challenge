import express from 'express';
import resourceRoutes from './routes/resource.routes';
import { setupSwagger } from './swagger';
import { initializeDatabase } from './databases';

const boostrap = async () => {
  // 1. Initialize the database FIRST.
  // This will create the database.sqlite file and the resources table on first run.
  await initializeDatabase();

  // 2. Setup Express App
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  setupSwagger(app);
  app.use('/api/resources', resourceRoutes);

  // 3. Start the server only after the database is ready.
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
};

// Execute the boostrap function
boostrap().catch((error) => {
  console.error('Error starting the server:', error);
});
