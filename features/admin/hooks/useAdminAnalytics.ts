import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '../stores/admin.store';

export const useAdminAnalytics = (timeRange: 'today' | 'week' | 'month') => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Fetch orders within date range
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_order,
            menu_item_id,
            menu_items (
              name
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) throw new Error(ordersError.message);

      // Calculate basic stats
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'paid').length || 0;
      const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;

      // Calculate top items
      const itemStats: Record<string, { count: number; revenue: number }> = {};

      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const itemName = item.menu_items?.name || 'Unknown Item';
          const quantity = item.quantity || 0;
          const price = item.price_at_order || 0;

          if (!itemStats[itemName]) {
            itemStats[itemName] = { count: 0, revenue: 0 };
          }

          itemStats[itemName].count += quantity;
          itemStats[itemName].revenue += quantity * price;
        });
      });

      const topItems = Object.entries(itemStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate hourly stats
      const hourlyStats: Record<number, { orders: number; revenue: number }> = {};

      orders?.forEach(order => {
        const hour = new Date(order.created_at).getHours();
        if (!hourlyStats[hour]) {
          hourlyStats[hour] = { orders: 0, revenue: 0 };
        }
        hourlyStats[hour].orders += 1;
        hourlyStats[hour].revenue += order.total_amount || 0;
      });

      const hourlyStatsArray = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        orders: hourlyStats[hour]?.orders || 0,
        revenue: hourlyStats[hour]?.revenue || 0,
      }));

      // Calculate daily stats (for week/month view)
      const dailyStats: Record<string, { orders: number; revenue: number }> = {};

      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { orders: 0, revenue: 0 };
        }
        dailyStats[date].orders += 1;
        dailyStats[date].revenue += order.total_amount || 0;
      });

      const dailyStatsArray = Object.entries(dailyStats)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const analyticsData: DashboardStats = {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        topItems,
        hourlyStats: hourlyStatsArray,
        dailyStats: dailyStatsArray,
      };

      setStats(analyticsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    loading,
    error,
    refreshAnalytics: fetchAnalytics,
  };
};