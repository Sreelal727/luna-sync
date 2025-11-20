import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { calendarService } from '../../services/calendarService';
import { cycleService } from '../../services/cycleService';

const CalendarScreen = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPeriodForm, setShowPeriodForm] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const today = new Date();
      const data = await calendarService.getCalendarData(
        today.getFullYear(),
        today.getMonth() + 1
      );
      setCalendarData(data);
    } catch (error) {
      console.error('Failed to load calendar:', error);
      Alert.alert('Error', 'Unable to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogPeriod = async () => {
    if (!selectedDate) return;

    Alert.alert(
      'Log Period',
      `Mark ${format(new Date(selectedDate), 'MMM dd')} as period start?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await cycleService.logPeriod(selectedDate, null, 'medium', '');
              Alert.alert('Success', 'Period logged successfully');
              loadCalendarData();
              setShowPeriodForm(false);
              setSelectedDate(null);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to log period');
            }
          },
        },
      ]
    );
  };

  const getMarkedDates = () => {
    if (!calendarData) return {};

    const marked = {};

    calendarData.days.forEach((day) => {
      const marking = {};

      if (day.has_period) {
        marking.marked = true;
        marking.dotColor = '#F2A599';
        marking.selectedColor = '#F2A599';
      }

      if (day.is_predicted) {
        marking.marked = true;
        marking.dotColor = '#E0E0E0';
      }

      if (day.has_mood_log) {
        marking.marked = true;
        if (!marking.dotColor) {
          marking.dotColor = '#9B8FC9';
        }
      }

      if (Object.keys(marking).length > 0) {
        marked[day.date] = marking;
      }
    });

    // Highlight selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#9B8FC9',
      };
    }

    return marked;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9B8FC9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Calendar
          markedDates={getMarkedDates()}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setShowPeriodForm(true);
          }}
          theme={{
            backgroundColor: '#F8F5F1',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#3A3A3A',
            selectedDayBackgroundColor: '#9B8FC9',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#9B8FC9',
            dayTextColor: '#3A3A3A',
            textDisabledColor: '#D0D0D0',
            dotColor: '#9B8FC9',
            selectedDotColor: '#FFFFFF',
            arrowColor: '#9B8FC9',
            monthTextColor: '#3A3A3A',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#F2A599' }]} />
            <Text style={styles.legendText}>Period</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendText}>Predicted Period</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#9B8FC9' }]} />
            <Text style={styles.legendText}>Mood Logged</Text>
          </View>
        </View>

        {/* Quick Add Period Button */}
        {showPeriodForm && selectedDate && (
          <View style={styles.quickAdd}>
            <Text style={styles.quickAddTitle}>
              {format(new Date(selectedDate), 'MMMM dd, yyyy')}
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={handleLogPeriod}>
              <Text style={styles.addButtonText}>Log Period Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowPeriodForm(false);
                setSelectedDate(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
  legend: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  quickAdd: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
  },
  quickAddTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#9B8FC9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
});

export default CalendarScreen;
