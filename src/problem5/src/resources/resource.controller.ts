import type { RequestHandler } from "express";
import {
  CreateResourceSchema,
  IdParamSchema,
  ListResourcesQuerySchema,
  UpdateResourceSchema,
} from "./resource.schema.js";
import type { ResourceService } from "./resource.service.js";

/**
 * Controllers — translate HTTP ↔ service.
 *
 * Pattern: parse with zod, call the service, respond with the standard
 * envelope `{ ok, data }`. Errors thrown by zod or the service propagate to
 * the global error-handler middleware, which converts them to error envelopes.
 */
export interface ResourceController {
  create: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
}

export function createResourceController(
  service: ResourceService,
): ResourceController {
  return {
    create: (req, res) => {
      const body = CreateResourceSchema.parse(req.body);
      const created = service.create(body);
      res.status(201).json({ ok: true, data: created });
    },

    list: (req, res) => {
      const query = ListResourcesQuerySchema.parse(req.query);
      const { items, nextCursor } = service.list(query);
      res.status(200).json({
        ok: true,
        data: items,
        pagination: {
          limit: query.limit,
          nextCursor,
          hasMore: nextCursor !== null,
        },
      });
    },

    getById: (req, res) => {
      const { id } = IdParamSchema.parse(req.params);
      const resource = service.getById(id);
      res.status(200).json({ ok: true, data: resource });
    },

    update: (req, res) => {
      const { id } = IdParamSchema.parse(req.params);
      const patch = UpdateResourceSchema.parse(req.body);
      const updated = service.update(id, patch);
      res.status(200).json({ ok: true, data: updated });
    },

    delete: (req, res) => {
      const { id } = IdParamSchema.parse(req.params);
      service.delete(id);
      res.status(204).end();
    },
  };
}
