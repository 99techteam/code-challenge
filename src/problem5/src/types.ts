export type BookStatus = "available" | "borrowed" | "archived";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  publishedYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  books: Book[];
}

