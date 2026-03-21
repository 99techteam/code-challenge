export interface CreateResourceDto {
  name: string;
  description?: string | null;
  price: number;
}

export interface UpdateResourceDto {
  name?: string;
  description?: string | null;
  price?: number;
}

export interface ResourceFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
