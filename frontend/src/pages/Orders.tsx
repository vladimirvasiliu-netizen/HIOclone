import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { updateOrderStatus } from '../api/ordersApi';
import { FilterBar } from '../components/FilterBar';
import { OrderTable } from '../components/OrderTable';
import { OrderDetailPanel } from '../components/OrderDetailPanel';
import { SimulatorControls } from '../components/SimulatorControls';
import type { OrderPlatform, OrderStatus } from '../types/order';

export default function Orders() {
  const [platform, setPlatform] = useState<OrderPlatform | undefined>(undefined);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const { orders, isLoading, error, refetch } = useOrders({ platform, status });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await refetch();
  };

  // Cautare dupa numele clientului sau ID-ul comenzii (peste rezultatele filtrate).
  const query = search.trim().toLowerCase();
  const visibleOrders = query
    ? orders.filter(
        (o) =>
          o.externalOrderId.toLowerCase().includes(query) ||
          (o.customerName ?? '').toLowerCase().includes(query),
      )
    : orders;

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;

  // Comanda selectata pentru panou (cautata in toate comenzile, dupa id).
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cauta dupa client sau ID..."
            className="w-56 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <FilterBar
            platform={platform}
            status={status}
            onPlatformChange={setPlatform}
            onStatusChange={setStatus}
          />
        </div>
        <div className="flex items-center gap-3">
          <SimulatorControls />
          <Link
            to="/fleets"
            title="Regleaza proportia Glovo / Bolt Food (pagina Flote)"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Distributie comenzi
            <span aria-hidden>→</span>
          </Link>
          {newOrdersCount > 0 && (
            <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
              {newOrdersCount} comenzi noi
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-slate-400">
          Se incarca comenzile...
        </div>
      ) : (
        <OrderTable
          orders={visibleOrders}
          selectedId={selectedId}
          onSelect={(order) => setSelectedId(order.id)}
        />
      )}

      <OrderDetailPanel
        order={selectedOrder}
        onClose={() => setSelectedId(undefined)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
