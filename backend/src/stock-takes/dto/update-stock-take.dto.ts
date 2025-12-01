import { PartialType } from '@nestjs/mapped-types';
import { CreateStockTakeDto } from './create-stock-take.dto';

export class UpdateStockTakeDto extends PartialType(CreateStockTakeDto) {}
