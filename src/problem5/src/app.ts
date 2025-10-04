import express, { Request, Response, NextFunction } from "express";
import router from "./routes";
import { ERROR_MESSAGE } from "./shared/constants";
import * as yup from "yup";
import morgan from "morgan";
import cors from "cors";
import { testDbConnection } from "./scripts/db-connection.test";
import { HTTPError } from "./shared/errors";
import { INTERNAL_SERVER_ERROR } from "http-status";

async function initApp() {
  const app = express()
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(
      process.env.NODE_ENV === "development"
        ? morgan("dev")
        : morgan("combined")
    )
    .use(cors());

  app.use(router);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // console.error(err);
    if (err instanceof yup.ValidationError) {
      res.status(400).json({
        message: "Validation error",
        details: err.errors,
      });
      return;
    }

    if (err instanceof HTTPError) {
      return res.status(err.statusCode || INTERNAL_SERVER_ERROR).json({
        message: err?.message || ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        details: err,
      });
    }

    return res.status(500).json({
      message: err?.message || ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
      details: err,
    });
  });

  await testDbConnection();

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
}

initApp();
