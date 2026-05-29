export interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceRequest {
  name: string;
  description: string;
  category: string;
  status?: 'active' | 'inactive';
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive';
}

export interface ResourceFilter {
  category?: string;
  status?: 'active' | 'inactive';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: {
    data: T;
    total?: number;
  };
  error?: string;
  message?: string;
}
