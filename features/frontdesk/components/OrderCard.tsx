import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { FrontDeskOrder } from '../hooks/useFrontDeskOrders';

interface OrderCardProps {
  order: FrontDeskOrder;
  onMarkPaid: (orderId: string) => Promise<void>;
  isSelected?: boolean;
  onSelect?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onMarkPaid,
  isSelected = false,
  onSelect,
}) => {
  const handleMarkPaid = () => {
    Alert.alert(
      'Confirm Payment',
      `Mark order for ${order.customerName || 'Guest'} as paid?\nTotal: €${order.total.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          style: 'default',
          onPress: () => onMarkPaid(order.id),
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Pressable
      style={[styles.container, isSelected && styles.selected]}
      onPress={() => onSelect?.(order.id)}
    >
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
          <Text style={styles.customerName}>
            {order.customerName || 'Guest'}
          </Text>
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.time}>{formatTime(order.placed_at)}</Text>
          <Text style={styles.waitTime}>
            Wait: {order.waitTime}min
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        {order.tableNumber && order.roomName && (
          <Text style={styles.tableInfo}>
            📍 {order.roomName} - Table {order.tableNumber}
          </Text>
        )}

        <View style={styles.itemsSummary}>
          <Text style={styles.itemsCount}>
            {order.items?.length || 0} items
          </Text>
          <Text style={styles.total}>€{order.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.payButton} onPress={handleMarkPaid}>
          <Text style={styles.payButtonText}>💳 Mark Paid</Text>
        </Pressable>
      </View>

      {order.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesText}>📝 {order.notes}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#FE8C00',
    shadowOpacity: 0.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  waitTime: {
    fontSize: 12,
    color: '#FE8C00',
    fontWeight: 'bold',
  },
  details: {
    marginBottom: 12,
  },
  tableInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsCount: {
    fontSize: 14,
    color: '#666',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FE8C00',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  payButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});