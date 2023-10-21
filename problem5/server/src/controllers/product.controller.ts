import { ProductService } from "../services";
import { Request, Response } from "express";
import { CREATED, OK } from "../core/success.response";

export default class ProductController {
  static async createProduct(req: Request, res: Response) {
    new CREATED({
      message: "Create Product successfully",
      metadata: await ProductService.createProduct(req, res),
    }).send(res);
  }
  static async getProduct(req: Request, res: Response) {
    new OK({
      message: "Get Product successfully",
      metadata: await ProductService.getProduct(req, res),
    }).send(res);
  }
  static async getAllProducts(req: Request, res: Response) {
    new OK({
      message: "Get all Products successfully",
      metadata: await ProductService.getAllProducts(req, res),
    }).send(res);
  }

  static async updateProduct(req: Request, res: Response) {
    new OK({
      message: "Update Product successfully",
      metadata: await ProductService.updateProduct(req, res),
    }).send(res);
  }
  static async deleteProduct(req: Request, res: Response) {
    new OK({
      message: "Delete Product successfully",
      metadata: await ProductService.deleteProduct(req, res),
    }).send(res);
  }
}
