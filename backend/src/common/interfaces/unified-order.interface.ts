import { OrderPlatform } from '../enums/order-platform.enum';
import { OrderStatus } from '../enums/order-status.enum';

export interface UnifiedOrderItem {
  externalId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

/**
 * Formatul intern, comun, in care orice comanda venita de la
 * Bolt Food sau Glovo este transformata inainte de a fi salvata.
 * Restul aplicatiei (service, controller, frontend) lucreaza
 * doar cu acest format - nu stie nimic despre payload-urile brute.
 */
export interface UnifiedOrder {
  platform: OrderPlatform;
  externalOrderId: string;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  totalPrice: number;
  currency: string;
  items: UnifiedOrderItem[];
  rawPayload: Record<string, unknown>;
  placedAt: Date;
  /** Estimare a momentului livrarii - optionala, nu toate platformele o ofera direct */
  estimatedDeliveryAt?: Date;
}
