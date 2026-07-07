import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { SimulatorService } from './simulator.service';
import { SimulatorController } from './simulator.controller';

@Module({
  imports: [OrdersModule],
  controllers: [SimulatorController],
  providers: [SimulatorService],
})
export class SimulatorModule {}
