import express from "express";
import {
  convertCurrency,
  getCurrencies,
} from "../controller/currencyController.js";

const router = express.Router();

router.get("/convert", convertCurrency);
router.get("/currencies", getCurrencies);

export default router;
