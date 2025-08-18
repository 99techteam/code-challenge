export interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateResourceRequest {
  name: string;
  description: string;
  category: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
}

export interface ResourceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'active' | 'inactive';
  sort_by?: 'name' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  corsOrigins: string[];
}
