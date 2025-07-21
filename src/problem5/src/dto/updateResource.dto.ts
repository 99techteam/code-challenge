import { IsNotEmpty, IsString, IsBoolean, IsOptional, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class UpdateResourceDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty when provided' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(255, { message: 'Name must be 255 characters or less' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Description cannot be empty when provided' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description must not be empty' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MaxLength(100, { message: 'Category must be 100 characters or less' })
  category?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  // Custom validation to ensure at least one field is provided
  @ValidateIf(o => !o.name && !o.description && !o.category && o.isActive === undefined)
  @IsNotEmpty({ message: 'At least one field must be provided for update' })
  _atLeastOneField?: any;
} 