import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OrdersService } from '../orders/orders.service';
import { OrderPlatform } from '../common/enums/order-platform.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { UnifiedOrder, UnifiedOrderItem } from '../common/interfaces/unified-order.interface';
import {
  SIMULATED_CUSTOMER_NAMES,
  SIMULATED_MENU_ITEMS,
  SIMULATED_STREETS,
  pickRandom,
  randomInt,
} from './simulated-data';

const MIN_DELAY_MS = 8_000;
const MAX_DELAY_MS = 18_000;
const MIN_DELIVERY_MINUTES = 25;
const MAX_DELIVERY_MINUTES = 55;

/**
 * Genereaza comenzi false, dar plauzibile (nume, adrese, produse cu preturi
 * reale de meniu), utile pentru a testa dashboard-ul inainte de a avea
 * acces la API-urile reale Bolt Food / Glovo. NU trimite nimic catre
 * platformele externe - scrie direct in baza de date, prin OrdersService,
 * exact ca si cum comanda ar fi venit printr-o integrare reala.
 */
@Injectable()
export class SimulatorService {
  private readonly logger = new Logger(SimulatorService.name);
  private isRunning = false;
  private timeoutHandle: NodeJS.Timeout | null = null;
  private generatedCount = 0;
  /** Procentul de comenzi generate pentru Glovo (0-100). Bolt Food = 100 - glovoShare. */
  private glovoShare = 50;

  constructor(private readonly ordersService: OrdersService) {}

  status() {
    return {
      isRunning: this.isRunning,
      generatedCount: this.generatedCount,
      mix: { glovo: this.glovoShare, boltFood: 100 - this.glovoShare },
    };
  }

  /**
   * Seteaza distributia comenzilor generate. Primeste procentul pentru Glovo;
   * Bolt Food primeste automat restul, ca suma sa fie mereu 100.
   */
  setMix(glovoPercent: number) {
    this.glovoShare = Math.max(0, Math.min(100, Math.round(glovoPercent)));
    this.logger.log(
      `Distributie comenzi: Glovo ${this.glovoShare}% / Bolt Food ${100 - this.glovoShare}%`,
    );
    return this.status();
  }

  start() {
    if (this.isRunning) {
      return this.status();
    }
    this.isRunning = true;
    this.logger.log('Simulator de comenzi pornit');
    this.scheduleNext();
    return this.status();
  }

  stop() {
    this.isRunning = false;
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    this.logger.log('Simulator de comenzi oprit');
    return this.status();
  }

  private scheduleNext() {
    if (!this.isRunning) return;

    const delay = randomInt(MIN_DELAY_MS, MAX_DELAY_MS);
    this.timeoutHandle = setTimeout(() => {
      this.generateOrder()
        .catch((error) => this.logger.error('Eroare la generarea unei comenzi simulate', error))
        .finally(() => this.scheduleNext());
    }, delay);
  }

  private async generateOrder(): Promise<void> {
    // Alegere ponderata: cu cat glovoShare e mai mare, cu atat mai multe Glovo.
    const platform =
      randomInt(1, 100) <= this.glovoShare
        ? OrderPlatform.GLOVO
        : OrderPlatform.BOLT_FOOD;
    const itemCount = randomInt(1, 4);
    const items: UnifiedOrderItem[] = Array.from({ length: itemCount }).map(() => {
      const menuItem = pickRandom(SIMULATED_MENU_ITEMS);
      return {
        name: menuItem.name,
        unitPrice: menuItem.price,
        quantity: randomInt(1, 3),
      };
    });

    const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const placedAt = new Date();
    const estimatedDeliveryAt = new Date(
      placedAt.getTime() + randomInt(MIN_DELIVERY_MINUTES, MAX_DELIVERY_MINUTES) * 60_000,
    );

    const unifiedOrder: UnifiedOrder = {
      platform,
      externalOrderId: `SIM-${platform}-${randomUUID().slice(0, 8)}`,
      status: OrderStatus.NEW,
      customerName: pickRandom(SIMULATED_CUSTOMER_NAMES),
      customerPhone: `07${randomInt(10000000, 99999999)}`,
      deliveryAddress: pickRandom(SIMULATED_STREETS),
      totalPrice,
      currency: 'RON',
      items,
      rawPayload: { simulated: true, generatedAt: placedAt.toISOString() },
      placedAt,
      estimatedDeliveryAt,
    };

    await this.ordersService.upsertFromUnifiedOrder(unifiedOrder);
    this.generatedCount += 1;
  }
}
