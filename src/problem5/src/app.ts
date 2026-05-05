import express from "express";
import userRoutes from "./routes/user.routes";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());
app.use(logger);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/users", userRoutes);

app.use(errorHandler);
export default app;
