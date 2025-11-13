export const RESOURCE_STATUSES = ['draft', 'published', 'archived'] as const;

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface ResourceRecord {
  id: number;
  title: string;
  description: string;
  status: ResourceStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResourceCreateInput {
  title: string;
  description?: string;
  status?: ResourceStatus;
  tags?: string[];
}

export type ResourceUpdateInput = Partial<ResourceCreateInput>;

export interface ResourceListFilters {
  status?: ResourceStatus;
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

