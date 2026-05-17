/// <reference path="./types/express.d.ts" />
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import routes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { successResponse } from "./helpers/response.helper";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  successResponse(res, null, "API is running", 200);
});

app.use("/api", routes);

app.use(errorMiddleware);

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${env.port} is already in use`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
