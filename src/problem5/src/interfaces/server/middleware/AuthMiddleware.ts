import * as express from "express";
import { config } from "dotenv";
import * as jwt from 'jsonwebtoken';
import { asyncMiddleware } from "./AsyncMiddleware";
import * as Logger from "../../../utils";

config();

const jwtSecretKey = process.env.APP_KEY as string;

const authUsername = process.env.AUTH_USERNAME as string;
const authPassword = process.env.AUTH_PASSWORD as string;

export const authMiddleware: express.Handler = asyncMiddleware(async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const [authType, credentials] = (req.headers.authorization as string).split(" ");

      switch (authType.toLowerCase()) {
      case "bearer":
        try {
          const tokenVerify   = jwt.verify(credentials, jwtSecretKey);
          req.body.authUser = tokenVerify;
          req.body.isLogin  = true;
          next();
        } catch (error) {
          res.status(401).json({ error: 'Invalid token' });
        }
        break;
      case "basic":
        // Base64 encoded string → decode to ascii
        const decoded = Buffer.from(credentials, "base64").toString("ascii");
        const [username, password] = decoded.split(":");

        // check username and password is correct
        if (username && password && username == authUsername && password == authPassword) {
          req.body.isLogin  = true;
          next();
        } else {
          res.status(401).json({ error: 'Invalid authentication' });
        }
        break;
      default:
        break;
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      Logger.instance.error(e.message);
      res.status(401).json({
        message: e.message,
      });
    } else {
      Logger.instance.error("Unknown error occurred.");
    }
    res.status(500);
  }
});
