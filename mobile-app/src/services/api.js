import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      return true;
    } catch (error) {
      // Even if API call fails, clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      throw this.handleError(error);
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Payment APIs
  async makePayment(paymentData) {
    try {
      const response = await this.api.post('/payments/contribute', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentHistory(page = 1, limit = 10, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await this.api.get('/payments/history', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentStats() {
    try {
      const response = await this.api.get('/payments/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Emergency APIs
  async triggerSOS(emergencyData) {
    try {
      const response = await this.api.post('/emergency/sos', emergencyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEmergencyAlerts() {
    try {
      const response = await this.api.get('/emergency/alerts');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNearbyAgents(latitude, longitude, radius = 2000) {
    try {
      const params = { latitude, longitude, radius };
      const response = await this.api.get('/emergency/nearby-agents', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Forum APIs
  async getForumPosts(page = 1, limit = 20, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await this.api.get('/forum/posts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createForumPost(postData) {
    try {
      const response = await this.api.post('/forum/posts', postData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addComment(postId, content) {
    try {
      const response = await this.api.post(`/forum/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async likePost(postId) {
    try {
      const response = await this.api.post(`/forum/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User APIs
  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/users/profile', profileData);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addEmergencyContact(contactData) {
    try {
      const response = await this.api.post('/users/emergency-contacts', contactData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    try {
      const params = { page, limit, unreadOnly };
      const response = await this.api.get('/users/notifications', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await this.api.put(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return null;
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data.message || data.error || 'An error occurred',
        details: data.details || null
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network error. Please check your internet connection.',
        details: null
      };
    } else {
      // Other error
      return {
        status: -1,
        message: error.message || 'An unexpected error occurred',
        details: null
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default new ApiService();
