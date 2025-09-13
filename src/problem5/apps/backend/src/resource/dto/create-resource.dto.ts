import { IsString } from '@nestjs/class-validator';

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
