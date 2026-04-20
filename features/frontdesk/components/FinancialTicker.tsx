import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFrontDeskOrders } from '../hooks/useFrontDeskOrders';

interface FinancialTickerProps {
  compact?: boolean;
}

export const FinancialTicker: React.FC<FinancialTickerProps> = ({ compact = false }) => {
  const { getFinancialSummary } = useFrontDeskOrders();
  const summary = getFinancialSummary();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactTitle}>💰 Today</Text>
        <Text style={styles.compactValue}>€{summary.totalRevenue.toFixed(2)}</Text>
        <Text style={styles.compactSubtitle}>{summary.orderCount} orders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Daily Financial Summary</Text>

      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Total Revenue</Text>
          <Text style={styles.metricValue}>€{summary.totalRevenue.toFixed(2)}</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Orders Today</Text>
          <Text style={styles.metricValue}>{summary.orderCount}</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Avg Order Value</Text>
          <Text style={styles.metricValue}>€{summary.averageOrderValue.toFixed(2)}</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Pending Payments</Text>
          <Text style={styles.metricValue}>{summary.pendingPayments}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
    marginBottom: 12,
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 12,
  },
  compactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
  },
  compactSubtitle: {
    fontSize: 12,
    color: '#ccc',
  },
});