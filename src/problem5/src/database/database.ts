import { MikroORM } from '@mikro-orm/core';
import { Book } from '../entities/Book';
import { logger } from '../utils/logger';
import config from '../../mikro-orm.config';
import { BookGenre } from '../types';
import { isDevelopment } from '../config/env';

export class Database {
  private orm: MikroORM | null = null;

  async connect(): Promise<void> {
    try {
      this.orm = await MikroORM.init(config);
      logger.info('Connected to PostgreSQL database with MikroORM');
      
      // Synchronize schema (creates missing tables/columns, safe for existing data)
      await this.orm.getSchemaGenerator().ensureDatabase();
      await this.orm.getSchemaGenerator().updateSchema();
      logger.info('Database schema synchronized');
      
      // Seed data if in development
      if (isDevelopment) {
        await this.seedData();
      }
    } catch (error) {
      logger.error('Error connecting to database:', error);
      throw error;
    }
  }

  private async seedData(): Promise<void> {
    if (!this.orm) {
      throw new Error('Database not initialized');
    }
    
    const em = this.orm.em.fork();
    
    // Check if data already exists
    const existingBooks = await em.count(Book);
    if (existingBooks > 0) {
      logger.info('Database already seeded');
      return;
    }

    const sampleBooks = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        publishedYear: 1925,
        genre: BookGenre.FICTION,
        description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
        price: 12.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780446310789',
        publishedYear: 1960,
        genre: BookGenre.FICTION,
        description: 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.',
        price: 14.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        publishedYear: 1949,
        genre: BookGenre.FICTION,
        description: 'A dystopian novel about totalitarianism and surveillance society.',
        price: 11.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'The Art of War',
        author: 'Sun Tzu',
        isbn: '9780140439199',
        publishedYear: -500,
        genre: BookGenre.NON_FICTION,
        description: 'Ancient Chinese text on military strategy and tactics.',
        price: 9.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9780141439518',
        publishedYear: 1813,
        genre: BookGenre.ROMANCE,
        description: 'A classic romance novel about the relationship between Elizabeth Bennet and Mr. Darcy.',
        price: 13.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    try {
      for (const bookData of sampleBooks) {
        const book = em.create(Book, bookData);
        em.persist(book);
      }
      await em.flush();
      logger.info('Database seeded with sample data');
    } catch (error) {
      logger.error('Error seeding database:', error);
    }
  }

  getEntityManager() {
    if (!this.orm) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.orm.em.fork();
  }

  async close(): Promise<void> {
    if (this.orm) {
      await this.orm.close();
    }
  }
}

// Export a singleton instance
export const database = new Database(); 