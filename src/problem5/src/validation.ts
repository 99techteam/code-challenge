import { RESOURCE_STATUSES, ResourceCreateInput, ResourceListFilters, ResourceStatus, ResourceUpdateInput } from './types';

export class HttpError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function ensureString(value: unknown, field: string, { required = false, allowEmpty = false } = {}): string | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new HttpError(400, `Field "${field}" is required.`);
    }
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, `Field "${field}" must be a string.`);
  }

  const trimmed = value.trim();
  if (!allowEmpty && trimmed.length === 0) {
    throw new HttpError(400, `Field "${field}" cannot be empty.`);
  }

  return trimmed;
}

function ensureStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, `Field "${field}" must be an array of strings.`);
  }

  return value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new HttpError(400, `Field "${field}[${index}]" must be a string.`);
    }
    return item.trim();
  });
}

function ensureStatus(value: unknown, field: string): ResourceStatus | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, `Field "${field}" must be a string.`);
  }

  if (!RESOURCE_STATUSES.includes(value as ResourceStatus)) {
    throw new HttpError(400, `Field "${field}" must be one of: ${RESOURCE_STATUSES.join(', ')}.`);
  }

  return value as ResourceStatus;
}

export function parseCreatePayload(body: unknown): ResourceCreateInput {
  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  const title = ensureString((body as Record<string, unknown>).title, 'title', { required: true });
  const description = ensureString((body as Record<string, unknown>).description, 'description', { allowEmpty: true });
  const status = ensureStatus((body as Record<string, unknown>).status, 'status');
  const tags = ensureStringArray((body as Record<string, unknown>).tags, 'tags');

  return {
    title: title!,
    description,
    status,
    tags
  };
}

export function parseUpdatePayload(body: unknown): ResourceUpdateInput {
  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  const record = body as Record<string, unknown>;
  const update: ResourceUpdateInput = {};

  if ('title' in record) {
    update.title = ensureString(record.title, 'title', { required: true });
  }

  if ('description' in record) {
    update.description = ensureString(record.description, 'description', { allowEmpty: true });
  }

  if ('status' in record) {
    update.status = ensureStatus(record.status, 'status');
  }

  if ('tags' in record) {
    update.tags = ensureStringArray(record.tags, 'tags');
  }

  if (Object.keys(update).length === 0) {
    throw new HttpError(400, 'No valid fields supplied for update.');
  }

  return update;
}

export function parseListFilters(query: Record<string, unknown>): ResourceListFilters {
  const filters: ResourceListFilters = {};

  const status = ensureStatus(query.status, 'status');
  if (status) {
    filters.status = status;
  }

  const q = ensureString(query.q, 'q', { allowEmpty: false });
  if (q) {
    filters.q = q;
  }

  const tag = ensureString(query.tag, 'tag', { allowEmpty: false });
  if (tag) {
    filters.tag = tag;
  }

  if (query.limit !== undefined) {
    const limitNumber = Number(query.limit);
    if (!Number.isInteger(limitNumber) || limitNumber <= 0 || limitNumber > 1000) {
      throw new HttpError(400, 'Field "limit" must be an integer between 1 and 1000.');
    }
    filters.limit = limitNumber;
  }

  if (query.offset !== undefined) {
    const offsetNumber = Number(query.offset);
    if (!Number.isInteger(offsetNumber) || offsetNumber < 0) {
      throw new HttpError(400, 'Field "offset" must be a non-negative integer.');
    }
    filters.offset = offsetNumber;
  }

  return filters;
}

