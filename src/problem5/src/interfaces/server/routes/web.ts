/* eslint-disable @typescript-eslint/no-var-requires */
import * as express from "express";
import {
  StoreUserInformationHandler,
  LoginUserHandler
} from "../handler";

export function web(): express.Router {
  return express
    .Router()
    .post("/login",LoginUserHandler)
    .post("/register",StoreUserInformationHandler);
}
