export interface Resource {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  resources: Resource[];
}

export interface CreateResourceInput {
  name: string;
  description?: string;
  category?: string;
  price?: number;
}

export interface UpdateResourceInput {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
}
