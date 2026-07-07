import { useCallback, useEffect, useState } from 'react';
import { getOrders, OrdersFilter } from '../api/ordersApi';
import type { Order } from '../types/order';

const POLL_INTERVAL_MS = 5000;

export function useOrders(filter: OrdersFilter) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(filter);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscuta');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.platform, filter.status]);

  useEffect(() => {
    setIsLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}
