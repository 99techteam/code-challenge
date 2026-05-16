import { type Request } from "express";
import { RESOURCE_STATUSES } from "./constants";
import { HttpError } from "./errors";
import {
  type CreateResourceInput,
  type DatabaseShape,
  type Resource,
  type ResourceFilters,
  type ResourceStatus,
  type UpdateResourceInput,
} from "./types";

/**
 * @description Parses and validates list-resource query filters.
 * @param request - Express request containing query parameters.
 * @returns Normalized filters for the repository.
 */
export function parseResourceFilters(request: Request): ResourceFilters {
  const status = readOptionalQueryString(request, "status");

  if (status !== undefined && !isResourceStatus(status)) {
    throw new HttpError(400, "status must be active or archived");
  }

  return {
    category: readOptionalQueryString(request, "category"),
    status,
    search: readOptionalQueryString(request, "search"),
    tag: readOptionalQueryString(request, "tag"),
  };
}

/**
 * @description Parses and validates a create-resource request body.
 * @param body - Raw JSON request body.
 * @returns Validated input for creating a resource.
 */
export function parseCreateResourceInput(body: unknown): CreateResourceInput {
  const payload = readObjectPayload(body);

  return {
    title: readRequiredString(payload.title, "title"),
    description: readOptionalString(payload.description, "description") ?? "",
    category: readRequiredString(payload.category, "category"),
    status: readOptionalStatus(payload.status) ?? "active",
    tags: readTags(payload.tags),
  };
}

/**
 * @description Parses and validates an update-resource request body.
 * @param body - Raw JSON request body.
 * @returns Validated input containing at least one field to update.
 */
export function parseUpdateResourceInput(body: unknown): UpdateResourceInput {
  const payload = readObjectPayload(body);
  const input: UpdateResourceInput = {};

  if (Object.hasOwn(payload, "title")) {
    input.title = readRequiredString(payload.title, "title");
  }

  if (Object.hasOwn(payload, "description")) {
    input.description = readOptionalString(payload.description, "description") ?? "";
  }

  if (Object.hasOwn(payload, "category")) {
    input.category = readRequiredString(payload.category, "category");
  }

  if (Object.hasOwn(payload, "status")) {
    input.status = readOptionalStatus(payload.status) ?? "active";
  }

  if (Object.hasOwn(payload, "tags")) {
    input.tags = readTags(payload.tags);
  }

  if (Object.keys(input).length === 0) {
    throw new HttpError(400, "At least one field must be provided for update");
  }

  return input;
}

/**
 * @description Reads and validates a route resource id.
 * @param request - Express request containing route parameters.
 * @returns Trimmed route id.
 */
export function readRouteId(request: Request): string {
  const id = request.params.id;

  if (typeof id !== "string" || id.trim() === "") {
    throw new HttpError(400, "Resource id is required");
  }

  return id.trim();
}

/**
 * @description Parses the JSON database object loaded from disk.
 * @param value - Raw parsed JSON value.
 * @returns Safe database object used by the repository.
 */
export function parseDatabase(value: unknown): DatabaseShape {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HttpError(500, "Database root must be an object");
  }

  const resources = (value as Partial<DatabaseShape>).resources;

  if (!Array.isArray(resources)) {
    return { resources: [] };
  }

  return { resources: resources.filter(isResource) };
}

/**
 * @description Checks whether a resource contains the lower-case search term.
 * @param resource - Resource to search.
 * @param search - Lower-case search string.
 * @returns True when any searchable field contains the term.
 */
export function resourceContains(resource: Resource, search: string): boolean {
  return [resource.title, resource.description, resource.category, ...resource.tags]
    .join(" ")
    .toLowerCase()
    .includes(search);
}

/**
 * @description Checks whether a value is an allowed resource status.
 * @param value - Raw status value.
 * @returns True when the value is active or archived.
 */
export function isResourceStatus(value: unknown): value is ResourceStatus {
  return RESOURCE_STATUSES.includes(value as ResourceStatus);
}

/**
 * @description Ensures a request body is a JSON object.
 * @param value - Raw request body value.
 * @returns Object payload with unknown field values.
 */
function readObjectPayload(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  return value as Record<string, unknown>;
}

/**
 * @description Reads one optional string query parameter.
 * @param request - Express request containing query parameters.
 * @param key - Query parameter name.
 * @returns Trimmed query value, or undefined when omitted.
 */
function readOptionalQueryString(request: Request, key: string): string | undefined {
  const value = request.query[key];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `${key} must be a single string value`);
  }

  return value.trim() || undefined;
}

/**
 * @description Validates a required non-empty string field.
 * @param value - Raw field value.
 * @param field - Field name used in validation errors.
 * @returns Trimmed string value.
 */
function readRequiredString(value: unknown, field: string): string {
  const normalized = readOptionalString(value, field);

  if (!normalized) {
    throw new HttpError(400, `${field} is required and must be a non-empty string`);
  }

  return normalized;
}

/**
 * @description Validates an optional string field.
 * @param value - Raw field value.
 * @param field - Field name used in validation errors.
 * @returns Trimmed string value, or undefined when absent.
 */
function readOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be a string`);
  }

  return value.trim();
}

/**
 * @description Validates an optional status field.
 * @param value - Raw status value.
 * @returns Valid status, or undefined when omitted.
 */
function readOptionalStatus(value: unknown): ResourceStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (!isResourceStatus(value)) {
    throw new HttpError(400, "status must be active or archived");
  }

  return value;
}

/**
 * @description Validates an optional tags array.
 * @param value - Raw tags value.
 * @returns Trimmed tag strings.
 */
function readTags(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, "tags must be an array of strings");
  }

  return value.map((tag) => readRequiredString(tag, "tag"));
}

/**
 * @description Checks whether an unknown value has the persisted resource shape.
 * @param value - Raw database array item.
 * @returns True when the value is a valid resource.
 */
function isResource(value: unknown): value is Resource {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<Resource>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.category === "string" &&
    isResourceStatus(candidate.status) &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string") &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}
