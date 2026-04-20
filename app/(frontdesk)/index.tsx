import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFrontDeskOrders } from '@/features/frontdesk/hooks/useFrontDeskOrders';
import { useFrontDeskStore } from '@/features/frontdesk/stores/frontdesk.store';
import { FinancialTicker } from '@/features/frontdesk/components/FinancialTicker';
import { OrderCard } from '@/features/frontdesk/components/OrderCard';

export default function FrontDeskScreen() {
  const {
    orders,
    loading,
    error,
    markOrderPaid,
    refreshOrders,
  } = useFrontDeskOrders();

  const {
    selectedOrderId,
    selectOrder,
    showFinancialTicker,
    toggleFinancialTicker,
  } = useFrontDeskStore();

  const [refreshing, setRefreshing] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const handleMarkPaid = async (orderId: string) => {
    try {
      setProcessingOrderId(orderId);
      await markOrderPaid(orderId);

      Alert.alert(
        '✓ Payment Processed',
        'Order has been marked as paid successfully.',
        [{ text: 'OK' }]
      );

      // Deselect if this was selected
      if (selectedOrderId === orderId) {
        selectOrder(null);
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err.message || 'Failed to process payment');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <OrderCard
      order={item}
      onMarkPaid={handleMarkPaid}
      isSelected={selectedOrderId === item.id}
      onSelect={selectOrder}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Pressable style={styles.retryButton} onPress={refreshOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🏪 Front Desk</Text>
          <Text style={styles.subtitle}>Payment Processing</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={[styles.toggleButton, showFinancialTicker && styles.toggleButtonActive]}
            onPress={toggleFinancialTicker}
          >
            <Text style={styles.toggleButtonText}>
              {showFinancialTicker ? '📊' : '📈'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Financial Ticker */}
      {showFinancialTicker && <FinancialTicker />}

      {/* Orders List */}
      <View style={styles.ordersSection}>
        <View style={styles.ordersHeader}>
          <Text style={styles.ordersTitle}>
            💳 Ready for Payment ({orders.length})
          </Text>
          <Pressable style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>🔄</Text>
          </Pressable>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>✅</Text>
            <Text style={styles.emptyStateText}>No orders ready for payment</Text>
            <Text style={styles.emptyStateSubtext}>
              Orders will appear here when they're ready to be paid
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#FE8C00']}
              />
            }
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
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
  },
  headerActions: {
    flexDirection: 'row',
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  toggleButtonActive: {
    backgroundColor: '#FE8C00',
  },
  toggleButtonText: {
    fontSize: 16,
  },
  ordersSection: {
    flex: 1,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 16,
  },
  ordersList: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});