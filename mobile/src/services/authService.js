import apiClient from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  /**
   * Register new user
   */
  register: async (email, password, firstName, dateOfBirth, avgCycleLength) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      first_name: firstName,
      date_of_birth: dateOfBirth,
      avg_cycle_length: avgCycleLength,
    });

    // Store tokens and user data
    if (response.data) {
      await AsyncStorage.multiSet([
        ['access_token', response.data.access_token],
        ['refresh_token', response.data.refresh_token],
        ['user', JSON.stringify(response.data.user)],
      ]);
    }

    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    // Store tokens and user data
    if (response.data) {
      await AsyncStorage.multiSet([
        ['access_token', response.data.access_token],
        ['refresh_token', response.data.refresh_token],
        ['user', JSON.stringify(response.data.user)],
      ]);
    }

    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async (avgCycleLength, lastPeriodDate) => {
    const response = await apiClient.post('/auth/onboarding/complete', {
      avg_cycle_length: avgCycleLength,
      last_period_date: lastPeriodDate,
    });

    // Update stored user data
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.onboarding_completed = true;
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Get stored user data
   */
  getStoredUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
