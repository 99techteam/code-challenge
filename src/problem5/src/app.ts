import express from "express";
import routes from "./routes";
import { NotFoundError } from "./core/ApiError";
import { handleGlobalException } from "./middlewares/handlerGlobalException";
import { LIMIT_SIZE_REQUEST } from "./constants";
import { setupSwagger } from "./swagger";

const app = express();
app.use(express.json({ limit: LIMIT_SIZE_REQUEST }));
app.use(
  express.urlencoded({
    limit: LIMIT_SIZE_REQUEST,
    extended: true,
    parameterLimit: 50000,
  }),
);

app.use('/api', routes)
setupSwagger(app);

// Catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Global Error Handler Middleware
app.use(handleGlobalException);

export default app;