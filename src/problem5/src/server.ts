import app from './app';
import config from './config/config';
import logger from './lib/logger';

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server running on port ${config.port}`);
});
