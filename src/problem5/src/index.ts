import express from "express";
import config from "./config";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// --- Middleware ---
app.use(express.json());

// --- Routes ---
app.get("/", (_req, res) => {
  res.json({ message: "Todo API is running", version: "1.0.0" });
});
app.use(registerRoutes());

// --- Error handling (must be last) ---
app.use(errorHandler);

// --- Start server ---
app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});

export default app;
