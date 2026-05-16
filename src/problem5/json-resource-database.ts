import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_DATABASE_FILE } from "./constants";
import { HttpError } from "./errors";
import {
  type CreateResourceInput,
  type DatabaseShape,
  type Resource,
  type ResourceFilters,
  type ResourceRepository,
  type UpdateResourceInput,
} from "./types";
import { parseDatabase, resourceContains } from "./validation";

/**
 * @description File-backed repository for resource records. It stores all
 * resources in a JSON file and rewrites the file after each mutation.
 */
export class JsonResourceDatabase implements ResourceRepository {
  /**
   * @description Creates a JSON repository instance.
   * @param databaseFile - Path to the JSON file used for persistence.
   */
  public constructor(private readonly databaseFile = DEFAULT_DATABASE_FILE) {}

  /**
   * @description Lists resources that match optional filters.
   * @param filters - Category, status, tag, and search filters.
   * @returns Matching resources from the database file.
   */
  public async list(filters: ResourceFilters): Promise<Resource[]> {
    const { resources } = await this.read();
    const search = filters.search?.toLowerCase();

    return resources.filter((resource) => {
      const matchesCategory =
        filters.category === undefined || resource.category === filters.category;
      const matchesStatus =
        filters.status === undefined || resource.status === filters.status;
      const matchesTag = filters.tag === undefined || resource.tags.includes(filters.tag);
      const matchesSearch = search === undefined || resourceContains(resource, search);

      return matchesCategory && matchesStatus && matchesTag && matchesSearch;
    });
  }

  /**
   * @description Finds one resource by id.
   * @param id - Resource id.
   * @returns The matching resource, or undefined when not found.
   */
  public async findById(id: string): Promise<Resource | undefined> {
    const { resources } = await this.read();

    return resources.find((resource) => resource.id === id);
  }

  /**
   * @description Creates and persists a new resource.
   * @param input - Validated resource fields.
   * @returns The created resource with id and timestamps.
   */
  public async create(input: CreateResourceInput): Promise<Resource> {
    const database = await this.read();
    const timestamp = new Date().toISOString();
    const resource: Resource = {
      id: randomUUID(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.write({ resources: [...database.resources, resource] });

    return resource;
  }

  /**
   * @description Updates an existing resource and persists the change.
   * @param id - Resource id.
   * @param input - Validated partial resource fields.
   * @returns Updated resource, or undefined when not found.
   */
  public async update(
    id: string,
    input: UpdateResourceInput,
  ): Promise<Resource | undefined> {
    const database = await this.read();
    const existing = database.resources.find((resource) => resource.id === id);

    if (!existing) {
      return undefined;
    }

    const updated: Resource = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    await this.write({
      resources: database.resources.map((resource) =>
        resource.id === id ? updated : resource,
      ),
    });

    return updated;
  }

  /**
   * @description Deletes a resource by id.
   * @param id - Resource id.
   * @returns True when a record was removed.
   */
  public async delete(id: string): Promise<boolean> {
    const database = await this.read();
    const resources = database.resources.filter((resource) => resource.id !== id);

    if (resources.length === database.resources.length) {
      return false;
    }

    await this.write({ resources });

    return true;
  }

  /**
   * @description Reads and validates the JSON database file.
   * @returns Parsed database content, or an empty database when the file is missing.
   */
  private async read(): Promise<DatabaseShape> {
    try {
      const rawDatabase = await readFile(this.databaseFile, "utf8");
      const parsedDatabase = JSON.parse(rawDatabase) as unknown;

      return parseDatabase(parsedDatabase);
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return { resources: [] };
      }

      if (error instanceof SyntaxError) {
        throw new HttpError(500, "Database file contains invalid JSON");
      }

      throw error;
    }
  }

  /**
   * @description Persists the full database using an atomic rename.
   * @param database - Complete database state to write.
   */
  private async write(database: DatabaseShape): Promise<void> {
    await mkdir(path.dirname(this.databaseFile), { recursive: true });

    const temporaryFile = `${this.databaseFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(database, null, 2)}\n`, "utf8");
    await rename(temporaryFile, this.databaseFile);
  }
}

/**
 * @description Checks whether an unknown error has a Node-style error code.
 * @param error - Unknown error thrown by filesystem APIs.
 * @returns True when the error exposes a code property.
 */
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
