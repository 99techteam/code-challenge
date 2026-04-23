import cors from "cors";
import express from "express";
import { resourceRouter } from "./routes/resourceRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/resources", resourceRouter);

app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);
