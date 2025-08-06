import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ProductSchema } from "../schemas/productSchema";

const prisma = new PrismaClient();

export async function createProduct(req: Request, res: Response) {
  try {
    const parsed = ProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllProducts(_: Request, res: Response) {
  const products = await prisma.product.findMany();
  res.json(products);
}

export async function getProductById(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  product ? res.json(product) : res.status(404).json({ message: "Not found" });
}

export async function updateProduct(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const parsed = ProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  try {
    const updated = await prisma.product.update({ where: { id }, data: parsed.data });
    res.json(updated);
  } catch {
    res.status(404).json({ message: "Not found" });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.sendStatus(204);
  } catch {
    res.status(404).json({ message: "Not found" });
  }
}
