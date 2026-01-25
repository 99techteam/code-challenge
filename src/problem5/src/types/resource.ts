export interface Resource {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface CreateResourceDTO {
  name: string;
  description: string;
  type: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface UpdateResourceDTO {
  name?: string;
  description?: string;
  type?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface ResourceFilter {
  type?: string;
  status?: 'active' | 'inactive';
  search?: string;
}
