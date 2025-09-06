import { Module, Provider } from '@nestjs/common'
import { DatabaseModule } from '@problem5/database'

import { ProductService } from './application'
import { PRODUCT_REPOSITORY, PRODUCT_SERVICE, ProductPrismaRepository } from './infras'
import { ProductsController } from './products.controller'

const services: Provider[] = [{ provide: PRODUCT_SERVICE, useClass: ProductService }]

const repositories: Provider[] = [{ provide: PRODUCT_REPOSITORY, useClass: ProductPrismaRepository }]

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [...services, ...repositories],
  exports: [PRODUCT_SERVICE, PRODUCT_REPOSITORY],
})
export class ProductModule {}
