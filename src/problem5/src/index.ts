import express from "express";
import mongoose from "mongoose";

import { env } from "./env";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errors-handler.middleware";
import { bookRouter } from "./route";
import { seedBooks } from "./mocks/seeds";

const bootstrap = async () => {
  await mongoose
    .connect(env.MONGODB_URI)
    .then(() => console.log("[Mongodb] Connected to the database!"));

  await seedBooks();

  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.send("Resources (Books) API!");
  });

  // Register routes
  app.use("/api/books", bookRouter);

  // Error handling middlewares
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`Server is running at http://localhost:${env.PORT}`);
  });
};

bootstrap().catch(async (err) => {
  console.error("Failed to start the server", err);
  await mongoose.disconnect();
  process.exit(1);
});
