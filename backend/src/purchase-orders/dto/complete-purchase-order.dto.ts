import { IsDateString, IsOptional } from 'class-validator';

export class CompletePurchaseOrderDto {
  @IsDateString()
  @IsOptional()
  receivedDate?: string;
}
