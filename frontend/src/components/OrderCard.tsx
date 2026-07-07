import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../types/order';
import { PlatformBadge } from './PlatformBadge';
import { StatusBadge } from './StatusBadge';

const STATUS_OPTIONS: OrderStatus[] = [
  'NEW',
  'ACCEPTED',
  'IN_PREPARATION',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
  'REJECTED',
];

const STATUS_OPTION_LABELS: Record<OrderStatus, string> = {
  NEW: 'Noua',
  ACCEPTED: 'Acceptata',
  IN_PREPARATION: 'In preparare',
  READY_FOR_PICKUP: 'Gata de ridicare',
  PICKED_UP: 'Ridicata de curier',
  DELIVERED: 'Livrata',
  CANCELLED: 'Anulata',
  REJECTED: 'Respinsa',
};

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={order.platform} />
          <span className="text-xs text-slate-400">#{order.externalOrderId}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 space-y-0.5 text-sm text-slate-600">
        {order.customerName && <p className="font-medium text-slate-800">{order.customerName}</p>}
        {order.customerPhone && <p>{order.customerPhone}</p>}
        {order.deliveryAddress && <p className="text-slate-500">{order.deliveryAddress}</p>}
        {order.estimatedDeliveryAt && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-orange-600">
            Livrare estimată:{' '}
            {new Date(order.estimatedDeliveryAt).toLocaleTimeString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      <ul className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-slate-700">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span className="text-slate-500">{item.unitPrice} {order.currency}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="font-semibold text-slate-800">
          Total: {order.totalPrice} {order.currency}
        </span>

        <div className="flex items-center gap-3">
          <Link
            to={`/orders/${order.id}`}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Vezi detalii &rarr;
          </Link>

          <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-50"
          value={order.status}
          disabled={isUpdating}
          onChange={handleStatusChange}
        >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_OPTION_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
