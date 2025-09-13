export interface Resource {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface CreateResourceRequest {
  name: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface ResourceFilters {
  category?: string;
  status?: 'active' | 'inactive' | 'archived';
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'id' | 'name' | 'category' | 'status' | 'created_at' | 'updated_at';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResources {
  data: Resource[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
}