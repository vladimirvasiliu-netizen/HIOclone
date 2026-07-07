import { OrderPlatform } from '../../common/enums/order-platform.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { UnifiedOrder } from '../../common/interfaces/unified-order.interface';
import { GlovoWebhookPayload } from './dto/glovo-webhook-payload.dto';

/**
 * TODO: ajusteaza cheile din stanga cu valorile reale trimise de Glovo
 * odata ce ai acces la documentatia de partener.
 */
const GLOVO_STATUS_MAP: Record<string, OrderStatus> = {
  PENDING: OrderStatus.NEW,
  ACCEPTED: OrderStatus.ACCEPTED,
  IN_PROGRESS: OrderStatus.IN_PREPARATION,
  READY_FOR_PICKUP: OrderStatus.READY_FOR_PICKUP,
  PICKED_UP: OrderStatus.PICKED_UP,
  DELIVERED: OrderStatus.DELIVERED,
  CANCELLED: OrderStatus.CANCELLED,
  REJECTED: OrderStatus.REJECTED,
};

export class GlovoMapper {
  static toUnifiedOrder(payload: GlovoWebhookPayload): UnifiedOrder {
    return {
      platform: OrderPlatform.GLOVO,
      externalOrderId: payload.order_id,
      status: GLOVO_STATUS_MAP[payload.order_status] ?? OrderStatus.NEW,
      customerName: payload.customer?.name,
      customerPhone: payload.customer?.phone_number,
      deliveryAddress: payload.delivery_address,
      totalPrice: payload.order_total_price,
      deliveryFee: payload.delivery_fee ?? 0,
      currency: payload.currency_code,
      items: payload.order_items.map((item) => ({
        externalId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        notes: item.notes,
      })),
      rawPayload: payload as unknown as Record<string, unknown>,
      placedAt: new Date(payload.placed_at),
    };
  }

  /** Traduce statusul unificat inapoi in formatul asteptat de Glovo. */
  static fromUnifiedStatus(status: OrderStatus): string {
    const entry = Object.entries(GLOVO_STATUS_MAP).find(
      ([, value]) => value === status,
    );
    return entry ? entry[0] : status;
  }
}
