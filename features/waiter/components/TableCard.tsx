import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useWaiterOrders } from '@/features/waiter/hooks/useWaiterOrders';

interface TableCardProps {
  tableId: string;
  tableNumber: number;
  capacity: number;
  onPress: () => void;
  activeTableId?: string;
}

export const TableCard = React.memo(
  ({ tableId, tableNumber, capacity, onPress, activeTableId }: TableCardProps) => {
    const { orders } = useWaiterOrders(tableId);

    const getStatus = () => {
      if (orders.length === 0) return 'empty';
      if (orders.some((o) => o.status === 'ready')) return 'ready';
      if (orders.some((o) => o.status === 'preparing')) return 'preparing';
      return 'occupied';
    };

    const status = getStatus();
    const isActive = activeTableId === tableId;

    const getStatusColor = () => {
      switch (status) {
        case 'empty':
          return '#9CA3AF'; // Gray
        case 'occupied':
          return '#F97316'; // Orange
        case 'preparing':
          return '#FBBF24'; // Amber
        case 'ready':
          return '#22C55E'; // Green
        default:
          return '#9CA3AF';
      }
    };

    const statusColor = getStatusColor();

    return (
      <Pressable
        style={[
          styles.container,
          {
            borderColor: statusColor,
            borderWidth: status === 'ready' ? 3 : 2,
            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'white',
          },
        ]}
        onPress={onPress}
      >
        {/* Status indicator */}
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: statusColor,
            },
          ]}
        />

        {/* Table number */}
        <Text style={styles.tableNumber}># {tableNumber}</Text>

        {/* Capacity */}
        <Text style={styles.capacity}>{capacity} posti</Text>

        {/* Status label */}
        <Text style={[styles.status, { color: statusColor }]}>
          {status === 'empty' && 'Libero'}
          {status === 'occupied' && 'Occupato'}
          {status === 'preparing' && 'In Cucina'}
          {status === 'ready' && 'Pronto'}
        </Text>

        {/* Order count badge */}
        {orders.length > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: statusColor,
              },
            ]}
          >
            <Text style={styles.badgeText}>{orders.length}</Text>
          </View>
        )}
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '31%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 8,
    marginVertical: 6,
    marginHorizontal: '1%',
    backgroundColor: 'white',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 6,
    right: 6,
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  capacity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F97316',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});
