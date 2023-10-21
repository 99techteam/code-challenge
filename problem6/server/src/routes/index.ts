import express from "express";
const router = express.Router();

import authRouter from "./auth.route";
import userRouter from "./user.route";

import { API_V1_USER } from "../constant/apis";
import { API_V1_AUTH } from "../constant/apis";

router.use(API_V1_AUTH.mainPath, authRouter);
router.use(API_V1_USER.mainPath, userRouter);

export default router;
