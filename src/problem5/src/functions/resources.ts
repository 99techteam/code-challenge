import type { Request, Response } from "express";
import type { ResourceRepository } from "../repository.js";
import { rowToResource } from "../mappers.js";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  ResourceStatus,
  UpdateResourceInput,
} from "../types.js";

const STATUSES: ResourceStatus[] = ["draft", "active", "archived"];

/** Returns a valid status or undefined if missing/invalid (caller may return 400). */
function parseStatus(value: unknown): ResourceStatus | undefined {
  if (typeof value !== "string") return undefined;
  return STATUSES.includes(value as ResourceStatus)
    ? (value as ResourceStatus)
    : undefined;
}

/** Parses a query param as a finite integer; undefined if absent or not a number. */
function parseOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

/** Lists resources with optional status/text filters and pagination controls. */
export function listResources(
  repo: ResourceRepository,
  req: Request,
  res: Response,
) {
  const status = parseStatus(req.query.status);
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const limit = parseOptionalInt(req.query.limit);
  const offset = parseOptionalInt(req.query.offset);

  if (req.query.status !== undefined && status === undefined) {
    res.status(400).json({
      error: "Invalid status; use draft, active, or archived.",
    });
    return;
  }

  const query: ListResourcesQuery = {
    ...(status !== undefined && { status }),
    ...(q !== undefined && { q }),
    ...(limit !== undefined && { limit }),
    ...(offset !== undefined && { offset }),
  };

  const rows = repo.list(query);
  res.json({ items: rows.map(rowToResource) });
}

/** Returns one resource by numeric id, with 400/404 guards for invalid or missing data. */
export function getResourceById(
  repo: ResourceRepository,
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const row = repo.findById(id);
  if (!row) {
    res.status(404).json({ error: "Resource not found." });
    return;
  }
  res.json(rowToResource(row));
}

/** Validates payload and creates a new resource, returning 201 with mapped API shape. */
export function createResource(
  repo: ResourceRepository,
  req: Request,
  res: Response,
) {
  const body = req.body as Partial<CreateResourceInput>;
  if (typeof body.title !== "string" || body.title.trim() === "") {
    console.error(body);
    res
      .status(400)
      .json({ error: "title is required and must be a non-empty string." });
    return;
  }
  const status = parseStatus(body.status);
  if (body.status !== undefined && status === undefined) {
    res.status(400).json({
      error: "Invalid status; use draft, active, or archived.",
    });
    return;
  }
  let description: string | null = null;
  if (body.description !== undefined) {
    if (body.description === null) description = null;
    else if (typeof body.description === "string")
      description = body.description;
    else {
      res.status(400).json({ error: "description must be a string or null." });
      return;
    }
  }

  const input: CreateResourceInput = {
    title: body.title.trim(),
    description,
    ...(status !== undefined && { status }),
  };
  const row = repo.create(input);
  res.status(201).json(rowToResource(row));
}

/** Applies partial updates to a resource and rejects empty update payloads. */
export function updateResource(
  repo: ResourceRepository,
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const body = req.body as Partial<UpdateResourceInput>;
  const status = parseStatus(body.status);
  if (body.status !== undefined && status === undefined) {
    res.status(400).json({
      error: "Invalid status; use draft, active, or archived.",
    });
    return;
  }
  const input: UpdateResourceInput = {};
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      res
        .status(400)
        .json({ error: "title must be a non-empty string when provided." });
      return;
    }
    input.title = body.title.trim();
  }
  if (body.description !== undefined) {
    input.description =
      typeof body.description === "string" ? body.description : null;
  }
  if (status !== undefined) input.status = status;

  if (Object.keys(input).length === 0) {
    res.status(400).json({ error: "Provide at least one field to update." });
    return;
  }

  const row = repo.update(id, input);
  if (!row) {
    res.status(404).json({ error: "Resource not found." });
    return;
  }
  res.json(rowToResource(row));
}

/** Deletes a resource by id and responds with 204 when deletion succeeds. */
export function deleteResource(
  repo: ResourceRepository,
  req: Request,
  res: Response,
) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid id." });
    return;
  }
  const deleted = repo.delete(id);
  if (!deleted) {
    res.status(404).json({ error: "Resource not found." });
    return;
  }
  res.status(204).send();
}
