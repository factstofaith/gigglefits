// earningsService.js
// -----------------------------------------------------------------------------
// Service for managing employee earnings mapping functionality

import axios from 'axios';

// Base API URL - would come from environment config in a real app
const API_BASE_URL = '/api';

// Earnings endpoints
const ENDPOINTS = {
  rosters: `${API_BASE_URL}/earnings/rosters`,
  employees: `${API_BASE_URL}/earnings/employees`,
  earningsCodes: `${API_BASE_URL}/earnings/earnings-codes`,
  earningsMaps: `${API_BASE_URL}/earnings/earnings-maps`,
  businessRules: `${API_BASE_URL}/earnings/business-rules`,
};

// Import auth service for token management
import authService from './/authService';

// Import notification helper
import { createNotificationManager } from '@utils/notificationHelper';

// API client with authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(async config => {
  try {
    // Use the auth service to get a fresh token if needed
    const token = await authService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return config;
  }
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Handle 401 Unauthorized errors with token refresh
    if (error.response && error.response.status === 401 && !error.config._isRetry) {
      try {
        // Try to refresh the token
        await authService.refreshToken();

        // Clone the original request
        const newRequest = { ...error.config, _isRetry: true };

        // Get fresh token and update auth header
        const token = await authService.getAuthToken();
        if (token) {
          newRequest.headers.Authorization = `Bearer ${token}`;
        }

        // Retry the request with new token
        return apiClient(newRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Logout if refresh fails
        await authService.logout();

        // Redirect to home/login
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden errors
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden:', error);
      // Could show permission denied message
    }

    return Promise.reject(error);
  }
);

