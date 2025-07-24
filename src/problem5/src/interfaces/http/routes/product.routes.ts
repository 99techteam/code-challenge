import { Router } from 'express';

import { ProductController } from '../controllers/product.controller';
import { validateProductId } from '../middlewares/validate-product-id.middleware';
import { validateCreateProduct } from '../middlewares/validate-create-product.middleware';
import { validateUpdateProduct } from '../middlewares/validate-update-product.middleware';

import { ProductUseCases } from '@/application/product/use-cases/product.usecase';
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories/prisma-product.repository';
import { prisma } from '@/infrastructure/database/prisma/client';
import { ProductCache } from '@/infrastructure/cache/redis-product.cache';
import { redisCache } from '@/infrastructure/cache';

const router = Router();

const productCache = new ProductCache(redisCache);
const repository = new PrismaProductRepository(prisma, productCache);
const service = new ProductUseCases(repository);
const controller = new ProductController(service);

/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 */
router.get('/', controller.getAll);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags:
 *       - Products
 */
router.get('/:id', validateProductId, controller.getById);

/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 */
router.post('/', validateCreateProduct, controller.create);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags:
 *       - Products
 */
router.put('/:id', validateProductId, validateUpdateProduct, controller.update);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 */
router.delete('/:id', validateProductId, controller.remove);

export { router as productRouter };
