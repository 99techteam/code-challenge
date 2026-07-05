import { Request, Response } from 'express';
import { IProductService } from '../service/interfaces';
import { asyncHandler } from '../middleware/async-handler';
import { toProductDTO, toProductListDTO } from '../dto/mapper';
import { ProductFilter } from '../model/product';

export class ProductController {
  constructor(private readonly productService: IProductService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.productService.create(req.body);
    res.status(201).json({ code: 'success', data: toProductDTO(product) });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query as unknown as ProductFilter;
    const result = await this.productService.list(filter);
    const dto = toProductListDTO(result.products, result.total);
    res.json({
      code: 'success',
      data: dto.products,
      meta: {
        total: dto.total,
        page: filter.page,
        limit: filter.limit,
      },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.productService.getById(req.params.id);
    res.json({ code: 'success', data: toProductDTO(product) });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.productService.update(req.params.id, req.body);
    res.json({ code: 'success', data: toProductDTO(product) });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.productService.delete(req.params.id);
    res.status(204).send();
  });
}
