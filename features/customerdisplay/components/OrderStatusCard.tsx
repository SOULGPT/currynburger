import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { CustomerDisplayOrder } from '../hooks/useCustomerDisplayOrders';

interface OrderStatusCardProps {
  order: CustomerDisplayOrder;
  index: number;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ order, index }) => {
  const { width } = useWindowDimensions();

  // Calculate dynamic sizing based on screen width
  const cardWidth = Math.min(width * 0.22, 280); // Max 280px, or 22% of screen
  const isReady = order.status === 'ready';

  const getStatusColor = () => {
    switch (order.status) {
      case 'ready': return '#10B981'; // Green
      case 'preparing': return '#F59E0B'; // Yellow/Orange
      case 'pending': return '#6B7280'; // Gray
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (order.status) {
      case 'ready': return 'READY!';
      case 'preparing': return 'PREPARING';
      case 'pending': return 'RECEIVED';
      default: return order.status.toUpperCase();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: cardWidth,
          backgroundColor: isReady ? '#D1FAE5' : '#FFFFFF',
          borderColor: getStatusColor(),
          borderWidth: isReady ? 4 : 2,
          shadowColor: getStatusColor(),
          shadowOpacity: isReady ? 0.3 : 0.1,
        }
      ]}
    >
      {/* Order Number - Large and prominent */}
      <View style={[styles.orderNumberContainer, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Customer Name */}
      <Text style={styles.customerName} numberOfLines={1}>
        {order.customerName}
      </Text>

      {/* Estimated Time */}
      {order.estimatedReadyTime && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>
            {order.status === 'ready' ? 'Ready to collect!' : 'Est. time:'}
          </Text>
          <Text style={[styles.timeValue, { color: getStatusColor() }]}>
            {order.estimatedReadyTime}
          </Text>
        </View>
      )}

      {/* Urgent Indicator */}
      {order.isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>⚡ PRIORITY</Text>
        </View>
      )}

      {/* Order Items Summary */}
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsText}>
          {order.items?.length || 0} items • €{order.total.toFixed(2)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    minHeight: 200,
  },
  orderNumberContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  urgentBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  itemsContainer: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  itemsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});