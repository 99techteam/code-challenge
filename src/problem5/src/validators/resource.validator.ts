import { HttpError } from "../utils/http-error";
import { CreateResourceInput, IncrementResourceInput, UpdateResourceInput } from "../types/resource";

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return undefined;
  }

  return value;
}

export function validateResourceId(rawId: string): number {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, "Resource id must be a positive integer");
  }

  return id;
}

export function validateCreateResourceInput(body: unknown): CreateResourceInput {
  if (body === null || typeof body !== "object") {
    throw new HttpError(400, "Request body must be an object");
  }

  const payload = body as Record<string, unknown>;
  const code = asTrimmedString(payload.code);
  const name = asTrimmedString(payload.name);
  const description = payload.description === undefined ? undefined : asTrimmedString(payload.description);
  const quantity = payload.quantity === undefined ? undefined : asInteger(payload.quantity);

  if (!code) {
    throw new HttpError(400, "Field 'code' is required");
  }

  if (!name) {
    throw new HttpError(400, "Field 'name' is required");
  }

  if (payload.quantity !== undefined && quantity === undefined) {
    throw new HttpError(400, "Field 'quantity' must be an integer");
  }

  return {
    code,
    name,
    description,
    quantity
  };
}

export function validateUpdateResourceInput(body: unknown): UpdateResourceInput {
  if (body === null || typeof body !== "object") {
    throw new HttpError(400, "Request body must be an object");
  }

  const payload = body as Record<string, unknown>;
  const result: UpdateResourceInput = {};

  if (payload.code !== undefined) {
    const code = asTrimmedString(payload.code);
    if (!code) {
      throw new HttpError(400, "Field 'code' must be a non-empty string");
    }
    result.code = code;
  }

  if (payload.name !== undefined) {
    const name = asTrimmedString(payload.name);
    if (!name) {
      throw new HttpError(400, "Field 'name' must be a non-empty string");
    }
    result.name = name;
  }

  if (payload.description !== undefined) {
    if (payload.description === null) {
      result.description = null;
    } else {
      const description = asTrimmedString(payload.description);
      if (!description) {
        throw new HttpError(400, "Field 'description' must be a non-empty string or null");
      }
      result.description = description;
    }
  }

  if (payload.quantity !== undefined) {
    const quantity = asInteger(payload.quantity);
    if (quantity === undefined) {
      throw new HttpError(400, "Field 'quantity' must be an integer");
    }
    result.quantity = quantity;
  }

  if (Object.keys(result).length === 0) {
    throw new HttpError(400, "At least one updatable field is required");
  }

  return result;
}

export function validateIncrementResourceInput(body: unknown): IncrementResourceInput {
  if (body === null || typeof body !== "object") {
    throw new HttpError(400, "Request body must be an object");
  }

  const payload = body as Record<string, unknown>;
  const amount = asInteger(payload.amount);

  if (amount === undefined || amount === 0) {
    throw new HttpError(400, "Field 'amount' must be a non-zero integer");
  }

  let simulateDelayMs: number | undefined;
  if (payload.simulateDelayMs !== undefined) {
    simulateDelayMs = asInteger(payload.simulateDelayMs);
    if (simulateDelayMs === undefined || simulateDelayMs < 0) {
      throw new HttpError(400, "Field 'simulateDelayMs' must be a non-negative integer");
    }
  }

  return { amount, simulateDelayMs };
}
