import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import itemRoutes from "./routes/item.routes";
import { config } from "./config/dotenv.config";

dotenv.config();

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use("/api/items", itemRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
