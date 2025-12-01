import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ConsumptionReason } from './create-consumption-tracking.dto';

export class QueryConsumptionDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ConsumptionReason)
  reason?: ConsumptionReason;
}
