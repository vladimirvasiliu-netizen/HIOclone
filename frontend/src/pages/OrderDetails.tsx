import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api/ordersApi';
import type { Order, OrderStatus } from '../types/order';
import { PlatformBadge } from '../components/PlatformBadge';
import { StatusBadge } from '../components/StatusBadge';
import { allowedActions, STATUS_LABELS } from '../lib/orderTransitions';

export default function OrderDetails() {
  // Citeste ":id" din URL (ex. /orders/abc -> id = "abc")
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const applyStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrder(updated);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getOrder(id)
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Eroare necunoscuta'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/orders" className="text-sm text-blue-600 hover:underline">
        &larr; Inapoi la comenzi
      </Link>

      <div className="mt-4">
        {isLoading && (
          <div className="flex h-48 items-center justify-center text-slate-400">
            Se incarca comanda...
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && order && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={order.platform} />
                <span className="text-sm text-slate-400">#{order.externalOrderId}</span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={order.status} />
                {allowedActions(order.status)
                  .filter((action) => action.variant === 'danger')
                  .map((action) => (
                    <button
                      key={action.status}
                      onClick={() => applyStatus(action.status)}
                      disabled={isUpdating}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm text-slate-600">
              {order.customerName && (
                <p className="text-base font-medium text-slate-800">{order.customerName}</p>
              )}
              {order.customerPhone && <p>{order.customerPhone}</p>}
              {order.deliveryAddress && <p className="text-slate-500">{order.deliveryAddress}</p>}
              <p className="text-slate-500">
                Plasata: {new Date(order.placedAt).toLocaleString('ro-RO')}
              </p>
              {order.estimatedDeliveryAt && (
                <p className="font-medium text-orange-600">
                  Livrare estimata:{' '}
                  {new Date(order.estimatedDeliveryAt).toLocaleString('ro-RO')}
                </p>
              )}
            </div>

            <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
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

            <div className="mt-4 space-y-0.5 border-t border-slate-100 pt-3 text-right">
              <p className="text-sm text-slate-500">
                Cost livrare: {order.deliveryFee} {order.currency}
              </p>
              <p className="font-semibold text-slate-800">
                Total: {order.totalPrice} {order.currency}
                <span className="ml-1 font-normal text-slate-400">
                  ({(Number(order.totalPrice) + Number(order.deliveryFee)).toFixed(2)}{' '}
                  {order.currency} cu livrare)
                </span>
              </p>
            </div>

            {/* Istoric status: ora fiecarei tranzitii */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
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

            {/* Panou de control status - butonul de progres (anularea e sus-dreapta). */}
            {(() => {
              const actions = allowedActions(order.status);
              if (actions.length === 0) {
                return (
                  <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-400">
                    Comanda este intr-o stare finala. Nu mai sunt actiuni disponibile.
                  </p>
                );
              }
              const primaryActions = actions.filter((action) => action.variant === 'primary');
              return (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {primaryActions.map((action) => (
                    <button
                      key={action.status}
                      onClick={() => applyStatus(action.status)}
                      disabled={isUpdating}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
