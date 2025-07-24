import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

import { logger } from '@/infrastructure/logging/logger';
import { env } from '@/config/env.config';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Timeout')), ms);
    promise
      .then((res) => {
        clearTimeout(id);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err instanceof Error ? err : new Error(String(err)));
      });
  });
}

export class RedisCache {
  private readonly client: RedisClientType;
  private connected = false;

  constructor() {
    this.client = createClient({
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: false,
      },
    });

    this.client.on('error', (err) => {
      if (this.client.isOpen) {
        logger.error('❌ Redis connection error:', err);
      }
    });

    this.client.on('connect', () => {
      this.connected = true;
      logger.info('✅ Redis connected.');
    });
  }

  async connectWithRetry(retries = 3, timeout = 5000) {
    let delay = 1000;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await withTimeout(this.client.connect(), timeout);
        return;
      } catch (err) {
        logger.error(`❌ Redis connection attempt ${attempt} failed:`, err);
        if (attempt === retries) {
          logger.error('❌ Max retries reached. Continuing without Redis.');

          try {
            await this.client.quit();
          } catch (quitErr) {
            logger.warn('⚠️ Redis quit failed after retries:', quitErr);
          }

          this.client.removeAllListeners();
          return;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
  }

  async get(key: string) {
    if (!this.connected) {
      logger.warn(`⚠️ Redis GET skipped for key: ${key}, client not connected.`);
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (err) {
      logger.error(`❌ Redis GET failed for key: ${key}`, err);
      return null;
    }
  }

  async set(key: string, value: string, ttlInSeconds: number) {
    if (!this.connected) {
      logger.warn(`⚠️ Redis SET skipped for key: ${key}, client not connected.`);
      return null;
    }

    try {
      return await this.client.setEx(key, ttlInSeconds, value);
    } catch (err) {
      logger.error(`❌ Redis SET failed for key: ${key}`, err);
      return null;
    }
  }

  async delete(key: string) {
    if (!this.connected) {
      logger.warn(`⚠️ Redis DELETE skipped for key: ${key}, client not connected.`);
      return null;
    }

    try {
      return await this.client.del(key);
    } catch (err) {
      logger.error(`❌ Redis DELETE failed for key: ${key}`, err);
      return null;
    }
  }

  async disconnect() {
    try {
      return await this.client.quit();
    } catch (err) {
      logger.error('❌ Redis disconnect failed', err);
      return null;
    }
  }
}
