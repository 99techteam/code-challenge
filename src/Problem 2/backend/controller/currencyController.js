import {
  getExchangeRate,
  getUniqueCurrencies,
} from "../models/currencyModel.js";

export const convertCurrency = async (req, res) => {
  const { amount, from, to } = req.query;

  if (!amount || !from || !to) {
    return res
      .status(400)
      .json({ error: "Missing parameters: amount, from, or to" });
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  try {
    const { fromPrice, toPrice, timestamp } = await getExchangeRate(from, to);
    const convertedAmount = (numAmount * fromPrice) / toPrice;

    res.json({
      from,
      to,
      amount: numAmount,
      converted: Number(convertedAmount.toFixed(6)),
      fromPrice,
      toPrice,
      timestamp,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const getCurrencies = async (req, res) => {
  try {
    const currencies = await getUniqueCurrencies();
    res.json({ currencies });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch currency list" });
  }
};
