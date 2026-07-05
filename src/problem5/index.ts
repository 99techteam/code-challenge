import express from 'express';
import { problem5Router } from './router';
import { container } from './container';
import { logger } from './logger';
import { config } from './config';

const createApp = (): express.Express => {
  const app = express();

  app.get('/health/liveness', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/readiness', async (_req, res) => {
    const isHealthy = await container.healthCheck();
    if (isHealthy) {
      res.json({ status: 'ok' });
    } else {
      res.status(503).json({ status: 'error', message: 'Database unavailable' });
    }
  });

  app.use('/v1/products', problem5Router);

  return app;
};

const startServer = async (): Promise<void> => {
  try {
    await container.init();

    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info({ port: config.port }, 'Server started');
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Received shutdown signal');

      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await container.shutdown();
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, config.shutdownTimeoutMs);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error({ reason }, 'Unhandled Rejection');
    });

    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught Exception');
      process.exit(1);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

export { createApp, startServer, container, problem5Router, config, logger };
export type { Product, CreateProductInput, UpdateProductInput, ProductFilter } from './model/product';
export type { ProductDTO, ProductListDTO } from './dto/product-dto';
export type { IProductRepository } from './repository/interfaces';
export type { IProductService } from './service/interfaces';
export { AppError, ValidationError, NotFoundError, ConflictError } from './model/errors';

startServer();
