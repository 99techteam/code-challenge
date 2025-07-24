import type { Request, Response } from 'express';

import type { ProductUseCases } from '@/application/product/use-cases/product.usecase';
import type { CreateProductDTO } from '@/application/product/dtos/create-product.dto';
import type { UpdateProductDTO } from '@/application/product/dtos/update-product.dto';
import { logger } from '@/infrastructure/logging/logger';
import type { PaginationParams } from '@/shared/types/pagination';

export class ProductController {
  constructor(private readonly productUseCases?: ProductUseCases) {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  getAll = async (req: Request, res: Response) => {
    if (!this.productUseCases) {
      logger.error('ProductUseCases is undefined');
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const page = parseInt(req.query.page as string) || 1;

      const params: PaginationParams = { page, limit };
      const result = await this.productUseCases.getAll(params);

      return res.status(200).json({
        data: result.data,
        pagination: {
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Failed to get products:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  getById = async (req: Request, res: Response) => {
    if (!this.productUseCases) {
      logger.error('ProductUseCases is undefined');
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      const { id } = req.params;
      const product = await this.productUseCases.get(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.status(200).json(product);
    } catch (error) {
      logger.error('Failed to get product by id:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response) => {
    if (!this.productUseCases) {
      logger.error('ProductUseCases is undefined');
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      const dto: CreateProductDTO = req.body;
      const created = await this.productUseCases.create(dto);
      return res.status(201).json(created);
    } catch (error) {
      logger.error('Failed to create product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  update = async (req: Request, res: Response) => {
    if (!this.productUseCases) {
      logger.error('ProductUseCases is undefined');
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      const { id } = req.params;
      const dto: UpdateProductDTO = req.body;
      const updated = await this.productUseCases.update(id, dto);
      return res.status(200).json(updated);
    } catch (error) {
      logger.error('Failed to update product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  remove = async (req: Request, res: Response) => {
    if (!this.productUseCases) {
      logger.error('ProductUseCases is undefined');
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      const { id } = req.params;
      await this.productUseCases.delete(id);
      return res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
