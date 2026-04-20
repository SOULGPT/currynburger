import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 200,
  showValues = true,
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = width - 64; // Account for padding

  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barWidth = maxValue > 0 ? (item.value / maxValue) * (chartWidth - 60) : 0;
          const color = item.color || '#3B82F6';

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label} numberOfLines={1}>
                  {item.label}
                </Text>
                {showValues && (
                  <Text style={styles.value}>{item.value}</Text>
                )}
              </View>

              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      backgroundColor: color,
                    }
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    width: 50,
    marginRight: 8,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  barWrapper: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  bar: {
    height: 16,
    borderRadius: 8,
    minWidth: 4,
  },
});