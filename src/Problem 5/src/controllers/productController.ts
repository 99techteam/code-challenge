import { Request, Response } from "express";
import Product, { IProduct } from "../models/productModel";

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Received body:", req.body);
  const { name, stock_quantity, price, discount, image } = req.body;
  if (!name || !stock_quantity || !price) {
    console.log("Missing fields:", {
      name,
      stock_quantity,
      price,
      image,
    });
    res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
    return;
  }
  const product = await Product.create(req.body);
  res.status(200).json({
    success: product ? true : false,
    data: product ? product : "Product not created",
  });
};

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { priceRange } = req.query;

    let query: any = {};

    if (priceRange) {
      switch (priceRange.toString().toLowerCase()) {
        case "<40":
          query.price = { $lt: 40 };
          break;
        case "40-80":
          query.price = { $gte: 40, $lte: 80 };
          break;
        case ">80":
          query.price = { $gt: 80 };
          break;
        default:
          break;
      }
    }

    const products = await Product.find(query);
    res.status(200).json({
      success: products.length > 0,
      data: products.length > 0 ? products : "No products found",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new Error("Missing product ID");
  const product = await Product.findById(id);
  res.status(200).json({
    success: product ? true : false,
    data: product ? product : "Product not found",
  });
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, stock_quantity, price, discount, image } = req.body;
  if (!id) throw new Error("Missing product ID");
  if (!name || !stock_quantity || !price) {
    res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
    return;
  }
  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  res.status(200).json({
    success: product ? true : false,
    data: product ? product : "Product not found",
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new Error("Missing product ID");
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    res.status(200).json({
      success: false,
      message: "Product not found",
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
};
