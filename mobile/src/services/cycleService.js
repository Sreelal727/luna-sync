import apiClient from '../config/api';

export const cycleService = {
  /**
   * Log period start
   */
  logPeriod: async (startDate, endDate = null, flowIntensity = null, notes = '') => {
    const response = await apiClient.post('/cycles/period', {
      period_start_date: startDate,
      period_end_date: endDate,
      flow_intensity: flowIntensity,
      notes,
    });
    return response.data;
  },

  /**
   * Update period record
   */
  updatePeriod: async (recordId, data) => {
    const response = await apiClient.patch(`/cycles/period/${recordId}`, data);
    return response.data;
  },

  /**
   * Get cycle predictions
   */
  getPredictions: async () => {
    const response = await apiClient.get('/cycles/predictions');
    return response.data;
  },

  /**
   * Get cycle history
   */
  getHistory: async (limit = 12) => {
    const response = await apiClient.get('/cycles/history', {
      params: { limit },
    });
    return response.data;
  },
};
