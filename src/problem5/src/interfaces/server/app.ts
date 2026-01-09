/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Application } from "express";
import { auth, web } from "./routes";
import { corsMiddleware } from "./middleware/CorsMiddlewere";
import * as Logger from "../../utils";
const bodyParser = require("body-parser");
const expressPinoLogger = require("express-pino-logger");
const helmet = require("helmet");
const xss = require("xss-clean");

export function app(corsOrigin: string): Application {
  return express()
    .enable("trust proxy") // Get the remote client's IP address
    .use(helmet()) // set security HTTP headers
    .use(express.json()) // parse json request body
    .use(express.urlencoded({ extended: true }))
    .use(xss())
    .use(corsMiddleware(corsOrigin))
    .use(
      expressPinoLogger({
        logger: Logger.instance,
      }),
    )
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(web()) // this is for free middleware
    .use(auth()); // inside the middleware
}
