import { randomUUID } from "crypto";
import { database } from "./database";
import { Book, BookStatus } from "./types";

interface ListBooksFilters {
  status?: BookStatus;
  author?: string;
  q?: string;
}

interface CreateBookInput {
  title: string;
  author: string;
  status: BookStatus;
  publishedYear?: number;
}

type UpdateBookInput = Partial<CreateBookInput>;

export async function listBooks(filters: ListBooksFilters): Promise<Book[]> {
  const data = await database.read();
  const author = filters.author?.toLowerCase();
  const query = filters.q?.toLowerCase();

  return data.books.filter((book) => {
    if (filters.status && book.status !== filters.status) {
      return false;
    }

    if (author && !book.author.toLowerCase().includes(author)) {
      return false;
    }

    if (query) {
      const searchable = `${book.title} ${book.author}`.toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export async function getBookById(id: string): Promise<Book | null> {
  const data = await database.read();
  return data.books.find((book) => book.id === id) ?? null;
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const data = await database.read();
  const now = new Date().toISOString();
  const book: Book = {
    id: randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  data.books.push(book);
  await database.write(data);

  return book;
}

export async function updateBook(id: string, input: UpdateBookInput): Promise<Book | null> {
  const data = await database.read();
  const index = data.books.findIndex((book) => book.id === id);

  if (index === -1) {
    return null;
  }

  const updatedBook: Book = {
    ...data.books[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  data.books[index] = updatedBook;
  await database.write(data);

  return updatedBook;
}

export async function deleteBook(id: string): Promise<boolean> {
  const data = await database.read();
  const nextBooks = data.books.filter((book) => book.id !== id);

  if (nextBooks.length === data.books.length) {
    return false;
  }

  data.books = nextBooks;
  await database.write(data);

  return true;
}

