/** Public resource representation returned by the API. */
export interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

/** Database row representation returned by PGlite. */
export interface ResourceRow {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}

/** Writable resource fields shared by create and update operations. */
export type ResourceFields = Pick<Resource, 'name' | 'description' | 'category'>;

export type CreateResourceInput = ResourceFields;
export type UpdateResourceInput = Partial<ResourceFields>;

export interface ResourceListQuery {
  name?: string;
  category?: string;
  limit: number;
  offset: number;
}

export interface ResourceListResponse {
  data: Resource[];
  limit: number;
  offset: number;
}
