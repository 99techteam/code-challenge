import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { productService } from "../services/product.service";
import { successResponse } from "../helpers/response.helper";

export const productController = {
  async create(req: Request, res: Response): Promise<void> {
    const data = req.validated;
    const product = await productService.create(
      data as Prisma.ProductCreateInput
    );
    successResponse(res, product, "Product created successfully", 201);
  },

  async findAll(req: Request, res: Response): Promise<void> {
    const data = req.validated;
    const result = await productService.findAll(data);
    successResponse(
      res,
      result.products,
      "Products retrieved successfully",
      200,
      result.pagination
    );
  },

  async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.validated;
    const product = await productService.findById(id as number);
    successResponse(res, product, "Product retrieved successfully", 200);
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id, ...updateData } = req.validated;
    const product = await productService.update(
      id as number,
      updateData as Prisma.ProductUpdateInput
    );
    successResponse(res, product, "Product updated successfully", 200);
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.validated;
    await productService.delete(id as number);
    successResponse(res, null, "Product deleted successfully", 200);
  },
};
