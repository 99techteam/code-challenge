/**
 * @file Problem 5 - A Crude Server
 * @description Starts and exports a TypeScript ExpressJS CRUD API with a
 * file-backed database for resource persistence.
 * @author Paing Sett Kyaw
 * @created 2026-05-15
 * @updated 2026-05-16
 */

import { createApp } from "./app";
import { DEFAULT_DATABASE_FILE, DEFAULT_PORT } from "./constants";
import { JsonResourceDatabase } from "./json-resource-database";

if (require.main === module) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const databaseFile = process.env.DATABASE_FILE ?? DEFAULT_DATABASE_FILE;
  const app = createApp(new JsonResourceDatabase(databaseFile));

  app.listen(port, () => {
    console.log(`Problem 5 server is running on http://localhost:${port}`);
    console.log(`Database file: ${databaseFile}`);
  });
}

export { createApp } from "./app";
export { JsonResourceDatabase } from "./json-resource-database";
export type { Resource, ResourceRepository } from "./types";
