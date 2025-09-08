import { Repository } from 'typeorm';
import { Book } from '../entity/Book';
import { AppDataSource } from '../config/data-source';
import { CreateBookDto, UpdateBookDto, BookFilterDto } from '../types';

export class BookService {
  private bookRepository: Repository<Book>;

  constructor() {
    this.bookRepository = AppDataSource.getRepository(Book);
  }

  async createBook(bookData: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(bookData);
    return await this.bookRepository.save(book);
  }

  async getAllBooks(filters: BookFilterDto = {}): Promise<{ books: Book[]; total: number }> {
    const queryBuilder = this.bookRepository.createQueryBuilder('book');

    // Apply filters
    if (filters.author) {
      queryBuilder.andWhere('book.author LIKE :author', { author: `%${filters.author}%` });
    }

    if (filters.publishedYear) {
      queryBuilder.andWhere('book.publishedYear = :publishedYear', { publishedYear: filters.publishedYear });
    }

    if (filters.genre) {
      queryBuilder.andWhere('book.genre LIKE :genre', { genre: `%${filters.genre}%` });
    }

    // Apply pagination
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

    queryBuilder.take(limit).skip(offset);

    // Order by creation date (newest first)
    queryBuilder.orderBy('book.createdAt', 'DESC');

    const [books, total] = await queryBuilder.getManyAndCount();
    return { books, total };
  }

  async getBookById(id: number): Promise<Book | null> {
    return await this.bookRepository.findOne({ where: { id } });
  }

  async updateBook(id: number, updateData: UpdateBookDto): Promise<Book | null> {
    await this.bookRepository.update(id, updateData);
    return await this.getBookById(id);
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await this.bookRepository.delete(id);
    return result.affected !== 0;
  }

  async searchBooks(searchTerm: string): Promise<Book[]> {
    return await this.bookRepository
      .createQueryBuilder('book')
      .where('book.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('book.author LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('book.description LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }
}
