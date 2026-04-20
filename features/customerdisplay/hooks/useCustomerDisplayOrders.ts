import { useState, useEffect, useCallback } from 'react';
import { getOrdersByStatus } from '@/lib/supabase';
import { Order } from '@/type';

export interface CustomerDisplayOrder extends Order {
  id: string;
  status: Order['status'];
  total: number;
  placed_at: string;
  items?: any[];
  customerName?: string;
  orderNumber: string; // Short order ID for display
  estimatedReadyTime?: string;
  isUrgent?: boolean;
}

export const useCustomerDisplayOrders = () => {
  const [orders, setOrders] = useState<CustomerDisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all active orders (not cancelled or paid)
  const fetchOrders = useCallback(async () => {
    try {
      setError(null);

      // Fetch orders in different statuses
      const [pendingOrders, preparingOrders, readyOrders] = await Promise.all([
        getOrdersByStatus('pending'),
        getOrdersByStatus('preparing'),
        getOrdersByStatus('ready'),
      ]);

      const allOrders = [...pendingOrders, ...preparingOrders, ...readyOrders];

      // Transform orders for display
      const transformedOrders: CustomerDisplayOrder[] = allOrders.map((order: any) => {
        const placedTime = new Date(order.created_at);
        const now = new Date();
        const waitTimeMinutes = Math.floor((now.getTime() - placedTime.getTime()) / (1000 * 60));

        // Estimate ready time based on status and wait time
        let estimatedReadyTime = '';
        if (order.status === 'pending') {
          estimatedReadyTime = `${Math.max(5, 15 - waitTimeMinutes)} min`;
        } else if (order.status === 'preparing') {
          estimatedReadyTime = `${Math.max(2, 10 - waitTimeMinutes)} min`;
        } else if (order.status === 'ready') {
          estimatedReadyTime = 'Ready!';
        }

        return {
          ...order,
          id: order.id,
          $id: order.id,
          status: order.status,
          total: order.total_amount,
          placed_at: order.created_at,
          customerName: order.customer?.full_name || 'Guest',
          orderNumber: order.id.slice(-4).toUpperCase(), // Last 4 chars as order number
          estimatedReadyTime,
          isUrgent: waitTimeMinutes > 20 && order.status !== 'ready',
          items: order.order_items || [],
        };
      });

      // Sort by urgency: ready first, then by wait time
      transformedOrders.sort((a, b) => {
        if (a.status === 'ready' && b.status !== 'ready') return -1;
        if (b.status === 'ready' && a.status !== 'ready') return 1;

        const aWait = new Date().getTime() - new Date(a.placed_at).getTime();
        const bWait = new Date().getTime() - new Date(b.placed_at).getTime();
        return bWait - aWait; // Longest wait first
      });

      setOrders(transformedOrders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Group orders by status for display
  const getOrdersByStatusGroup = useCallback(() => {
    return {
      ready: orders.filter(o => o.status === 'ready'),
      preparing: orders.filter(o => o.status === 'preparing'),
      pending: orders.filter(o => o.status === 'pending'),
    };
  }, [orders]);

  // Get stats for display
  const getDisplayStats = useCallback(() => {
    const groups = getOrdersByStatusGroup();
    return {
      totalOrders: orders.length,
      readyCount: groups.ready.length,
      preparingCount: groups.preparing.length,
      pendingCount: groups.pending.length,
      urgentCount: orders.filter(o => o.isUrgent).length,
    };
  }, [orders, getOrdersByStatusGroup]);

  // Initial fetch and polling
  useEffect(() => {
    fetchOrders();

    // Poll every 15 seconds for TV display (more frequent updates)
    const interval = setInterval(fetchOrders, 15000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    getOrdersByStatusGroup,
    getDisplayStats,
    refreshOrders: fetchOrders,
  };
};