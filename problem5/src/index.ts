import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import apiRoute from './routes';
import logger from './utils/logger';
import { connectToDatabase, closeDatabaseConnection } from './lib/db';
import { jsonResponseMiddleware } from './middlewares/json-response.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const port = process.env.PORT || 3005;
const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(jsonResponseMiddleware);

app.use('/api/v1', apiRoute);

app.get('/', (_: Request, res: Response) => {
  res.send('Hello, Express!');
});

app.use(errorMiddleware);

const server = app.listen(port, async () => {
  logger.info(`Server running on port ${port}`);
  
  try {
    await connectToDatabase();
  } catch (error) {
    logger.error('Failed to connect to database during startup');
    process.exit(1);
  }
});

// Graceful shutdown
const shutdown = () => {
  server.close(async () => {
    // close db client
    try {
      await closeDatabaseConnection();
    } catch (error) {
      logger.error('Error closing database connection during shutdown');
    }

    process.exit(0);
  })
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

