import { Pool } from 'pg';
import { ProductRepository } from './repository/product-repository';
import { ProductService } from './service/product-service';
import { ProductController } from './controller/product-controller';
import { IProductRepository } from './repository/interfaces';
import { IProductService } from './service/interfaces';
import { createDatabase, migrate, closeDatabase, checkDatabaseHealth } from './repository/database';
import { logger } from './logger';

class Container {
  private pool: Pool | null = null;
  private repository: IProductRepository | null = null;
  private service: IProductService | null = null;
  private controller: ProductController | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInit();
    await this.initPromise;
  }

  private async doInit(): Promise<void> {
    try {
      this.pool = await createDatabase();
      await migrate(this.pool);
      this.repository = new ProductRepository(this.pool);
      this.service = new ProductService(this.repository);
      this.controller = new ProductController(this.service);
      this.initialized = true;

      logger.info('Application container initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize container');
      this.initPromise = null;
      throw error;
    }
  }

  getController(): ProductController {
    if (!this.controller) {
      throw new Error('Container not initialized. Call init() first.');
    }
    return this.controller;
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Container not initialized. Call init() first.');
    }
    return this.pool;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.pool) return false;
    return checkDatabaseHealth(this.pool);
  }

  async shutdown(): Promise<void> {
    if (!this.initialized || !this.pool) return;

    logger.info('Shutting down application container...');
    await closeDatabase(this.pool);
    this.pool = null;
    this.repository = null;
    this.service = null;
    this.controller = null;
    this.initialized = false;
    this.initPromise = null;
  }
}

export const container = new Container();