// Earnings service with API methods
const earningsService = {
  // Employee Roster APIs
  getRosters: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.rosters, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employee rosters:', error);
      throw error;
    }
  },

  getRosterById: async rosterId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.rosters}/${rosterId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching roster with ID ${rosterId}:`, error);
      throw error;
    }
  },

  createRoster: async rosterData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(ENDPOINTS.rosters, rosterData);
      notifications.showToast('Employee roster created successfully', 'success', {
        title: 'Success',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating employee roster:', error);
      notifications.showToast('Failed to create employee roster', 'error', {
        title: 'API Error',
        duration: 8000,
      });
      throw error;
    }
  },

  updateRoster: async (rosterId, rosterData) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.put(`${ENDPOINTS.rosters}/${rosterId}`, rosterData);
      notifications.showToast('Employee roster updated successfully', 'success', {
        title: 'Success',
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating roster with ID ${rosterId}:`, error);
      notifications.showToast('Failed to update employee roster', 'error', {
        title: 'API Error',
        duration: 8000,
      });
      throw error;
    }
  },

  deleteRoster: async rosterId => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${ENDPOINTS.rosters}/${rosterId}`);
      notifications.showToast('Employee roster deleted successfully', 'success', {
        title: 'Success',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting roster with ID ${rosterId}:`, error);
      notifications.showToast('Failed to delete employee roster', 'error', {
        title: 'API Error',
        duration: 8000,
      });
      throw error;
    }
  },

  // Employee APIs
  getEmployees: async (rosterId, params = {}) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.rosters}/${rosterId}/employees`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching employees for roster ID ${rosterId}:`, error);
      throw error;
    }
  },

  getEmployeeById: async employeeId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.employees}/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${employeeId}:`, error);
      throw error;
    }
  },

  createEmployee: async employeeData => {
    try {
      const response = await apiClient.post(ENDPOINTS.employees, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  bulkCreateEmployees: async bulkData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(`${ENDPOINTS.employees}/bulk`, bulkData);
      notifications.showToast('Employees created successfully', 'success', {
        title: 'Success',
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating employees:', error);
      notifications.showToast('Failed to create employees', 'error', {
        title: 'API Error',
        duration: 8000,
      });
      throw error;
    }
  },

  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.employees}/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating employee with ID ${employeeId}:`, error);
      throw error;
    }
  },

  deleteEmployee: async employeeId => {
    try {
      await apiClient.delete(`${ENDPOINTS.employees}/${employeeId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting employee with ID ${employeeId}:`, error);
      throw error;
    }
  },

  // Employee Earnings APIs
  getEmployeeEarnings: async (employeeId, params = {}) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.employees}/${employeeId}/earnings`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching earnings for employee ID ${employeeId}:`, error);
      throw error;
    }
  },

  createEmployeeEarnings: async earningsData => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.employees}/earnings`, earningsData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee earnings:', error);
      throw error;
    }
  },

  bulkCreateEmployeeEarnings: async bulkData => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.employees}/earnings/bulk`, bulkData);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating employee earnings:', error);
      throw error;
    }
  },

  // Earnings Codes APIs
  getEarningsCodes: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.earningsCodes, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings codes:', error);
      throw error;
    }
  },

  getEarningsCodeById: async codeId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.earningsCodes}/${codeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching earnings code with ID ${codeId}:`, error);
      throw error;
    }
  },

  createEarningsCode: async codeData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(ENDPOINTS.earningsCodes, codeData);
      notifications.showToast('Earnings code created successfully', 'success', {
        title: 'Success',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating earnings code:', error);
      notifications.showToast('Failed to create earnings code', 'error', {
        title: 'API Error',
        duration: 8000,
      });
      throw error;
    }
  },

  updateEarningsCode: async (codeId, codeData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.earningsCodes}/${codeId}`, codeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating earnings code with ID ${codeId}:`, error);
      throw error;
    }
  },

  deleteEarningsCode: async codeId => {
    try {
      await apiClient.delete(`${ENDPOINTS.earningsCodes}/${codeId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting earnings code with ID ${codeId}:`, error);
      throw error;
    }
  },

  // Earnings Maps APIs
  getEarningsMaps: async (rosterId, params = {}) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.rosters}/${rosterId}/earnings-maps`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching earnings maps for roster ID ${rosterId}:`, error);
      throw error;
    }
  },

  getEarningsMapById: async mapId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.earningsMaps}/${mapId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching earnings map with ID ${mapId}:`, error);
      throw error;
    }
  },

  createEarningsMap: async mapData => {
    try {
      const response = await apiClient.post(ENDPOINTS.earningsMaps, mapData);
      return response.data;
    } catch (error) {
      console.error('Error creating earnings map:', error);
      throw error;
    }
  },

  updateEarningsMap: async (mapId, mapData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.earningsMaps}/${mapId}`, mapData);
      return response.data;
    } catch (error) {
      console.error(`Error updating earnings map with ID ${mapId}:`, error);
      throw error;
    }
  },

  deleteEarningsMap: async mapId => {
    try {
      await apiClient.delete(`${ENDPOINTS.earningsMaps}/${mapId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting earnings map with ID ${mapId}:`, error);
      throw error;
    }
  },

  // Business Rules APIs
  getBusinessRules: async (rosterId, params = {}) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.rosters}/${rosterId}/business-rules`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching business rules for roster ID ${rosterId}:`, error);
      throw error;
    }
  },

  getBusinessRuleById: async ruleId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.businessRules}/${ruleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching business rule with ID ${ruleId}:`, error);
      throw error;
    }
  },

  createBusinessRule: async ruleData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(ENDPOINTS.businessRules, ruleData);
      notifications.showToast('Business rule created successfully', 'success', {
        title: 'Success',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating business rule:', error);
      notifications.showToast('Failed to create business rule', 'error', {
        title: 'API Error',
        duration: 8000,
      });
      throw error;
    }
  },

  updateBusinessRule: async (ruleId, ruleData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.businessRules}/${ruleId}`, ruleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating business rule with ID ${ruleId}:`, error);
      throw error;
    }
  },

  deleteBusinessRule: async ruleId => {
    try {
      await apiClient.delete(`${ENDPOINTS.businessRules}/${ruleId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting business rule with ID ${ruleId}:`, error);
      throw error;
    }
  },

  // Advanced operations
  syncRoster: async syncRequest => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(`${ENDPOINTS.rosters}/sync`, syncRequest);
      notifications.showToast('Roster sync started successfully', 'success', {
        title: 'Sync Started',
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing roster:', error);
      notifications.showToast('Failed to sync roster', 'error', {
        title: 'Sync Error',
        duration: 8000,
      });
      throw error;
    }
  },

  testEarningsMap: async testRequest => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.earningsMaps}/test`, testRequest);
      return response.data;
    } catch (error) {
      console.error('Error testing earnings map:', error);
      throw error;
    }
  },
};

export const {
  getRosters,
  getRosterById,
  createRoster,
  updateRoster,
  deleteRoster,
  getEmployees,
  getEmployeeById,
  createEmployee,
  bulkCreateEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeEarnings,
  createEmployeeEarnings,
  bulkCreateEmployeeEarnings,
  getEarningsCodes,
  getEarningsCodeById,
  createEarningsCode,
  updateEarningsCode,
  deleteEarningsCode,
  getEarningsMaps,
  getEarningsMapById,
  createEarningsMap,
  updateEarningsMap,
  deleteEarningsMap,
  getBusinessRules,
  getBusinessRuleById,
  createBusinessRule,
  updateBusinessRule,
  deleteBusinessRule,
  syncRoster,
  testEarningsMap,
} = earningsService;

export default earningsService;
