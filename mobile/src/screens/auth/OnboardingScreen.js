import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const OnboardingScreen = () => {
  const { completeOnboarding, user } = useAuth();
  const [step, setStep] = useState(1);
  const [avgCycleLength, setAvgCycleLength] = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const cycleLengths = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

  const handleComplete = async () => {
    setLoading(true);
    try {
      const dateStr = lastPeriodDate ? format(lastPeriodDate, 'yyyy-MM-dd') : null;
      await completeOnboarding(avgCycleLength, dateStr);
      // Navigation handled automatically by AppNavigator
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const selectRecentDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    setLastPeriodDate(date);
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Welcome, {user?.first_name}! 👋</Text>
          <Text style={styles.subtitle}>Let's learn about your cycle</Text>

          <View style={styles.section}>
            <Text style={styles.question}>What's your average cycle length?</Text>
            <Text style={styles.hint}>
              If you're not sure, 28 days is a common starting point. We'll adjust as you log.
            </Text>

            <View style={styles.optionsGrid}>
              {cycleLengths.map((length) => (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.option,
                    avgCycleLength === length && styles.optionSelected,
                  ]}
                  onPress={() => setAvgCycleLength(length)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      avgCycleLength === length && styles.optionTextSelected,
                    ]}
                  >
                    {length}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>When did your last period start?</Text>
          <Text style={styles.subtitle}>
            This helps us make accurate predictions. You can skip this if you prefer.
          </Text>

          <View style={styles.section}>
            <View style={styles.dateOptions}>
              {[0, 1, 2, 3, 5, 7, 14, 21, 28].map((days) => {
                const isSelected = lastPeriodDate &&
                  Math.abs((new Date() - lastPeriodDate) / (1000 * 60 * 60 * 24)) === days;

                return (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dateOption,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => selectRecentDate(days)}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {days === 0 ? 'Today' : `${days} days ago`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setStep(1)}
            >
              <Text style={styles.buttonTextSecondary}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Get Started</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              setLastPeriodDate(null);
              handleComplete();
            }}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#9B8FC9',
    borderColor: '#9B8FC9',
  },
  optionText: {
    fontSize: 16,
    color: '#3A3A3A',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  dateOptions: {
    gap: 12,
  },
  dateOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  dateOptionText: {
    fontSize: 16,
    color: '#3A3A3A',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#9B8FC9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonPrimary: {
    flex: 1,
    marginLeft: 8,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#9B8FC9',
    flex: 1,
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#9B8FC9',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  skipText: {
    color: '#999',
    fontSize: 14,
  },
});

export default OnboardingScreen;
