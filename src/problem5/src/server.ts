import { AppDataSource } from './config/database';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './common/utils/logger';

AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected');
    const app = createApp();
    app.listen(env.port, () => {
      logger.info(`Server running on http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to database', err);
    process.exit(1);
  });
