export interface Resource {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateResourceBody {
  name: string;
  description?: string;
  status?: Resource['status'];
}

export interface UpdateResourceBody {
  name?: string;
  description?: string;
  status?: Resource['status'];
}

export interface ListResourcesQuery {
  status?: Resource['status'];
  name?: string;
  page?: string;
  limit?: string;
}
