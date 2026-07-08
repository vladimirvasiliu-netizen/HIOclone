import type { Order } from '../types/order';
import { PlatformBadge } from './PlatformBadge';
import { StatusBadge } from './StatusBadge';
import { isInProgress } from '../lib/orderTransitions';

interface OrderTableProps {
  orders: Order[];
  selectedId?: string;
  onSelect: (order: Order) => void;
}

export function OrderTable({ orders, selectedId, onSelect }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
        Nu exista comenzi pentru filtrele selectate.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[44rem] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-2 font-medium">ID</th>
            <th className="px-4 py-2 font-medium">Client</th>
            <th className="px-4 py-2 font-medium">Platforma</th>
            <th className="px-4 py-2 text-right font-medium">Valoare</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Creata</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const selected = order.id === selectedId;
            return (
              <tr
                key={order.id}
                onClick={() => onSelect(order)}
                className={`cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 ${
                  selected ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-2.5 text-slate-500">
                  <span className="flex items-center gap-2">
                    {isInProgress(order.status) && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-amber-400"
                        title="Necesita actualizare status"
                      />
                    )}
                    #{order.externalOrderId}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-800">{order.customerName ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <PlatformBadge platform={order.platform} />
                </td>
                <td className="px-4 py-2.5 text-right text-slate-700">
                  {order.totalPrice} {order.currency}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {new Date(order.placedAt).toLocaleString('ro-RO')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
