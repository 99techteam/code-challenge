import { ResourceRepository } from "./resource.repository";

export class ResourceUseCases {
  constructor(private repo: ResourceRepository) {}

  create(data: {
    name: string;
    description?: string | undefined;
  }) {
    return this.repo.create(data);
  }

  list(params: {
    page: number;
    limit: number;
    name?: string ;
  }) {
    return this.repo.findAll(params);
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  update(
    id: string,
    data: {
      name?: string | undefined;
      description?: string | undefined;
    }
  ) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
