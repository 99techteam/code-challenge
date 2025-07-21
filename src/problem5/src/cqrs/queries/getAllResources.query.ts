import { QueryResourceDto } from '../../dto';

export class GetAllResourcesQuery {
  constructor(
    public readonly filters: QueryResourceDto
  ) {}
} 