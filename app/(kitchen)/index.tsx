import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { useKitchenOrders } from '@/features/kitchen/hooks/useKitchenOrders';
import { useKitchenStore } from '@/features/kitchen/stores/kitchen.store';
import { OrderCard } from '@/features/kitchen/components/OrderCard';
import { kitchenAudioService } from '@/features/kitchen/services/audioNotifications';

export default function KitchenDisplayScreen() {
  const {
    orders,
    loading,
    error,
    markOrderReady,
    getOrdersBySource,
    formatWaitTime,
  } = useKitchenOrders();
  const { selectedOrderId, selectOrder, filterSource, setFilterSource, isPaused, togglePause } =
    useKitchenStore();

  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  // Initialize audio service
  useEffect(() => {
    kitchenAudioService.initialize();
    return () => {
      kitchenAudioService.cleanup();
    };
  }, []);

  // Play chime when new urgent order appears
  useEffect(() => {
    const urgentOrders = orders.filter((o) => o.isUrgent);
    if (urgentOrders.length > 0) {
      // Play alert when urgent orders appear
      const hasNewUrgent = urgentOrders.some(
        (o) => !orders.some((prev) => prev.id === o.id && !prev.isUrgent)
      );
      if (hasNewUrgent) {
        kitchenAudioService.playUrgentAlert();
      }
    }
  }, [orders]);

  const handleMarkReady = async (orderId: string) => {
    try {
      setLoadingOrderId(orderId);
      await markOrderReady(orderId);

      // Play ready chime
      await kitchenAudioService.playChime();

      // Show success message
      Alert.alert(
        '✓ Ordine Pronto',
        'L\'ordine è stato contrassegnato come pronto.\nIl cameriere riceverà una notifica.',
        [{ text: 'OK' }]
      );

      // Deselect if this was selected
      if (selectedOrderId === orderId) {
        selectOrder(null);
      }
    } catch (err: any) {
      Alert.alert('Errore', err.message || 'Impossibile contrassegnare l\'ordine');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const visibleOrders = isPaused ? orders : getOrdersBySource(filterSource);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Caricamento ordini...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🍳 Cucina</Text>
          <Text style={styles.subtitle}>Display Ordini</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.orderCount}>{visibleOrders.length}</Text>
          <Text style={styles.orderCountLabel}>ordini</Text>
        </View>
      </View>

      {/* Controls Bar */}
      <View style={styles.controlsBar}>
        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {(['all', 'waiter', 'app', 'desk'] as const).map((source) => (
            <Pressable
              key={source}
              style={[
                styles.filterButton,
                filterSource === source && styles.filterButtonActive,
              ]}
              onPress={() => setFilterSource(source)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterSource === source && styles.filterButtonTextActive,
                ]}
              >
                {source === 'all' && '📋 Tutti'}
                {source === 'waiter' && '👨‍💼 Cameriere'}
                {source === 'app' && '📱 App'}
                {source === 'desk' && '🪑 Bancone'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Pause Button */}
        <Pressable
          style={[styles.pauseButton, isPaused && styles.pauseButtonActive]}
          onPress={togglePause}
        >
          <Text style={styles.pauseButtonText}>{isPaused ? '▶' : '⏸'}</Text>
        </Pressable>
      </View>

      {/* Status Bars */}
      <View style={styles.statusBars}>
        <View style={styles.statusBar}>
          <Text style={styles.statusLabel}>In Attesa</Text>
          <Text style={[styles.statusCount, { color: '#F59E0B' }]}>
            {visibleOrders.filter((o) => o.status === 'pending').length}
          </Text>
        </View>
        <View style={styles.statusBar}>
          <Text style={styles.statusLabel}>In Preparazione</Text>
          <Text style={[styles.statusCount, { color: '#3B82F6' }]}>
            {visibleOrders.filter((o) => o.status === 'preparing').length}
          </Text>
        </View>
        <View style={styles.statusBar}>
          <Text style={styles.statusLabel}>Urgenti</Text>
          <Text style={[styles.statusCount, { color: '#DC2626' }]}>
            {visibleOrders.filter((o) => o.isUrgent).length}
          </Text>
        </View>
      </View>

      {/* Order Queue */}
      <FlatList
        data={visibleOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => selectOrder(item.id === selectedOrderId ? null : item.id)}
          >
            <OrderCard
              orderId={item.id}
              displayName={item.displayName}
              waitTimeSeconds={item.waitTimeSeconds}
              isUrgent={item.isUrgent}
              itemCount={item.order_items?.length || 0}
              status={item.status}
              source={item.order_source}
              notes={item.notes}
              totalAmount={item.total_amount}
              onMarkReady={() => handleMarkReady(item.id)}
              isSelected={item.id === selectedOrderId}
            />
          </Pressable>
        )}
        contentContainerStyle={styles.ordersList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>Nessun ordine in attesa</Text>
            <Text style={styles.emptySubtext}>Buon lavoro! 👨‍🍳</Text>
          </View>
        }
      />

      {/* Error Toast */}
      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorToastText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Loading Indicator for Mark Ready */}
      {loadingOrderId && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingOverlayText}>Salvataggio...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F59E0B',
  },
  orderCountLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersScroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  filterButton: {
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  pauseButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pauseButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBars: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  statusBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  ordersList: {
    paddingVertical: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  errorToast: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorToastText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
});
