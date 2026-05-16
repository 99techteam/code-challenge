import path from "node:path";

export const RESOURCE_STATUSES = ["active", "archived"] as const;
export const DEFAULT_PORT = 3000;
export const DEFAULT_DATABASE_FILE = path.join(__dirname, "database.json");
