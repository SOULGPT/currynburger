import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useCustomerDisplayOrders } from '@/features/customerdisplay/hooks/useCustomerDisplayOrders';
import { StatsHeader } from '@/features/customerdisplay/components/StatsHeader';
import { OrderStatusCard } from '@/features/customerdisplay/components/OrderStatusCard';

const { width, height } = Dimensions.get('window');

export default function CustomerDisplayScreen() {
  const {
    orders,
    loading,
    error,
    getOrdersByStatusGroup,
    getDisplayStats,
    refreshOrders,
  } = useCustomerDisplayOrders();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const stats = getDisplayStats();
  const statusGroups = getOrdersByStatusGroup();

  // Create sections for display
  const sections = [
    {
      title: '🚀 Ready for Collection',
      data: statusGroups.ready,
      color: '#10B981',
      priority: 1,
    },
    {
      title: '👨‍🍳 Being Prepared',
      data: statusGroups.preparing,
      color: '#F59E0B',
      priority: 2,
    },
    {
      title: '📋 Order Received',
      data: statusGroups.pending,
      color: '#6B7280',
      priority: 3,
    },
  ];

  const renderSection = ({ item: section }: { item: any }) => (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { backgroundColor: section.color }]}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionCount}>({section.data.length})</Text>
      </View>

      {section.data.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No orders in this status</Text>
        </View>
      ) : (
        <FlatList
          data={section.data}
          keyExtractor={(order) => order.id}
          renderItem={({ item, index }) => (
            <OrderStatusCard order={item} index={index} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ordersList}
          style={styles.horizontalList}
        />
      )}
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading order status...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Text style={styles.retryText}>Retrying automatically...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Stats Header */}
      <StatsHeader stats={stats} />

      {/* Orders Sections */}
      <FlatList
        data={sections}
        keyExtractor={(section) => section.title}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sectionsContainer}
        style={styles.mainList}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for choosing Curry & Burger! 🍛🍔
        </Text>
        <Text style={styles.footerSubtext}>
          Screen refreshes automatically • Last updated: {currentTime.toLocaleTimeString()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#D1D5DB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sectionsContainer: {
    padding: 8,
  },
  mainList: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.9,
  },
  emptySection: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
  },
  ordersList: {
    paddingHorizontal: 8,
  },
  horizontalList: {
    maxHeight: 280, // Fixed height for consistent display
  },
  footer: {
    backgroundColor: '#1F2937',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});