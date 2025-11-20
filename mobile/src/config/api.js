import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Change this based on your environment
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'  // Development
  : 'https://luna-sync-sigma.vercel.app/api/v1';  // Production

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401 && data.code === 'TOKEN_EXPIRED') {
        // Token expired - logout user
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        // You could implement token refresh logic here
      }

      throw {
        message: data.message || 'An error occurred',
        code: data.code,
        status,
      };
    } else if (error.request) {
      // Request made but no response
      throw {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }
);

export default apiClient;
export { API_BASE_URL };
