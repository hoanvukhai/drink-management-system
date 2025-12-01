import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateStockTakeDto } from './create-stock-take.dto';

export class UpdateStockTakeDto extends PartialType(
  OmitType(CreateStockTakeDto, ['createdById'] as const),
) {}
