import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";
import type { ResourceRepository } from "./resource.repo.js";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  Resource,
  UpdateResourceInput,
} from "./resource.schema.js";

/**
 * Resource service — owns business logic.
 * The service generates UUIDs and timestamps so the repo stays a pure SQL
 * layer with no opinion about clock or ID strategy.
 */

export interface ResourceService {
  create(input: CreateResourceInput): Resource;
  list(query: ListResourcesQuery): {
    items: Resource[];
    nextCursor: string | null;
  };
  getById(id: string): Resource;
  update(id: string, patch: UpdateResourceInput): Resource;
  delete(id: string): void;
}

export function createResourceService(
  repo: ResourceRepository,
): ResourceService {
  return {
    create(input) {
      const now = new Date().toISOString();
      return repo.insert({
        ...input,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      });
    },

    list(query) {
      return repo.list(query);
    },

    getById(id) {
      const found = repo.findById(id);
      if (!found) throw new NotFoundError("Resource", id);
      return found;
    },

    update(id, patch) {
      const updated = repo.update(id, {
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      if (!updated) throw new NotFoundError("Resource", id);
      return updated;
    },

    delete(id) {
      const deleted = repo.delete(id);
      if (!deleted) throw new NotFoundError("Resource", id);
    },
  };
}
