import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Problem 5 API listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exitCode = 1;
});
