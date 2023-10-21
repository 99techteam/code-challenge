import express from "express";
const router = express.Router();

import UserRouter from "./User.route";

import { API_V1_User } from "../constant/apis";

router.use(API_V1_User.mainPath, UserRouter);

export default router;
