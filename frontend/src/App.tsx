import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from './hooks/useOrders';
import { updateOrderStatus } from './api/ordersApi';
import { useAuth } from './context/AuthContext';
import { FilterBar } from './components/FilterBar';
import { OrderList } from './components/OrderList';
import { SimulatorControls } from './components/SimulatorControls';
import type { OrderPlatform, OrderStatus } from './types/order';

export default function App() {
  const [platform, setPlatform] = useState<OrderPlatform | undefined>(undefined);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const { orders, isLoading, error, refetch } = useOrders({ platform, status });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await refetch();
  };

  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Comenzi Bolt Food & Glovo
            </h1>
            <p className="text-sm text-slate-500">
              Dashboard unificat de comenzi din livrare
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SimulatorControls />
            {newOrdersCount > 0 && (
              <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
                {newOrdersCount} comenzi noi
              </span>
            )}
            {user && <span className="text-sm text-slate-500">{user.email}</span>}
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Deconectare
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <FilterBar
            platform={platform}
            status={status}
            onPlatformChange={setPlatform}
            onStatusChange={setStatus}
          />
          <button
            onClick={() => refetch()}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Reincarca
          </button>
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
      </main>
    </div>
  );
}
