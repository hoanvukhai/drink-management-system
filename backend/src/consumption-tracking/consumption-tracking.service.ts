import { Injectable } from '@nestjs/common';
import { CreateConsumptionTrackingDto } from './dto/create-consumption-tracking.dto';
import { UpdateConsumptionTrackingDto } from './dto/update-consumption-tracking.dto';

@Injectable()
export class ConsumptionTrackingService {
  create(createConsumptionTrackingDto: CreateConsumptionTrackingDto) {
    return 'This action adds a new consumptionTracking';
  }

  findAll() {
    return `This action returns all consumptionTracking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} consumptionTracking`;
  }

  update(id: number, updateConsumptionTrackingDto: UpdateConsumptionTrackingDto) {
    return `This action updates a #${id} consumptionTracking`;
  }

  remove(id: number) {
    return `This action removes a #${id} consumptionTracking`;
  }
}
