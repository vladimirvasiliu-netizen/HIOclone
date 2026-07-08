import { useState } from 'react';
import type { Order, OrderStatus } from '../types/order';
import { PlatformBadge } from './PlatformBadge';
import { StatusBadge } from './StatusBadge';
import { OrderStatusStepper } from './OrderStatusStepper';
import { allowedActions, STATUS_LABELS } from '../lib/orderTransitions';

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}

/**
 * Panou lateral (drawer) care se deschide la click pe un rand din tabel.
 * Arata detaliile comenzii, indicatorul de pasi si actiunile de status.
 */
export function OrderDetailPanel({ order, onClose, onStatusChange }: OrderDetailPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const actions = allowedActions(order.status);
  const primary = actions.find((a) => a.variant === 'primary');
  const danger = actions.find((a) => a.variant === 'danger');

  const apply = async (status: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30">
      {/* Fundal - click pentru inchidere */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panoul propriu-zis */}
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-2 border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <PlatformBadge platform={order.platform} />
            <span className="text-sm text-slate-400">#{order.externalOrderId}</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              title="Inchide"
            >
              ✕
            </button>
            <StatusBadge status={order.status} />
            {danger && (
              <button
                onClick={() => apply(danger.status)}
                disabled={isUpdating}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {danger.label}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="space-y-1 text-sm text-slate-600">
            {order.customerName && (
              <p className="text-base font-medium text-slate-800">{order.customerName}</p>
            )}
            {order.customerPhone && <p>{order.customerPhone}</p>}
            {order.deliveryAddress && <p className="text-slate-500">{order.deliveryAddress}</p>}
            <p className="text-slate-500">
              Plasata: {new Date(order.placedAt).toLocaleString('ro-RO')}
            </p>
          </div>

          <ul className="space-y-1 border-t border-slate-100 pt-3 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-slate-700">
                <span>
                  {item.quantity}x {item.name}
                  {item.notes && <span className="text-slate-400"> ({item.notes})</span>}
                </span>
                <span className="text-slate-500">
                  {item.unitPrice} {order.currency}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-0.5 border-t border-slate-100 pt-3 text-right">
            <p className="text-sm text-slate-500">
              Cost livrare: {order.deliveryFee} {order.currency}
            </p>
            <p className="font-semibold text-slate-800">
              Total: {order.totalPrice} {order.currency}
              <span className="ml-1 font-normal text-slate-400">
                ({(Number(order.totalPrice) + Number(order.deliveryFee)).toFixed(2)} {order.currency}{' '}
                cu livrare)
              </span>
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Progres comanda</h3>
            <div className="overflow-x-auto pb-1">
              <OrderStatusStepper status={order.status} />
            </div>
          </div>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Istoric status</h3>
              <ol className="space-y-2">
                {order.statusHistory.map((entry, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <span className="text-slate-700">{STATUS_LABELS[entry.status]}</span>
                    <span className="ml-auto text-xs text-slate-400">
                      {new Date(entry.at).toLocaleString('ro-RO')}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Actiunea "simuleaza urmatorul status" */}
        {primary ? (
          <div className="border-t border-slate-200 p-4">
            <button
              onClick={() => apply(primary.status)}
              disabled={isUpdating}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Simuleaza urmatorul status &rarr;
            </button>
          </div>
        ) : (
          !danger && (
            <div className="border-t border-slate-200 p-4 text-center text-sm text-slate-400">
              Comanda este intr-o stare finala.
            </div>
          )
        )}
      </div>
    </div>
  );
}
