import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, OrderStatus } from '../types/order';
import { PlatformBadge } from './PlatformBadge';
import { StatusBadge } from './StatusBadge';
import { allowedActions, isInProgress } from '../lib/orderTransitions';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const applyStatus = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Pe card doar comenzile noi au actiuni (Accepta / Respinge).
  // Progresul de dupa acceptare se face din pagina de detalii a comenzii.
  const actions = order.status === 'NEW' ? allowedActions(order.status) : [];

  // Comenzile acceptate, dar nefinalizate, ies in evidenta: au nevoie de update ulterior.
  const inProgress = isInProgress(order.status);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
        inProgress ? 'border-l-4 border-l-amber-400' : ''
      }`}
    >
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
        <span className="flex flex-col leading-tight">
          <span className="text-xs text-slate-400">
            Livrare: {order.deliveryFee} {order.currency}
          </span>
          <span className="font-semibold text-slate-800">
            Total: {order.totalPrice} {order.currency}
            <span className="ml-1 font-normal text-slate-400">
              ({(Number(order.totalPrice) + Number(order.deliveryFee)).toFixed(2)} {order.currency}{' '}
              cu livrare)
            </span>
          </span>
        </span>
        <Link
          to={`/orders/${order.id}`}
          className={`text-xs font-medium hover:underline ${
            inProgress ? 'text-amber-600' : 'text-blue-600'
          }`}
        >
          {inProgress ? 'Actualizeaza status →' : 'Vezi detalii →'}
        </Link>
      </div>

      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.status}
              onClick={() => applyStatus(action.status)}
              disabled={isUpdating}
              className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${
                action.variant === 'primary'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
