import { createApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

/**
 * Process entrypoint — starts the HTTP server and wires graceful shutdown.
 *
 * Graceful shutdown semantics:
 *   - On SIGTERM / SIGINT, stop accepting new connections.
 *   - Allow in-flight requests up to `SHUTDOWN_TIMEOUT_MS` to finish.
 *   - Close the SQLite handle to flush WAL.
 *   - Exit 0 on clean shutdown, 1 on timeout.
 */
const SHUTDOWN_TIMEOUT_MS = 10_000;

const handle = createApp();
const server = handle.app.listen(config.PORT, config.HOST, () => {
  logger.info(
    { port: config.PORT, host: config.HOST, env: config.NODE_ENV },
    "server listening",
  );
});

let shuttingDown = false;
function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutdown signal received, draining");

  const timer = setTimeout(() => {
    logger.error("shutdown timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  timer.unref();

  server.close((err) => {
    if (err) {
      logger.error({ err }, "error during server close");
      process.exit(1);
    }
    handle.close();
    logger.info("shutdown complete");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Last-resort safety nets — log and let the process die so the orchestrator
// restarts a fresh instance. Never swallow.
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "uncaughtException");
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "unhandledRejection");
  process.exit(1);
});
