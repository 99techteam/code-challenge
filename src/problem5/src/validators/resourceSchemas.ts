import { HttpError } from "../errors/httpError.js";
import type { ResourceFilters } from "../types/resource.js";

export interface CreateResourceInput {
    name: string;
    description: string;
    isFinish: boolean;
}

export interface UpdateResourceInput {
    name?: string;
    description?: string;
    isFinish?: boolean;
}

function getRecord(value: unknown, message: string): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new HttpError(400, message);
    }

    return value as Record<string, unknown>;
}

function parseStringField(
    value: unknown,
    fieldName: string,
    options: { required?: boolean; maxLength?: number } = {},
): string | undefined {
    const { required = false, maxLength } = options;

    if (value === undefined) {
        if (required) {
            throw new HttpError(400, `${fieldName} is required`);
        }

        return undefined;
    }

    if (typeof value !== "string") {
        throw new HttpError(400, `${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (!normalized) {
        throw new HttpError(400, `${fieldName} must not be empty`);
    }

    if (maxLength !== undefined && normalized.length > maxLength) {
        throw new HttpError(
            400,
            `${fieldName} must be at most ${maxLength} characters`,
        );
    }

    return normalized;
}

function parseBooleanField(
    value: unknown,
    fieldName: string,
): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== "boolean") {
        throw new HttpError(400, `${fieldName} must be a boolean`);
    }

    return value;
}

function parseQueryValue(value: unknown): string | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value === "string") {
        return value;
    }

    throw new HttpError(400, "Query parameters must be strings");
}

export function validateCreateResource(body: unknown): CreateResourceInput {
    const payload = getRecord(body, "Request body must be a JSON object");

    return {
        name: parseStringField(payload.name, "name", {
            required: true,
            maxLength: 255,
        }) as string,
        description: parseStringField(payload.description, "description", {
            required: true,
        }) as string,
        isFinish: parseBooleanField(payload.isFinish, "isFinish") ?? false,
    };
}

export function validateUpdateResource(body: unknown): UpdateResourceInput {
    const payload = getRecord(body, "Request body must be a JSON object");
    const update: UpdateResourceInput = {};

    const name = parseStringField(payload.name, "name", { maxLength: 255 });
    const description = parseStringField(payload.description, "description");
    const isFinish = parseBooleanField(payload.isFinish, "isFinish");

    if (name !== undefined) {
        update.name = name;
    }

    if (description !== undefined) {
        update.description = description;
    }

    if (isFinish !== undefined) {
        update.isFinish = isFinish;
    }

    if (Object.keys(update).length === 0) {
        throw new HttpError(400, "At least one field must be provided");
    }

    return update;
}

export function validateListResourcesQuery(query: unknown): ResourceFilters {
    const params = getRecord(query, "Query parameters must be an object");
    const filters: ResourceFilters = {};
    const rawIsFinish = parseQueryValue(params.isFinish);
    const rawSearch = parseQueryValue(params.search);

    if (rawIsFinish !== undefined) {
        if (rawIsFinish !== "true" && rawIsFinish !== "false") {
            throw new HttpError(400, "isFinish must be either true or false");
        }

        filters.isFinish = rawIsFinish === "true";
    }

    if (rawSearch !== undefined) {
        const search = rawSearch.trim();

        if (!search) {
            throw new HttpError(400, "search must not be empty");
        }

        filters.search = search;
    }

    return filters;
}
