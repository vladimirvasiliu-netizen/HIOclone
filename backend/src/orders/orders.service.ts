import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { UnifiedOrder } from '../common/interfaces/unified-order.interface';
import { QueryOrdersDto } from './dto/query-orders.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  findAll(query: QueryOrdersDto): Promise<Order[]> {
    return this.ordersRepository.find({
      where: {
        ...(query.platform ? { platform: query.platform } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      order: { placedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Comanda cu id ${id} nu a fost gasita`);
    }
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepository.save(order);
  }

  /**
   * Primeste o comanda deja normalizata (UnifiedOrder) de la orice
   * integrare (Bolt Food, Glovo, sau una viitoare) si o salveaza.
   * Daca exact aceeasi comanda (platform + externalOrderId) exista deja,
   * doar actualizeaza statusul si payload-ul brut, in loc sa creeze duplicat.
   */
  async upsertFromUnifiedOrder(unifiedOrder: UnifiedOrder): Promise<Order> {
    const existing = await this.ordersRepository.findOne({
      where: {
        platform: unifiedOrder.platform,
        externalOrderId: unifiedOrder.externalOrderId,
      },
    });

    if (existing) {
      existing.status = unifiedOrder.status;
      existing.rawPayload = unifiedOrder.rawPayload;
      if (unifiedOrder.estimatedDeliveryAt) {
        existing.estimatedDeliveryAt = unifiedOrder.estimatedDeliveryAt;
      }
      const saved = await this.ordersRepository.save(existing);
      this.logger.log(
        `Comanda existenta actualizata: ${saved.platform}/${saved.externalOrderId} -> ${saved.status}`,
      );
      return saved;
    }

    const items = unifiedOrder.items.map((item) =>
      this.orderItemsRepository.create({
        externalId: item.externalId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes,
      }),
    );

    const newOrder = this.ordersRepository.create({
      platform: unifiedOrder.platform,
      externalOrderId: unifiedOrder.externalOrderId,
      status: unifiedOrder.status,
      customerName: unifiedOrder.customerName,
      customerPhone: unifiedOrder.customerPhone,
      deliveryAddress: unifiedOrder.deliveryAddress,
      totalPrice: unifiedOrder.totalPrice,
      currency: unifiedOrder.currency,
      rawPayload: unifiedOrder.rawPayload,
      placedAt: unifiedOrder.placedAt,
      estimatedDeliveryAt: unifiedOrder.estimatedDeliveryAt,
      items,
    });

    const saved = await this.ordersRepository.save(newOrder);
    this.logger.log(
      `Comanda noua salvata: ${saved.platform}/${saved.externalOrderId}`,
    );
    return saved;
  }
}
