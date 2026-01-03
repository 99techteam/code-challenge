export interface Item {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItemDto {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  status?: string;
}

export interface ItemFilters {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

