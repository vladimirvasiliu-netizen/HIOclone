import { OrderPlatform } from '../../common/enums/order-platform.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { UnifiedOrder } from '../../common/interfaces/unified-order.interface';
import { BoltFoodOrderPayload } from './dto/bolt-order-payload.dto';

/**
 * Traduce statusul specific Bolt Food in statusul unificat intern.
 * TODO: ajusteaza cheile din stanga cu valorile reale trimise de Bolt Food
 * odata ce ai acces la documentatia de partener.
 */
const BOLT_FOOD_STATUS_MAP: Record<string, OrderStatus> = {
  NEW: OrderStatus.NEW,
  CONFIRMED: OrderStatus.ACCEPTED,
  PREPARING: OrderStatus.IN_PREPARATION,
  READY: OrderStatus.READY_FOR_PICKUP,
  COURIER_PICKED_UP: OrderStatus.PICKED_UP,
  DELIVERED: OrderStatus.DELIVERED,
  CANCELLED: OrderStatus.CANCELLED,
  REJECTED: OrderStatus.REJECTED,
};

export class BoltFoodMapper {
  static toUnifiedOrder(payload: BoltFoodOrderPayload): UnifiedOrder {
    return {
      platform: OrderPlatform.BOLT_FOOD,
      externalOrderId: payload.orderId,
      status: BOLT_FOOD_STATUS_MAP[payload.status] ?? OrderStatus.NEW,
      customerName: payload.customer?.name,
      customerPhone: payload.customer?.phone,
      deliveryAddress: payload.deliveryAddress,
      totalPrice: payload.totalPrice,
      currency: payload.currency,
      items: payload.items.map((item) => ({
        externalId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        notes: item.comment,
      })),
      rawPayload: payload as unknown as Record<string, unknown>,
      placedAt: new Date(payload.createdAt),
    };
  }

  /** Traduce statusul unificat inapoi in formatul asteptat de Bolt Food. */
  static fromUnifiedStatus(status: OrderStatus): string {
    const entry = Object.entries(BOLT_FOOD_STATUS_MAP).find(
      ([, value]) => value === status,
    );
    return entry ? entry[0] : status;
  }
}
