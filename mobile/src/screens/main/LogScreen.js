import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { format } from 'date-fns';
import { moodService, MOODS, SYMPTOMS } from '../../services/moodService';

const LogScreen = ({ navigation }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMood, setSelectedMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [flowIntensity, setFlowIntensity] = useState('none');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const flowOptions = [
    { id: 'none', label: 'None', emoji: '⚪' },
    { id: 'spotting', label: 'Spotting', emoji: '🟤' },
    { id: 'light', label: 'Light', emoji: '🔴' },
    { id: 'medium', label: 'Medium', emoji: '🔴🔴' },
    { id: 'heavy', label: 'Heavy', emoji: '🔴🔴🔴' },
  ];

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('Select Mood', 'Please select your mood for today');
      return;
    }

    setLoading(true);
    try {
      await moodService.logMood(
        date,
        selectedMood,
        energyLevel,
        selectedSymptoms,
        flowIntensity,
        notes,
        true
      );

      Alert.alert('Success', 'Log saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedMood(null);
            setEnergyLevel(5);
            setSelectedSymptoms([]);
            setFlowIntensity('none');
            setNotes('');
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How are you feeling today?</Text>
        <Text style={styles.date}>{format(new Date(date), 'MMMM dd, yyyy')}</Text>

        {/* Mood Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodButton,
                  selectedMood === mood.id && styles.moodButtonSelected,
                ]}
                onPress={() => setSelectedMood(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.id && styles.moodLabelSelected,
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Energy Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Level: {energyLevel}/10</Text>
          <View style={styles.energySlider}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyDot,
                  energyLevel >= level && styles.energyDotActive,
                ]}
                onPress={() => setEnergyLevel(level)}
              />
            ))}
          </View>
        </View>

        {/* Flow Intensity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flow</Text>
          <View style={styles.flowGrid}>
            {flowOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.flowButton,
                  flowIntensity === option.id && styles.flowButtonSelected,
                ]}
                onPress={() => setFlowIntensity(option.id)}
              >
                <Text style={styles.flowEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.flowLabel,
                    flowIntensity === option.id && styles.flowLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Symptoms ({selectedSymptoms.length})
          </Text>
          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomChip,
                  selectedSymptoms.includes(symptom.id) && styles.symptomChipSelected,
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                <Text
                  style={[
                    styles.symptomLabel,
                    selectedSymptoms.includes(symptom.id) &&
                      styles.symptomLabelSelected,
                  ]}
                >
                  {symptom.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about your day..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Log</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3A',
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  moodButtonSelected: {
    backgroundColor: '#9B8FC9',
    borderColor: '#9B8FC9',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#3A3A3A',
  },
  moodLabelSelected: {
    color: '#FFFFFF',
  },
  energySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  energyDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  energyDotActive: {
    backgroundColor: '#9B8FC9',
  },
  flowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flowButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  flowButtonSelected: {
    backgroundColor: '#F2A599',
    borderColor: '#F2A599',
  },
  flowEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  flowLabel: {
    fontSize: 11,
    color: '#3A3A3A',
  },
  flowLabelSelected: {
    color: '#FFFFFF',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomChipSelected: {
    backgroundColor: '#9B8FC9',
    borderColor: '#9B8FC9',
  },
  symptomEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  symptomLabel: {
    fontSize: 13,
    color: '#3A3A3A',
  },
  symptomLabelSelected: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    fontSize: 14,
    color: '#3A3A3A',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#9B8FC9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LogScreen;
