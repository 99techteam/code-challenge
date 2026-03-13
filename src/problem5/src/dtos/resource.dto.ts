import { Expose, instanceToPlain } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ResourceStatus } from '../entities/resource.entity'

export class ResourceResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  status: ResourceStatus

  @Expose({ name: 'created_at' })
  createdAt: Date

  @Expose({ name: 'updated_at' })
  updatedAt: Date

  static from(resource: Record<string, unknown>): Record<string, unknown> {
    const dto = Object.assign(new ResourceResponseDto(), resource)
    return instanceToPlain(dto, { excludeExtraneousValues: true })
  }
}

export class CreateResourceDto {
  @IsString()
  name: string

  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus
}

export class FindManyQuery {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus
}
