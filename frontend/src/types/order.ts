export type OrderPlatform = 'BOLT_FOOD' | 'GLOVO';

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'IN_PREPARATION'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItem {
  id: string;
  externalId?: string;
  name: string;
  quantity: number;
  unitPrice: string | number;
  notes?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  platform: OrderPlatform;
  externalOrderId: string;
  status: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  totalPrice: string | number;
  deliveryFee: string | number;
  currency: string;
  items: OrderItem[];
  placedAt: string;
  estimatedDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
}
