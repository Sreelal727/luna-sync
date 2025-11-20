import apiClient from '../config/api';

export const calendarService = {
  /**
   * Get calendar data for a specific month
   */
  getCalendarData: async (year, month) => {
    const response = await apiClient.get('/calendar', {
      params: { year, month },
    });
    return response.data;
  },

  /**
   * Get calendar data for a date range
   */
  getCalendarRange: async (start, end) => {
    const response = await apiClient.get('/calendar/range', {
      params: { start, end },
    });
    return response.data;
  },
};
