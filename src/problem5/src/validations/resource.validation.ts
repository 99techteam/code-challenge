import { BadRequestError } from '../errors/app-error.js';
import type {
  CreateResourceInput,
  ResourceListQuery,
  UpdateResourceInput,
} from '../types/resource.js';

const FIELD_LIMITS = {
  name: 200,
  description: 5000,
  category: 100,
} as const;

type FieldName = keyof typeof FIELD_LIMITS;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(value: unknown, field: FieldName): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestError(`${field} must be a non-empty string`);
  }
  if (value.length > FIELD_LIMITS[field]) {
    throw new BadRequestError(`${field} must be at most ${FIELD_LIMITS[field]} characters`);
  }
  return value.trim();
}

function readOptionalString(value: unknown, field: FieldName): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new BadRequestError(`${field} must be a string`);
  if (value.length > FIELD_LIMITS[field]) {
    throw new BadRequestError(`${field} must be at most ${FIELD_LIMITS[field]} characters`);
  }
  return value.trim();
}

function readInteger(value: unknown, fallback: number, min: number, max: number, name: string): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new BadRequestError(`${name} must be an integer`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new BadRequestError(`${name} must be between ${min} and ${max}`);
  }
  return parsed;
}

function readOptionalQueryString(query: Record<string, unknown>, name: string): string | undefined {
  const value = query[name];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new BadRequestError(`${name} must be a string`);
  return value.trim() || undefined;
}

export function parseResourceId(value: string): number {
  if (!/^\d+$/.test(value)) throw new BadRequestError('id must be a positive integer');
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new BadRequestError('id must be a positive integer');
  return id;
}

export function parseCreateResource(body: unknown): CreateResourceInput {
  if (!isRecord(body)) throw new BadRequestError('Request body must be a JSON object');
  return {
    name: readRequiredString(body.name, 'name'),
    description: readOptionalString(body.description, 'description') ?? '',
    category: readOptionalString(body.category, 'category') ?? '',
  };
}

export function parseUpdateResource(body: unknown): UpdateResourceInput {
  if (!isRecord(body)) throw new BadRequestError('Request body must be a JSON object');

  const update: UpdateResourceInput = {};
  if (body.name !== undefined) update.name = readRequiredString(body.name, 'name');
  const description = readOptionalString(body.description, 'description');
  const category = readOptionalString(body.category, 'category');
  if (description !== undefined) update.description = description;
  if (category !== undefined) update.category = category;

  if (Object.keys(update).length === 0) {
    throw new BadRequestError('Provide at least one field to update');
  }
  return update;
}

export function parseResourceListQuery(query: unknown): ResourceListQuery {
  if (!isRecord(query)) throw new BadRequestError('Invalid query parameters');
  const name = readOptionalQueryString(query, 'name');
  const category = readOptionalQueryString(query, 'category');
  const limit = readInteger(query.limit, 50, 1, 100, 'limit');
  const offset = readInteger(query.offset, 0, 0, Number.MAX_SAFE_INTEGER, 'offset');
  return { name, category, limit, offset };
}
