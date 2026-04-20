import { useEffect, useState, useRef } from 'react';
import { getOrdersByStatus, updateOrderStatus } from '@/lib/supabase';

interface KitchenOrder {
  id: string;
  table_id?: string;
  room_id?: string;
  user_id: string;
  order_type: 'dinein' | 'pickup' | 'delivery';
  order_source: 'app' | 'waiter' | 'desk';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  total_amount: number;
  notes: string;
  created_at: string;
  order_items: any[];
}

interface OrderWithMetrics extends KitchenOrder {
  waitTimeSeconds: number;
  isUrgent: boolean;
  displayName: string;
}

type RefreshInterval = ReturnType<typeof setInterval>;

export const useKitchenOrders = () => {
  const [orders, setOrders] = useState<OrderWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<RefreshInterval | null>(null);

  const calculateMetrics = (order: KitchenOrder): OrderWithMetrics => {
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const waitTimeSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
    const isUrgent = waitTimeSeconds > 600; // Urgent if waiting > 10 minutes

    // Determine display name
    let displayName = '';
    if (order.table_id && order.table_id !== 'ASPORTO') {
      displayName = `Tavolo ${order.table_id}`;
    } else if (order.order_type === 'pickup') {
      displayName = `🥡 Asporto`;
    } else if (order.order_type === 'delivery') {
      displayName = `🚗 Delivery`;
    } else {
      displayName = order.table_id ? `Tavolo ${order.table_id}` : 'Order';
    }

    return {
      ...order,
      waitTimeSeconds,
      isUrgent,
      displayName,
    };
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load pending and preparing orders
      const [pendingOrders, preparingOrders] = await Promise.all([
        getOrdersByStatus('pending'),
        getOrdersByStatus('preparing'),
      ]);

      const allOrders = [...pendingOrders, ...preparingOrders] as KitchenOrder[];

      // Calculate metrics
      const ordersWithMetrics = allOrders.map(calculateMetrics);

      // Sort by wait time (oldest first)
      ordersWithMetrics.sort((a, b) => b.waitTimeSeconds - a.waitTimeSeconds);

      setOrders(ordersWithMetrics);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Poll for updates every 2 seconds
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      // Update wait times without full reload
      setOrders((prevOrders) =>
        prevOrders
          .map((order) => ({
            ...order,
            waitTimeSeconds: order.waitTimeSeconds + 2,
            isUrgent: order.waitTimeSeconds + 2 > 600,
          }))
          .sort((a, b) => b.waitTimeSeconds - a.waitTimeSeconds)
      );

      // Full refresh every 30 seconds
      const now = new Date();
      if (now.getSeconds() % 30 === 0) {
        loadOrders();
      }
    }, 2000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const markOrderReady = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'ready');
      // Update local state immediately
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      setError(err.message || 'Failed to mark order ready');
      throw err;
    }
  };

  const markOrderPreparing = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'preparing');
      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'preparing' } : o
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to mark order preparing');
      throw err;
    }
  };

  const getOrdersBySource = (source: 'all' | 'app' | 'waiter' | 'desk') => {
    if (source === 'all') return orders;
    return orders.filter((o) => o.order_source === source);
  };

  const formatWaitTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return {
    orders,
    loading,
    error,
    markOrderReady,
    markOrderPreparing,
    getOrdersBySource,
    formatWaitTime,
    refreshOrders: loadOrders,
  };
};
