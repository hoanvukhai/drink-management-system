import { PartialType } from '@nestjs/mapped-types';
import { CreateConsumptionTrackingDto } from './create-consumption-tracking.dto';

export class UpdateConsumptionTrackingDto extends PartialType(CreateConsumptionTrackingDto) {}
