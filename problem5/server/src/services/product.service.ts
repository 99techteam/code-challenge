import { productModel } from "../models";
import { Request, Response } from "express";
import { IProduct, IQuery } from "../interface";
import { ProductRepository } from "../repositories";
import { NotFoundError } from "../core/error.response";

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
    const Products = await ProductRepository.getAllProducts(limit, page);
    return Products;
  }

  static async updateProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const payload = req.body;
    const ProductUpdated = await ProductRepository.updateProduct(
      productId,
      payload
    );
    if (!ProductUpdated)
      throw new NotFoundError("Không tìm thấy sản phẩm để cập nhật");
    return ProductUpdated;
  }

  static async deleteProduct(req: Request, res: Response) {
    const { productId } = req.params;
    const ProductDeleted = await ProductRepository.deleteProduct(productId);
    if (!ProductDeleted)
      throw new NotFoundError("Không tìm thấy sản phẩm để xóa");
    return ProductDeleted;
  }
}
