import { useState, useEffect, useCallback } from 'react';
import { getOrdersByStatus, updateOrderStatus } from '@/lib/supabase';
import { Order } from '@/type';

export interface FrontDeskOrder extends Order {
  tableNumber?: number;
  roomName?: string;
  customerName?: string;
  waitTime?: number;
  id: string; // Override to ensure id is available
}

export const useFrontDeskOrders = () => {
  const [orders, setOrders] = useState<FrontDeskOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders ready for payment
  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await getOrdersByStatus('ready');

      // Transform orders with additional data
      const transformedOrders: FrontDeskOrder[] = data.map((order: any) => ({
        ...order,
        id: order.id,
        $id: order.id,
        status: order.status,
        total: order.total_amount,
        placed_at: order.created_at,
        // Add table/room info if available
        tableNumber: order.table?.table_number,
        roomName: order.room?.name,
        customerName: order.customer?.full_name || 'Guest',
        // Calculate wait time
        waitTime: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60)), // minutes
      }));

      setOrders(transformedOrders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark order as paid
  const markOrderPaid = useCallback(async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'paid');
      // Refresh orders
      await fetchOrders();
    } catch (err: any) {
      throw new Error(`Failed to mark order as paid: ${err.message}`);
    }
  }, [fetchOrders]);

  // Get financial summary
  const getFinancialSummary = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order =>
      new Date(order.placed_at) >= today
    );

    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = todayOrders.length;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    return {
      totalRevenue,
      orderCount,
      averageOrderValue,
      pendingPayments: orders.length,
    };
  }, [orders]);

  // Initial fetch and polling
  useEffect(() => {
    fetchOrders();

    // Poll every 30 seconds for new orders
    const interval = setInterval(fetchOrders, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    markOrderPaid,
    getFinancialSummary,
    refreshOrders: fetchOrders,
  };
};