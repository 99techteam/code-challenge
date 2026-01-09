/* eslint-disable @typescript-eslint/no-var-requires */
import * as express from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware';

import {
  GetAllUserInformationHandler,
  GetUserInformationByIdHandler,
  UpdateUserInformationHandler,
  DeleteUserInformationByIdHandler
} from '../handler';

export function auth(): express.Router {
  return express
    .Router()
    .use(authMiddleware)
    .get("/", (req: express.Request, res: express.Response) => {
      const name = "Hello";
      if (req) {
        // console.log(req.body);
      }
      return res.json({ hello: name });
    })
    .get("/user/all", GetAllUserInformationHandler)
    .get("/user/:userId",GetUserInformationByIdHandler)
    .put("/user/:userId",UpdateUserInformationHandler)
    .delete("/user/:userId",DeleteUserInformationByIdHandler);
}
