import { randomUUID } from "node:crypto";
import { readDatabase, writeDatabase } from "./database";
import { Book, BookFilters, BookStatus, CreateBookInput, UpdateBookInput } from "./types";

const validStatuses: BookStatus[] = ["available", "borrowed", "archived"];

function isBookStatus(value: unknown): value is BookStatus {
  return typeof value === "string" && validStatuses.includes(value as BookStatus);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText(value: string): string {
  return value.trim();
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
}

export function parseBookFilters(query: Record<string, unknown>): BookFilters {
  return {
    status: isBookStatus(query.status) ? query.status : undefined,
    author: isNonEmptyString(query.author) ? normalizeText(query.author) : undefined,
    q: isNonEmptyString(query.q) ? normalizeText(query.q) : undefined,
    limit: parsePositiveInteger(query.limit, 20),
    offset: parsePositiveInteger(query.offset, 0),
  };
}

export function parseCreateBookInput(body: unknown): CreateBookInput {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object.");
  }

  const input = body as Record<string, unknown>;

  if (!isNonEmptyString(input.title)) {
    throw new Error("title is required.");
  }

  if (!isNonEmptyString(input.author)) {
    throw new Error("author is required.");
  }

  if (input.status !== undefined && !isBookStatus(input.status)) {
    throw new Error("status must be one of: available, borrowed, archived.");
  }

  if (input.description !== undefined && typeof input.description !== "string") {
    throw new Error("description must be a string.");
  }

  return {
    title: normalizeText(input.title),
    author: normalizeText(input.author),
    status: input.status ?? "available",
    description: typeof input.description === "string" ? normalizeText(input.description) : undefined,
  };
}

export function parseUpdateBookInput(body: unknown): UpdateBookInput {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object.");
  }

  const input = body as Record<string, unknown>;
  const update: UpdateBookInput = {};

  if (input.title !== undefined) {
    if (!isNonEmptyString(input.title)) {
      throw new Error("title must be a non-empty string.");
    }

    update.title = normalizeText(input.title);
  }

  if (input.author !== undefined) {
    if (!isNonEmptyString(input.author)) {
      throw new Error("author must be a non-empty string.");
    }

    update.author = normalizeText(input.author);
  }

  if (input.status !== undefined) {
    if (!isBookStatus(input.status)) {
      throw new Error("status must be one of: available, borrowed, archived.");
    }

    update.status = input.status;
  }

  if (input.description !== undefined) {
    if (typeof input.description !== "string") {
      throw new Error("description must be a string.");
    }

    update.description = normalizeText(input.description);
  }

  if (Object.keys(update).length === 0) {
    throw new Error("At least one field is required to update.");
  }

  return update;
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const database = await readDatabase();
  const now = new Date().toISOString();

  const book: Book = {
    id: randomUUID(),
    title: input.title,
    author: input.author,
    status: input.status ?? "available",
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };

  database.books.push(book);
  await writeDatabase(database);

  return book;
}

export async function listBooks(filters: BookFilters): Promise<{ items: Book[]; total: number }> {
  const database = await readDatabase();
  const searchText = filters.q?.toLowerCase();
  const author = filters.author?.toLowerCase();

  const filteredBooks = database.books.filter((book) => {
    const matchesStatus = filters.status === undefined || book.status === filters.status;
    const matchesAuthor = author === undefined || book.author.toLowerCase().includes(author);
    const matchesSearch =
      searchText === undefined ||
      book.title.toLowerCase().includes(searchText) ||
      book.author.toLowerCase().includes(searchText) ||
      book.description?.toLowerCase().includes(searchText);

    return matchesStatus && matchesAuthor && matchesSearch;
  });

  const offset = filters.offset ?? 0;
  const limit = filters.limit ?? 20;

  return {
    items: filteredBooks.slice(offset, offset + limit),
    total: filteredBooks.length,
  };
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const database = await readDatabase();
  return database.books.find((book) => book.id === id);
}

export async function updateBook(id: string, input: UpdateBookInput): Promise<Book | undefined> {
  const database = await readDatabase();
  const bookIndex = database.books.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    return undefined;
  }

  const currentBook = database.books[bookIndex];
  const updatedBook: Book = {
    ...currentBook,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  database.books[bookIndex] = updatedBook;
  await writeDatabase(database);

  return updatedBook;
}

export async function deleteBook(id: string): Promise<boolean> {
  const database = await readDatabase();
  const bookIndex = database.books.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    return false;
  }

  database.books.splice(bookIndex, 1);
  await writeDatabase(database);

  return true;
}
