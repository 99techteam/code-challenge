import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SwapDto {
  @IsString()
  @IsNotEmpty()
  fromToken: string;

  @IsString()
  @IsNotEmpty()
  toToken: string;

  @IsNumber()
  @Min(0.000001)
  amount: number;
}
