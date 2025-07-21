import { IsOptional, IsString, IsBoolean, IsNumberString, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryResourceDto {
  @IsOptional()
  @IsString({ message: 'Name filter must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Category filter must be a string' })
  category?: string;

  @IsOptional()
  @Transform(({ value }: { value: any }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isActive filter must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Offset must be a number' })
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;
} 