import { Module } from '@nestjs/common';
import { OrdersModule } from '../../orders/orders.module';
import { BoltFoodClient } from './bolt-food.client';
import { BoltFoodService } from './bolt-food.service';

@Module({
  imports: [OrdersModule],
  providers: [BoltFoodClient, BoltFoodService],
  exports: [BoltFoodClient, BoltFoodService],
})
export class BoltFoodModule {}
