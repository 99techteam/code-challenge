import express from "express";
import cors from "cors";
import taskRoutes from "@/routes/tesk.route.js";
import taskEventRoutes from "@/routes/task_event.route.js"
import taskTagRoutes from "@/routes/task_tag.route.js"
import { errorHandler } from "./errors/http.error.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", taskRoutes); // tasks
app.use("/", taskEventRoutes); // events
app.use("/", taskTagRoutes); // tasks/:id/tags

app.use(errorHandler);
export default app;