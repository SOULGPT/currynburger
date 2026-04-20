import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';

interface OrderCardProps {
  orderId: string;
  displayName: string;
  waitTimeSeconds: number;
  isUrgent: boolean;
  itemCount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  source: 'app' | 'waiter' | 'desk';
  notes?: string;
  totalAmount: number;
  onMarkReady: () => void;
  isSelected?: boolean;
}

export const OrderCard = React.memo(
  ({
    orderId,
    displayName,
    waitTimeSeconds,
    isUrgent,
    itemCount,
    status,
    source,
    notes,
    totalAmount,
    onMarkReady,
    isSelected = false,
  }: OrderCardProps) => {
    const formatWaitTime = (seconds: number): string => {
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}m ${secs}s`;
    };

    const getSourceIcon = (src: string): string => {
      switch (src) {
        case 'app':
          return '📱';
        case 'waiter':
          return '👨‍💼';
        case 'desk':
          return '🪑';
        default:
          return '📋';
      }
    };

    const getSourceLabel = (src: string): string => {
      switch (src) {
        case 'app':
          return 'App';
        case 'waiter':
          return 'Cameriere';
        case 'desk':
          return 'Bancone';
        default:
          return 'Order';
      }
    };

    const borderColor = isUrgent ? '#DC2626' : isSelected ? '#6366F1' : '#E5E7EB';
    const borderWidth = isUrgent ? 3 : isSelected ? 2 : 1;
    const backgroundColor = isUrgent ? '#FEE2E2' : isSelected ? '#F0F4FF' : 'white';

    return (
      <View
        style={[
          styles.container,
          {
            borderColor,
            borderWidth,
            backgroundColor,
          },
        ]}
      >
        {/* Urgency Indicator - Pulsing Red Ring */}
        {isUrgent && <View style={styles.urgencyPulse} />}

        {/* Header: Order Name + Wait Time */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.displayName}>{displayName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.sourceLabel}>
                {getSourceIcon(source)} {getSourceLabel(source)}
              </Text>
              <Text style={styles.itemCount}>
                {itemCount} {itemCount === 1 ? 'articolo' : 'articoli'}
              </Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <Text style={[styles.waitTime, isUrgent && styles.waitTimeUrgent]}>
              {formatWaitTime(waitTimeSeconds)}
            </Text>
            {isUrgent && <Text style={styles.urgentLabel}>URGENTE</Text>}
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {status === 'pending' ? '⏱️ In Attesa' : '👨‍🍳 In Preparazione'}
          </Text>
        </View>

        {/* Items Preview */}
        <View style={styles.itemsPreview}>
          {itemCount > 0 && (
            <Text style={styles.itemsText}>
              • {itemCount} {itemCount === 1 ? 'piatto' : 'piatti'} in ordine
            </Text>
          )}
        </View>

        {/* Notes Section (if any) */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Note:</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Amount + Ready Button */}
        <View style={styles.footer}>
          <Text style={styles.amountLabel}>€{totalAmount.toFixed(2)}</Text>
          <Pressable style={styles.readyButton} onPress={onMarkReady}>
            <Text style={styles.readyButtonText}>✓ Pronto</Text>
          </Pressable>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: 'white',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  urgencyPulse: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemCount: {
    fontSize: 11,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  waitTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  waitTimeUrgent: {
    color: '#DC2626',
    fontSize: 20,
  },
  urgentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusBadge: {
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  itemsPreview: {
    marginBottom: 8,
  },
  itemsText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  notesSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#F59E0B',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 11,
    color: '#92400E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  readyButton: {
    backgroundColor: '#22C55E',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  readyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});
