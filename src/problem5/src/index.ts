import { createApp } from "./app.ts";
import db from "./db/index.ts";

const PORT = Number(process.env.PORT ?? 8000);
const HOST = process.env.HOST ?? "0.0.0.0";
const SHUTDOWN_TIMEOUT_MS = 10_000;

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`[server] listening on http://${HOST}:${PORT}`);
});

let shuttingDown = false;

const shutdown = (signal: string): void => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[server] ${signal} received, draining in-flight requests…`);

  const forceExit = setTimeout(() => {
    console.error(
      `[server] forced exit after ${SHUTDOWN_TIMEOUT_MS}ms of graceful shutdown`,
    );
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  server.close((err) => {
    if (err) {
      console.error("[server] HTTP close error", err);
      process.exit(1);
    }
    try {
      db.close(false);
    } catch (e) {
      console.error("[server] DB close error", e);
    }
    clearTimeout(forceExit);
    console.log("[server] shutdown complete");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
