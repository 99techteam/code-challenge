import { createApp } from "./app";
import { loadConfig } from "./config";

const config = loadConfig();
const { app, database } = createApp({
  databasePath: config.databasePath,
  jsonLimit: config.jsonLimit,
});

const server = app.listen(config.port, () => {
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : config.port;

  console.log(`Problem 5 server listening on http://localhost:${port}`);
  console.log(`SQLite database: ${config.databasePath}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received; shutting down`);

  server.close(() => {
    database.close();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
