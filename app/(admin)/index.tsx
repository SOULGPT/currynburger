import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAdminStore } from '@/features/admin/stores/admin.store';
import { useAdminAnalytics } from '@/features/admin/hooks/useAdminAnalytics';
import { StatsCard } from '@/features/admin/components/StatsCard';
import { BarChart } from '@/features/admin/components/BarChart';

export default function AdminDashboardScreen() {
  const {
    selectedTimeRange,
    setTimeRange,
    loading,
    setLoading,
  } = useAdminStore();

  const { stats, loading: analyticsLoading, error, refreshAnalytics } = useAdminAnalytics(selectedTimeRange);

  const timeRangeOptions = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ] as const;

  const handleRefresh = async () => {
    setLoading(true);
    await refreshAnalytics();
    setLoading(false);
  };

  // Prepare chart data
  const topItemsChartData = stats?.topItems.map(item => ({
    label: item.name.split(' ')[0], // First word only for space
    value: item.count,
    color: '#10B981',
  })) || [];

  const hourlyChartData = stats?.hourlyStats
    .filter(hour => hour.orders > 0)
    .slice(-12) // Last 12 hours
    .map(hour => ({
      label: `${hour.hour}:00`,
      value: hour.orders,
      color: '#3B82F6',
    })) || [];

  if (analyticsLoading && !stats) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Pressable style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏢 Admin Dashboard</Text>
        <Text style={styles.subtitle}>Curry & Burger Analytics</Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {timeRangeOptions.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === option.key && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(option.key)}
          >
            <Text
              style={[
                styles.timeRangeText,
                selectedTimeRange === option.key && styles.timeRangeTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#FE8C00']}
          />
        }
      >
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <StatsCard
              title="Total Revenue"
              value={stats?.totalRevenue || 0}
              icon="💰"
              color="#10B981"
            />
            <StatsCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              icon="📦"
              color="#3B82F6"
            />
            <StatsCard
              title="Avg Order Value"
              value={stats?.averageOrderValue || 0}
              icon="📈"
              color="#8B5CF6"
            />
            <StatsCard
              title="Completed Orders"
              value={stats?.completedOrders || 0}
              subtitle={`${stats?.pendingOrders || 0} pending`}
              icon="✅"
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Top Items Chart */}
        {topItemsChartData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Top Selling Items</Text>
            <BarChart
              data={topItemsChartData}
              title="Items Sold"
              height={250}
            />
          </View>
        )}

        {/* Hourly Activity Chart */}
        {hourlyChartData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕐 Hourly Activity</Text>
            <BarChart
              data={hourlyChartData}
              title="Orders by Hour"
              height={200}
            />
          </View>
        )}

        {/* Order Status Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Order Status</Text>
          <View style={styles.statusGrid}>
            <StatsCard
              title="Completed"
              value={stats?.completedOrders || 0}
              icon="✅"
              color="#10B981"
            />
            <StatsCard
              title="Pending"
              value={stats?.pendingOrders || 0}
              icon="⏳"
              color="#F59E0B"
            />
            <StatsCard
              title="Cancelled"
              value={stats?.cancelledOrders || 0}
              icon="❌"
              color="#EF4444"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dashboard last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FE8C00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FE8C00',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});