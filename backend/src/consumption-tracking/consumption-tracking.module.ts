import { Module } from '@nestjs/common';
import { ConsumptionTrackingService } from './consumption-tracking.service';
import { ConsumptionTrackingController } from './consumption-tracking.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConsumptionTrackingController],
  providers: [ConsumptionTrackingService],
  exports: [ConsumptionTrackingService],
})
export class ConsumptionTrackingModule {}
