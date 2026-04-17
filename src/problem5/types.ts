export type BookStatus = "available" | "borrowed" | "archived";

export type Book = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookInput = {
  title: string;
  author: string;
  status?: BookStatus;
  description?: string;
};

export type UpdateBookInput = Partial<CreateBookInput>;

export type BookFilters = {
  status?: BookStatus;
  author?: string;
  q?: string;
  limit?: number;
  offset?: number;
};
