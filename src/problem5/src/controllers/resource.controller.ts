import { NextFunction, Request, Response } from 'express'
import { CreateResourceDto, FindManyQuery, ResourceResponseDto, UpdateResourceDto } from '../dtos/resource.dto'
import { ResourceService } from '../services/resource.service'
import * as respond from '../utils/response'

export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const dto = req.body as CreateResourceDto
    const resource = await this.resourceService.create(dto)
    respond.created(res, ResourceResponseDto.from(resource as never))
  }

  findById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const resource = await this.resourceService.findById(req.params.id as string)
    respond.ok(res, ResourceResponseDto.from(resource as never))
  }

  findMany = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const query = req.query as unknown as FindManyQuery
    const result = await this.resourceService.findMany(query)
    respond.ok(res, {
      ...result,
      data: result.data.map((r) => ResourceResponseDto.from(r as never)),
    })
  }

  update = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const dto = req.body as UpdateResourceDto
    const resource = await this.resourceService.update(req.params.id as string, dto)
    respond.ok(res, ResourceResponseDto.from(resource as never))
  }

  delete = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.resourceService.delete(req.params.id as string)
    res.status(204).send()
  }
}
