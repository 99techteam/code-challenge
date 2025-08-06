import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import productRoutes from "./routes/productRoutes";
import { swaggerDocs } from "./docs/swagger";

dotenv.config();
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use("/products", productRoutes);

// Swagger docs
swaggerDocs(app);

// Health check
app.get("/healthz", (_, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;