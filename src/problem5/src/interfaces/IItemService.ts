import { CreateItemDTO, Item, UpdateItemDTO } from '../models/item';

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy?: 'name' | 'price' | 'category' | 'createdAt';
  order?: SortOrder;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: {
    sortBy?: 'name' | 'price' | 'category' | 'createdAt';
    order?: 'asc' | 'desc';
  };
  searchTerm?: string;
  filter?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export interface IItemService {
  getAllItems(params?: PaginationParams): Promise<PaginatedResult<Item>>;
  createItem(itemData: CreateItemDTO): Promise<Item>;
  getItemById(id: number): Promise<Item | null>;
  updateItem(id: number, data: UpdateItemDTO): Promise<Item | null>;
  deleteItem(id: number): Promise<Item | null>;
}