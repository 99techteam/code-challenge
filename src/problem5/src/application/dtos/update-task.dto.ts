import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsDateString,
} from "class-validator";
import { TaskStatus } from "../../domain/value-objects/task-status.vo";
import { TaskPriority } from "../../domain/value-objects/task-priority.vo";

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  @IsDateString()
  dueDate?: string;
}
