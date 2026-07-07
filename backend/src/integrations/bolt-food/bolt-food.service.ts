import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../../orders/orders.service';
import { BoltFoodClient } from './bolt-food.client';
import { BoltFoodMapper } from './bolt-food.mapper';

/**
 * Bolt Food (in varianta placeholder) nu are un webhook garantat,
 * asa ca folosim polling: la interval fix, intrebam API-ul lor
 * de comenzi noi si le salvam prin OrdersService.
 * Intervalul e configurabil din BOLT_FOOD_POLL_INTERVAL_MS.
 */
@Injectable()
export class BoltFoodService {
  private readonly logger = new Logger(BoltFoodService.name);

  constructor(
    private readonly boltFoodClient: BoltFoodClient,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.startPolling();
  }

  private startPolling() {
    const intervalMs = this.configService.get<number>(
      'boltFood.pollIntervalMs',
      30_000,
    );

    const interval = setInterval(() => {
      this.pollNewOrders().catch((error) =>
        this.logger.error('Eroare in ciclul de polling Bolt Food', error),
      );
    }, intervalMs);

    this.schedulerRegistry.addInterval('bolt-food-polling', interval);
    this.logger.log(`Polling Bolt Food activ, interval: ${intervalMs}ms`);
  }

  async pollNewOrders(): Promise<void> {
    const payloads = await this.boltFoodClient.fetchNewOrders();
    for (const payload of payloads) {
      const unifiedOrder = BoltFoodMapper.toUnifiedOrder(payload);
      await this.ordersService.upsertFromUnifiedOrder(unifiedOrder);
    }
  }
}
