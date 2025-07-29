import { EntityManager } from "@mikro-orm/core";
import { Book } from "../entities/Book";
import { CreateBookRequest, UpdateBookRequest, BookFilters } from "../types";
import { database } from "../database/database";
import { logger } from "../utils/logger";

export class BookRepository {
  get em(): EntityManager {
    return database.getEntityManager();
  }

  async create(bookData: CreateBookRequest): Promise<Book> {
    try {
      const book = this.em.create(Book, {
        ...bookData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.em.persist(book);
      await this.em.flush();

      logger.info(`Book created with ID: ${book.id}`);
      return book;
    } catch (error) {
      logger.error("Error creating book:", error);
      throw error;
    }
  }

  async findAll(filters: BookFilters = {}): Promise<Book[]> {
    try {
      const where: any = {};

      if (filters.title) {
        where.title = { $ilike: `%${filters.title}%` };
      }

      if (filters.author) {
        where.author = { $ilike: `%${filters.author}%` };
      }

      if (filters.isbn) {
        where.isbn = { $ilike: `%${filters.isbn}%` };
      }

      if (filters.genre) {
        where.genre = { $ilike: `%${filters.genre}%` };
      }

      if (filters.minPublishedYear !== undefined) {
        where.publishedYear = { $gte: filters.minPublishedYear };
      }

      if (filters.maxPublishedYear !== undefined) {
        where.publishedYear = {
          ...where.publishedYear,
          $lte: filters.maxPublishedYear,
        };
      }

      if (filters.minPrice !== undefined) {
        where.price = { $gte: filters.minPrice };
      }

      if (filters.maxPrice !== undefined) {
        where.price = { ...where.price, $lte: filters.maxPrice };
      }

      const options: any = {
        orderBy: { createdAt: "DESC" },
      };

      if (filters.limit !== undefined) {
        options.limit = filters.limit;
      }

      if (filters.offset !== undefined) {
        options.offset = filters.offset;
      }

      const books = await this.em.find(Book, where, options);
      logger.info(`Found ${books.length} books`);
      return books;
    } catch (error) {
      logger.error("Error finding books:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<Book | null> {
    try {
      const book = await this.em.findOne(Book, { id });
      if (book) {
        logger.info(`Book found with ID: ${id}`);
      } else {
        logger.warn(`Book not found with ID: ${id}`);
      }
      return book;
    } catch (error) {
      logger.error(`Error finding book with ID ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, bookData: UpdateBookRequest): Promise<Book | null> {
    try {
      const book = await this.em.findOne(Book, { id });
      if (!book) {
        logger.warn(`Book not found for update with ID: ${id}`);
        return null;
      }

      this.em.assign(book, bookData);
      await this.em.flush();

      logger.info(`Book updated with ID: ${id}`);
      return book;
    } catch (error) {
      logger.error(`Error updating book with ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const book = await this.em.findOne(Book, { id });
      if (!book) {
        logger.warn(`Book not found for deletion with ID: ${id}`);
        return false;
      }

      await this.em.removeAndFlush(book);
      logger.info(`Book deleted with ID: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting book with ID ${id}:`, error);
      throw error;
    }
  }

  async count(filters: BookFilters = {}): Promise<number> {
    try {
      const where: any = {};

      if (filters.title) {
        where.title = { $ilike: `%${filters.title}%` };
      }

      if (filters.author) {
        where.author = { $ilike: `%${filters.author}%` };
      }

      if (filters.isbn) {
        where.isbn = { $ilike: `%${filters.isbn}%` };
      }

      if (filters.genre) {
        where.genre = { $ilike: `%${filters.genre}%` };
      }

      if (filters.minPublishedYear !== undefined) {
        where.publishedYear = { $gte: filters.minPublishedYear };
      }

      if (filters.maxPublishedYear !== undefined) {
        where.publishedYear = {
          ...where.publishedYear,
          $lte: filters.maxPublishedYear,
        };
      }

      if (filters.minPrice !== undefined) {
        where.price = { $gte: filters.minPrice };
      }

      if (filters.maxPrice !== undefined) {
        where.price = { ...where.price, $lte: filters.maxPrice };
      }

      const count = await this.em.count(Book, where);
      logger.info(`Total books count: ${count}`);
      return count;
    } catch (error) {
      logger.error("Error counting books:", error);
      throw error;
    }
  }
}
