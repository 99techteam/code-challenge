import { Router } from 'express'
import { ResourceController } from '../controllers/resource.controller'
import { CreateResourceDto, FindManyQuery, UpdateResourceDto } from '../dtos/resource.dto'
import { validateDto } from '../middlewares/validate'

export function createResourceRouter(controller: ResourceController): Router {
  const router = Router()

  router.post('/', validateDto(CreateResourceDto), controller.create)
  router.get('/', validateDto(FindManyQuery, 'query'), controller.findMany)
  router.get('/:id', controller.findById)
  router.patch('/:id', validateDto(UpdateResourceDto), controller.update)
  router.delete('/:id', controller.delete)

  return router
}
