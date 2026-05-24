import { ResourceStatusEnum } from '../enums/resource-status.enum';

export interface ResourceModel {
  id: number;
  name: string;
  description: string | null;
  status: ResourceStatusEnum;
  isArchived: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListResourceFiltersModel {
  status?: ResourceStatusEnum;
  name?: string;
  limit: number;
  offset: number;
}
