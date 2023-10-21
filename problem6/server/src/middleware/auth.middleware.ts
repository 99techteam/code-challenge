import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";
import { UnauthenticatedError } from "../core/error.response";
import { env } from "process";

const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) throw new UnauthenticatedError("Invalid credential AT");

  console.log(accessToken);

  const SECRET_KEY_TOKEN = env.SECRET_KEY_TOKEN || "";

  const payload = JWT.verify(accessToken.split(" ")[1], SECRET_KEY_TOKEN);
  console.log("payload:::", payload);

  req.app.locals.user = payload;

  next();
};

export { authentication };
