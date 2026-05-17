import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { buildWhere } from "../helpers/filter.helper";

export const productService = {
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },

  async findAll(validated: Record<string, unknown>) {
    const { page, limit, ...queryFields } = validated;
    const where = buildWhere<Prisma.ProductWhereInput>(
      queryFields as Record<string, Prisma.ProductWhereInput>
    );
    const skip = ((page as number) - 1) * (limit as number);

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit as number,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: page as number,
        limit: limit as number,
        totalPage: Math.ceil(total / (limit as number)) || 0,
      },
    };
  },

  async findById(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  },

  async update(id: number, data: Prisma.ProductUpdateInput) {
    await this.findById(id);
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: number) {
    await this.findById(id);
    await prisma.product.delete({ where: { id } });
  },
};
