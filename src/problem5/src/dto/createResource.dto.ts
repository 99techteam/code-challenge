import { IsNotEmpty, IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateResourceDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(255, { message: 'Name must be 255 characters or less' })
  name!: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description must not be empty' })
  description!: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MaxLength(100, { message: 'Category must be 100 characters or less' })
  category?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
} 