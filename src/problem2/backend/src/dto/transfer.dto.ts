import { IsString, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  recipientWalletAddress: string;

  @IsString()
  @IsNotEmpty()
  tokenSymbol: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
