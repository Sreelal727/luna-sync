import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { cycleService } from '../../services/cycleService';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await cycleService.getPredictions();
      setPredictions(data);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      Alert.alert('Error', 'Unable to load cycle data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'menstrual':
        return '#F2A599';
      case 'follicular':
        return '#A8C9A3';
      case 'ovulation':
        return '#F2A599';
      case 'luteal':
        return '#9B8FC9';
      default:
        return '#999';
    }
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'menstrual':
        return 'water';
      case 'follicular':
        return 'flower';
      case 'ovulation':
        return 'heart';
      case 'luteal':
        return 'moon-waning-crescent';
      default:
        return 'circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9B8FC9" />
      </View>
    );
  }

  if (!predictions?.has_data) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No cycle data yet</Text>
          <Text style={styles.emptyText}>
            Log your period to see predictions and insights
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={styles.emptyButtonText}>Go to Calendar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const { current_cycle, predictions: pred } = predictions;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hi, {user?.first_name || 'there'}! 👋</Text>

        {/* Current Cycle Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon
              name={getPhaseIcon(current_cycle.phase)}
              size={32}
              color={getPhaseColor(current_cycle.phase)}
            />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                {current_cycle.phase.charAt(0).toUpperCase() + current_cycle.phase.slice(1)} Phase
              </Text>
              <Text style={styles.cardSubtitle}>Day {current_cycle.day}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(current_cycle.day / pred.avg_cycle_length) * 100}%`,
                    backgroundColor: getPhaseColor(current_cycle.phase),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Day {current_cycle.day} of {pred.avg_cycle_length}
            </Text>
          </View>
        </View>

        {/* Predictions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Predictions</Text>

          <View style={styles.predictionItem}>
            <Icon name="calendar-heart" size={24} color="#F2A599" />
            <View style={styles.predictionText}>
              <Text style={styles.predictionLabel}>Next Period</Text>
              <Text style={styles.predictionValue}>
                {format(new Date(pred.next_period_date), 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>

          <View style={styles.predictionItem}>
            <Icon name="egg" size={24} color="#A8C9A3" />
            <View style={styles.predictionText}>
              <Text style={styles.predictionLabel}>Ovulation</Text>
              <Text style={styles.predictionValue}>
                {format(new Date(pred.ovulation_date), 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>

          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {pred.confidence.toUpperCase()} confidence
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Log')}
          >
            <Icon name="pencil" size={24} color="#9B8FC9" />
            <Text style={styles.actionButtonText}>Log Today's Mood</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Icon name="calendar" size={24} color="#9B8FC9" />
            <Text style={styles.actionButtonText}>View Calendar</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5F1',
  },
  content: {
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  predictionText: {
    marginLeft: 12,
    flex: 1,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3A',
  },
  confidenceBadge: {
    backgroundColor: '#E8E5F0',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 12,
    color: '#9B8FC9',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#3A3A3A',
    marginLeft: 12,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#9B8FC9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
