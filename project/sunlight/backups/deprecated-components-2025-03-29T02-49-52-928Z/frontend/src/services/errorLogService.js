// errorLogService.js
// -----------------------------------------------------------------------------
// Service for retrieving and managing application error logs

import axios from 'axios';

// Base API URL - would come from environment config in a real app
const API_BASE_URL = '/api';

// Error logs endpoint
const ERROR_LOGS_ENDPOINT = `${API_BASE_URL}/admin/monitoring/error-logs`;

// Import auth service for token management
import authService from './/authService';

// Import notification helper for optional notification support
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

    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden - insufficient permissions:', error);

      // Create notification helper and show forbidden error
      const notifications = createNotificationManager();
      notifications.showToast('You do not have permission to perform this action', 'error', {
        title: 'Access Denied',
        duration: 8000,
      });
    }

    return Promise.reject(error);
  }
);

// Error log service with API methods
const errorLogService = {
  // Get error logs with pagination and filtering
  getErrorLogs: async (params = {}) => {
    try {
      const response = await apiClient.get(ERROR_LOGS_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching error logs:', error);
      throw error;
    }
  },

  // Search logs with full-text search
  searchLogs: async (searchQuery, params = {}) => {
    try {
      const response = await apiClient.get(`${ERROR_LOGS_ENDPOINT}/search`, {
        params: {
          query: searchQuery,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching error logs:', error);
      throw error;
    }
  },

  // Get logs for a specific severity level
  getLogsBySeverity: async (severity, params = {}) => {
    try {
      const response = await apiClient.get(ERROR_LOGS_ENDPOINT, {
        params: {
          severity,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching error logs with severity ${severity}:`, error);
      throw error;
    }
  },

  // Get logs for a specific component
  getLogsByComponent: async (component, params = {}) => {
    try {
      const response = await apiClient.get(ERROR_LOGS_ENDPOINT, {
        params: {
          component,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching error logs for component ${component}:`, error);
      throw error;
    }
  },

  // Get logs within a date range
  getLogsByDateRange: async (startDate, endDate, params = {}) => {
    try {
      const response = await apiClient.get(ERROR_LOGS_ENDPOINT, {
        params: {
          start_date: startDate,
          end_date: endDate,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching error logs by date range:', error);
      throw error;
    }
  },

  // Get detailed information about a single log entry
  getLogDetails: async (logId) => {
    try {
      const response = await apiClient.get(`${ERROR_LOGS_ENDPOINT}/${logId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for log ${logId}:`, error);
      throw error;
    }
  },

  // Export logs to CSV
  exportLogsCSV: async (params = {}) => {
    try {
      const response = await apiClient.get(`${ERROR_LOGS_ENDPOINT}/export`, {
        params: {
          format: 'csv',
          ...params,
        },
        responseType: 'blob',
      });
      
      // Create a blob URL for the downloaded file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `error_logs_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting error logs to CSV:', error);
      throw error;
    }
  },

  // Export logs to JSON
  exportLogsJSON: async (params = {}) => {
    try {
      const response = await apiClient.get(`${ERROR_LOGS_ENDPOINT}/export`, {
        params: {
          format: 'json',
          ...params,
        },
        responseType: 'blob',
      });
      
      // Create a blob URL for the downloaded file
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `error_logs_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting error logs to JSON:', error);
      throw error;
    }
  },

  // Get available log severity levels (for filtering)
  getSeverityLevels: async () => {
    try {
      const response = await apiClient.get(`${ERROR_LOGS_ENDPOINT}/severity-levels`);
      return response.data;
    } catch (error) {
      console.error('Error fetching severity levels:', error);
      throw error;
    }
  },

  // Get available component names (for filtering)
  getComponents: async () => {
    try {
      const response = await apiClient.get(`${ERROR_LOGS_ENDPOINT}/components`);
      return response.data;
    } catch (error) {
      console.error('Error fetching component names:', error);
      throw error;
    }
  },
};

export const {
  getErrorLogs,
  searchLogs,
  getLogsBySeverity,
  getLogsByComponent,
  getLogsByDateRange,
  getLogDetails,
  exportLogsCSV,
  exportLogsJSON,
  getSeverityLevels,
  getComponents,
} = errorLogService;

export default errorLogService;