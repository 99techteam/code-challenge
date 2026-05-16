import { RESOURCE_STATUSES } from "./constants";

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ResourceStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseShape {
  resources: Resource[];
}

export interface ResourceFilters {
  category?: string;
  status?: ResourceStatus;
  search?: string;
  tag?: string;
}

export type CreateResourceInput = Pick<
  Resource,
  "title" | "description" | "category" | "status" | "tags"
>;

export type UpdateResourceInput = Partial<CreateResourceInput>;

export interface ResourceRepository {
  list(filters: ResourceFilters): Promise<Resource[]>;
  findById(id: string): Promise<Resource | undefined>;
  create(input: CreateResourceInput): Promise<Resource>;
  update(id: string, input: UpdateResourceInput): Promise<Resource | undefined>;
  delete(id: string): Promise<boolean>;
}
