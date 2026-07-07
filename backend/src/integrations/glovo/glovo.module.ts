import { Module } from '@nestjs/common';
import { OrdersModule } from '../../orders/orders.module';
import { GlovoClient } from './glovo.client';
import { GlovoService } from './glovo.service';
import { GlovoController } from './glovo.controller';

@Module({
  imports: [OrdersModule],
  controllers: [GlovoController],
  providers: [GlovoClient, GlovoService],
  exports: [GlovoClient, GlovoService],
})
export class GlovoModule {}
