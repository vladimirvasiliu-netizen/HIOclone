import type { OrderStatus } from '../types/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Noua',
  ACCEPTED: 'Acceptata',
  IN_PREPARATION: 'In preparare',
  READY_FOR_PICKUP: 'Gata de ridicare',
  PICKED_UP: 'Ridicata de curier',
  DELIVERED: 'Livrata',
  CANCELLED: 'Anulata',
  REJECTED: 'Respinsa',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-indigo-100 text-indigo-700',
  IN_PREPARATION: 'bg-amber-100 text-amber-700',
  READY_FOR_PICKUP: 'bg-purple-100 text-purple-700',
  PICKED_UP: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-200 text-slate-600',
  REJECTED: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
