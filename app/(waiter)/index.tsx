import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useTables } from '@/features/waiter/hooks/useTables';
import { useWaiterOrderStore } from '@/features/waiter/stores/waiterOrder.store';
import { TableCard } from '@/features/waiter/components/TableCard';

export default function TableGridScreen() {
  const { rooms, loading, error, getTablesForRoom } = useTables();
  const startOrder = useWaiterOrderStore((state) => state.startOrder);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'dinein' | 'asporto'>('dinein');

  const handleTablePress = (tableId: string, roomId: string) => {
    startOrder(tableId, roomId);
    setActiveTableId(tableId);
    router.push({
      pathname: '/(waiter)/order-browser',
      params: { tableId, roomId },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Caricamento tavoli...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Errore: {error}</Text>
        <Pressable style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Riprova</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cameriere</Text>
        <Text style={styles.subtitle}>Sala Ristorante</Text>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggleContainer}>
        <Pressable
          style={[
            styles.modeButton,
            orderType === 'dinein' && styles.modeButtonActive,
          ]}
          onPress={() => setOrderType('dinein')}
        >
          <Text
            style={[
              styles.modeButtonText,
              orderType === 'dinein' && styles.modeButtonTextActive,
            ]}
          >
            🪑 Al Tavolo
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.modeButton,
            orderType === 'asporto' && styles.modeButtonActive,
          ]}
          onPress={() => setOrderType('asporto')}
        >
          <Text
            style={[
              styles.modeButtonText,
              orderType === 'asporto' && styles.modeButtonTextActive,
            ]}
          >
            🥡 Asporto
          </Text>
        </Pressable>
      </View>

      {orderType === 'dinein' ? (
        // Dine-in: Show table grid for each room
        <View>
          {rooms.map((room) => {
            const roomTables = getTablesForRoom(room.id);
            return (
              <View key={room.id} style={styles.roomSection}>
                <Text style={styles.roomTitle}>{room.name}</Text>

                <View style={styles.tableGrid}>
                  {roomTables.map((table) => (
                    <TableCard
                      key={table.id}
                      tableId={table.id}
                      tableNumber={table.table_number}
                      capacity={table.capacity}
                      onPress={() => handleTablePress(table.id, room.id)}
                      activeTableId={activeTableId || undefined}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        // Takeaway: Show order browser directly
        <View style={styles.takeawayContainer}>
          <Pressable
            style={styles.takeawayButton}
            onPress={() => {
              startOrder('ASPORTO', 'TAKEAWAY');
              router.push({
                pathname: '/(waiter)/order-browser',
                params: { tableId: 'ASPORTO', roomId: 'TAKEAWAY', isTakeaway: 'true' },
              });
            }}
          >
            <Text style={styles.takeawayButtonText}>Nuovo Ordine Asporto</Text>
            <Text style={styles.takeawayButtonSubtext}>+</Text>
          </Pressable>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legenda Stato Tavoli</Text>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.legendText}>Libero</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>Occupato</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FBBF24' }]} />
          <Text style={styles.legendText}>In Cucina</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>Pronto per il Ritiro</Text>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#6366F1',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  roomSection: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    marginLeft: 4,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  takeawayContainer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  takeawayButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takeawayButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  takeawayButtonSubtext: {
    fontSize: 32,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  legend: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: '#4B5563',
  },
});
