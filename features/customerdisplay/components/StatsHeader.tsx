import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DisplayStats {
  totalOrders: number;
  readyCount: number;
  preparingCount: number;
  pendingCount: number;
  urgentCount: number;
}

interface StatsHeaderProps {
  stats: DisplayStats;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ stats }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🍽️ Curry & Burger</Text>
          <Text style={styles.subtitle}>Order Status Display</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{currentTime}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {stats.readyCount}
          </Text>
          <Text style={styles.statLabel}>Ready</Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {stats.preparingCount}
          </Text>
          <Text style={styles.statLabel}>Preparing</Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#6B7280' }]}>
            {stats.pendingCount}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {stats.urgentCount}
          </Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>

        <View style={styles.totalStat}>
          <Text style={styles.totalValue}>{stats.totalOrders}</Text>
          <Text style={styles.totalLabel}>Total Orders</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          📢 Please wait for your order number to be called. Orders are ready for collection at the front desk.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  totalStat: {
    alignItems: 'center',
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#4B5563',
  },
  totalValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  totalLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#F3F4F6',
    textAlign: 'center',
    fontWeight: '500',
  },
});