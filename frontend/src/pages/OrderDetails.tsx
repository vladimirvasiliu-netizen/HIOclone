import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../api/ordersApi';
import type { Order } from '../types/order';
import { PlatformBadge } from '../components/PlatformBadge';
import { StatusBadge } from '../components/StatusBadge';

export default function OrderDetails() {
  // Citeste ":id" din URL (ex. /orders/abc -> id = "abc")
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
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
              <StatusBadge status={order.status} />
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

            <div className="mt-4 border-t border-slate-100 pt-3 text-right font-semibold text-slate-800">
              Total: {order.totalPrice} {order.currency}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
