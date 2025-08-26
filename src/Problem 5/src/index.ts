import express, { Request, Response } from "express";
import mongoose from "mongoose";
import productRoutes from "./routes/productRoutes";

const app = express();
const port = 4000;
app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: "http://localhost:5178" }));

mongoose
  .connect("mongodb://localhost:27017/curdproduct")
  .then(() => console.log("✅ Connected to MongoDB successfully!"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB:", err));

app.use("/api", productRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
