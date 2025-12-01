import { Module } from '@nestjs/common';
import { ConsumptionTrackingService } from './consumption-tracking.service';
import { ConsumptionTrackingController } from './consumption-tracking.controller';

@Module({
  controllers: [ConsumptionTrackingController],
  providers: [ConsumptionTrackingService],
})
export class ConsumptionTrackingModule {}
