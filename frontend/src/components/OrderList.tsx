import type { Order, OrderStatus } from '../types/order';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderList({ orders, onStatusChange }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        Nu exista comenzi pentru filtrele selectate.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}
