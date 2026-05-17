import express from "express";
import { resourcesRouter } from "./routes/resources.ts";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.ts";
import { createRateLimiter } from "./middleware/rateLimit.ts";
import { createRequestLogger } from "./middleware/requestLogger.ts";

export const createApp = (): express.Express => {
  const app = express();

  app.use(createRequestLogger());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(createRateLimiter());

  app.use("/resources", resourcesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
