import { createServer } from "node:http";
import { env } from "./config/env";
import { createApp } from "./app";
import { createAppDataSource } from "./db/data-source";

async function bootstrap(): Promise<void> {
  const dataSource = createAppDataSource();
  await dataSource.initialize();

  const app = createApp(dataSource);
  const server = createServer(app);

  server.listen(env.port, () => {
    console.log(`Problem 5 server listening on http://localhost:${env.port}`);
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start Problem 5 server", error);
  process.exitCode = 1;
});
