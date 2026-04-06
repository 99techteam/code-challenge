import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { TaskStatus } from "../../domain/value-objects/task-status.vo";
import { TaskPriority } from "../../domain/value-objects/task-priority.vo";

export enum SortField {
  TITLE = "title",
  STATUS = "status",
  PRIORITY = "priority",
  DUE_DATE = "dueDate",
  CREATED_AT = "createdAt",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class QueryTaskDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `status must be one of: ${Object.values(TaskStatus).join(", ")}`,
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: `priority must be one of: ${Object.values(TaskPriority).join(", ")}`,
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(SortField)
  sort_by?: SortField = SortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  @Transform(({ value }) => (value as string)?.toUpperCase())
  sort_order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
