import type { Order, OrderPlatform, OrderStatus } from '../types/order';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface OrdersFilter {
  platform?: OrderPlatform;
  status?: OrderStatus;
}

export async function getOrders(filter: OrdersFilter = {}): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filter.platform) params.set('platform', filter.platform);
  if (filter.status) params.set('status', filter.status);

  const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Nu am putut incarca comenzile (status ${response.status})`);
  }
  return response.json();
}

export async function getOrder(id: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`);
  if (!response.ok) {
    throw new Error(`Nu am putut incarca comanda (status ${response.status})`);
  }
  return response.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`Nu am putut actualiza statusul (status ${response.status})`);
  }
  return response.json();
}
