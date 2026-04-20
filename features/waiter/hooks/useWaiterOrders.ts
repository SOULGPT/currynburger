import { useEffect, useState } from 'react';
import { getOrdersForTable, getOrdersByStatus } from '@/lib/supabase';

interface Order {
  id: string;
  table_id: string;
  room_id: string;
  user_id: string;
  order_type: 'dinein' | 'pickup' | 'delivery';
  order_source: 'app' | 'waiter' | 'desk';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  total_amount: number;
  notes: string;
  created_at: string;
  order_items: any[];
}

export const useWaiterOrders = (tableId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedOrders = [];

        if (tableId) {
          // Get orders for specific table
          fetchedOrders = await getOrdersForTable(tableId);
        } else {
          // Get all pending orders for waiter view
          fetchedOrders = await getOrdersByStatus('pending');
        }

        setOrders(fetchedOrders as Order[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Refresh every 5 seconds for simpler implementation
    // TODO: Replace with Supabase real-time subscriptions
    const interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);
  }, [tableId]);

  const getTableOrderStatus = () => {
    if (!orders || orders.length === 0) return 'empty';
    if (orders.some((o) => o.status === 'ready')) return 'ready';
    if (orders.some((o) => o.status === 'preparing')) return 'preparing';
    return 'occupied';
  };

  return {
    orders,
    loading,
    error,
    getTableOrderStatus,
  };
};

// Hook to track active orders by status
export const useOrdersByStatus = (status: 'pending' | 'preparing' | 'ready' | 'served') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedOrders = await getOrdersByStatus(status);
        setOrders(fetchedOrders as Order[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Refresh every 3 seconds
    const interval = setInterval(loadOrders, 3000);

    return () => clearInterval(interval);
  }, [status]);

  return { orders, loading, error };
};
