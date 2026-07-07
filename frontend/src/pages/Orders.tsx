import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { updateOrderStatus } from '../api/ordersApi';
import { FilterBar } from '../components/FilterBar';
import { OrderList } from '../components/OrderList';
import { SimulatorControls } from '../components/SimulatorControls';
import { ProviderMixControl } from '../components/ProviderMixControl';
import type { OrderPlatform, OrderStatus } from '../types/order';

export default function Orders() {
  const [platform, setPlatform] = useState<OrderPlatform | undefined>(undefined);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);

  const { orders, isLoading, error, refetch } = useOrders({ platform, status });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await refetch();
  };

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          platform={platform}
          status={status}
          onPlatformChange={setPlatform}
          onStatusChange={setStatus}
        />
        <div className="flex items-center gap-3">
          <SimulatorControls />
          {newOrdersCount > 0 && (
            <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
              {newOrdersCount} comenzi noi
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Reincarca
          </button>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <ProviderMixControl />
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
        <OrderList orders={orders} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
