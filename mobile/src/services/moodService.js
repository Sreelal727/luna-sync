import apiClient from '../config/api';

export const moodService = {
  /**
   * Log mood and symptoms
   */
  logMood: async (date, mood, energyLevel, symptoms, flowIntensity, notes, isPrivate = true) => {
    const response = await apiClient.post('/logs/mood', {
      log_date: date,
      mood,
      energy_level: energyLevel,
      symptoms,
      flow_intensity: flowIntensity,
      notes,
      is_private: isPrivate,
    });
    return response.data;
  },

  /**
   * Get mood logs
   */
  getMoodLogs: async (startDate = null, endDate = null, limit = 30) => {
    const response = await apiClient.get('/logs/mood', {
      params: {
        start_date: startDate,
        end_date: endDate,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Get mood log for specific date
   */
  getMoodLogByDate: async (date) => {
    try {
      const response = await apiClient.get(`/logs/mood/${date}`);
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Delete mood log
   */
  deleteMoodLog: async (logId) => {
    const response = await apiClient.delete(`/logs/mood/${logId}`);
    return response.data;
  },

  /**
   * Get mood statistics
   */
  getMoodStats: async (days = 30) => {
    const response = await apiClient.get('/logs/mood/stats', {
      params: { days },
    });
    return response.data;
  },
};

// Available symptoms
export const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '💥' },
  { id: 'bloating', label: 'Bloating', emoji: '🎈' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '💢' },
  { id: 'acne', label: 'Acne', emoji: '🔴' },
  { id: 'backache', label: 'Backache', emoji: '🔙' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'insomnia', label: 'Insomnia', emoji: '😵' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫' },
  { id: 'irritability', label: 'Irritability', emoji: '😤' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'sadness', label: 'Sadness', emoji: '😢' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'increased_energy', label: 'Increased Energy', emoji: '⚡' },
  { id: 'high_libido', label: 'High Libido', emoji: '❤️' },
  { id: 'low_libido', label: 'Low Libido', emoji: '💔' },
  { id: 'brain_fog', label: 'Brain Fog', emoji: '🌫️' },
  { id: 'diarrhea', label: 'Diarrhea', emoji: '💩' },
  { id: 'constipation', label: 'Constipation', emoji: '🚫' },
];

// Available moods
export const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'anxious', label: 'Anxious', emoji: '😰' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
];
