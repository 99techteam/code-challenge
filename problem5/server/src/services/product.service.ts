import { productModel } from "../models";
import { Request, Response } from "express";
import { IProduct, IQuery } from "../interface";
import { ProductRepository } from "../repositories";
import { BadRequestError, NotFoundError } from "../core/error.response";

export default class ProductService {
  static async createProduct(req: Request, res: Response) {
    const payload = req.body as IProduct;
    const newProduct = await productModel.create(payload);
    return newProduct;
  }

  static async getProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const Product = await ProductRepository.getProduct(productId);
    if (!Product) throw new NotFoundError("Sản phẩm không tồn tại");
    return Product;
  }

  static async getAllProducts(req: Request, res: Response) {
    const { limit, page } = req.query as unknown as IQuery;
    const products = await ProductRepository.getAllProducts(limit, page);
    return products;
  }

  static async updateProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const payload = req.body;
    const productUpdated = await ProductRepository.updateProduct(
      productId,
      payload
    );
    if (!productUpdated)
      throw new NotFoundError("Không tìm thấy sản phẩm để cập nhật");
    return productUpdated;
  }

  static async deleteProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const productDeleted = await ProductRepository.deleteProduct(productId);
    if (!productDeleted)
      throw new NotFoundError("Không tìm thấy sản phẩm để xóa");
    return productDeleted;
  }
}

// module.exports = ProductService;
