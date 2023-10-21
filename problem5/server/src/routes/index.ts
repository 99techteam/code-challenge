import express from "express";
const router = express.Router();

import productRouter from "./product.route";

import { API_V1_PRODUCT } from "../constant/apis";

router.use(API_V1_PRODUCT.root, productRouter);

export default router;
