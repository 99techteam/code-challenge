import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";

import express from "express";
// Security
import helmet from "helmet";
import cors from "cors";
// Extension
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";

const app = express();
import notFoundMid from "./src/middleware/notfound.middleware";
import errorHandlerMid from "./src/middleware/errorhandler.middleware";
import routerApi from "./src/routes";
import "./src/db/initDB";

app.set("trust proxy", 1);
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(helmet());
app.use(compression());
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//API Service
app.use("/", routerApi);
app.use(errorHandlerMid);
app.use("/**", notFoundMid);
export default app;
