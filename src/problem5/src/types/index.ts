export interface CreateBookDto {
  title: string;
  author: string;
  publishedYear: number;
  description?: string;
  genre?: string;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  publishedYear?: number;
  description?: string;
  genre?: string;
}

export interface BookFilterDto {
  author?: string;
  publishedYear?: number;
  genre?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
