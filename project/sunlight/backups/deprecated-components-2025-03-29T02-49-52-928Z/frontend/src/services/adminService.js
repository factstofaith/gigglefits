// adminService.js
// -----------------------------------------------------------------------------
// Service for managing admin-related operations, connecting to the backend API

import axios from 'axios';

// Base API URL - would come from environment config in a real app
const API_BASE_URL = '/api';

// Admin endpoints
const ENDPOINTS = {
  applications: `${API_BASE_URL}/admin/applications`,
  datasets: `${API_BASE_URL}/admin/datasets`,
  releases: `${API_BASE_URL}/admin/releases`,
  tenants: `${API_BASE_URL}/admin/tenants`,
};

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

// Admin service with API methods
const adminService = {
  // Webhook methods
  createWebhook: async webhookData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(`${API_BASE_URL}/webhooks`, webhookData);

      // Show success notification
      notifications.showToast('Webhook created successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating webhook:', error);

      // Show error notification
      notifications.showToast('Failed to create webhook', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  updateWebhook: async (id, webhookData) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.put(`${API_BASE_URL}/webhooks/${id}`, webhookData);

      // Show success notification
      notifications.showToast('Webhook updated successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating webhook with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to update webhook', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  deleteWebhook: async id => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${API_BASE_URL}/webhooks/${id}`);

      // Show success notification
      notifications.showToast('Webhook deleted successfully', 'success', {
        title: 'Success',
      });

      return true;
    } catch (error) {
      console.error(`Error deleting webhook with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to delete webhook', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  testWebhook: async id => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(`${API_BASE_URL}/webhooks/${id}/test`);

      return response.data;
    } catch (error) {
      console.error(`Error testing webhook with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to test webhook', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Application methods
  getApplications: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.applications, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  getApplicationById: async id => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.applications}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application with ID ${id}:`, error);
      throw error;
    }
  },

  createApplication: async applicationData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(ENDPOINTS.applications, applicationData);

      // Show success notification
      notifications.showToast('Application created successfully', 'success', {
        title: 'Success',
      });

      // Add persistent notification
      notifications.addNotification({
        title: 'New Application Created',
        message: `Application "${applicationData.name}" has been created successfully.`,
        type: 'success',
        actionLabel: 'View Application',
        onActionClick: () => (window.location.href = `/admin/applications/${response.data.id}`),
      });

      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);

      // Show error notification
      notifications.showToast('Failed to create application', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  updateApplication: async (id, applicationData) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.put(`${ENDPOINTS.applications}/${id}`, applicationData);

      // Show success notification
      notifications.showToast('Application updated successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating application with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to update application', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  deleteApplication: async id => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${ENDPOINTS.applications}/${id}`);

      // Show success notification
      notifications.showToast('Application deleted successfully', 'success', {
        title: 'Success',
      });

      return true;
    } catch (error) {
      console.error(`Error deleting application with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to delete application', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Dataset methods
  getDatasets: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.datasets, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  },

  getDatasetById: async id => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.datasets}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching dataset with ID ${id}:`, error);
      throw error;
    }
  },

  createDataset: async datasetData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(ENDPOINTS.datasets, datasetData);

      // Show success notification
      notifications.showToast('Dataset created successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating dataset:', error);

      // Show error notification
      notifications.showToast('Failed to create dataset', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  updateDataset: async (id, datasetData) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.put(`${ENDPOINTS.datasets}/${id}`, datasetData);

      // Show success notification
      notifications.showToast('Dataset updated successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating dataset with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to update dataset', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  deleteDataset: async id => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${ENDPOINTS.datasets}/${id}`);

      // Show success notification
      notifications.showToast('Dataset deleted successfully', 'success', {
        title: 'Success',
      });

      return true;
    } catch (error) {
      console.error(`Error deleting dataset with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to delete dataset', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Release methods
  getReleases: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.releases, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching releases:', error);
      throw error;
    }
  },

  getReleaseById: async id => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.releases}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching release with ID ${id}:`, error);
      throw error;
    }
  },

  createRelease: async releaseData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(ENDPOINTS.releases, releaseData);

      // Show success notification
      notifications.showToast('Release created successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating release:', error);

      // Show error notification
      notifications.showToast('Failed to create release', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  updateRelease: async (id, releaseData) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.put(`${ENDPOINTS.releases}/${id}`, releaseData);

      // Show success notification
      notifications.showToast('Release updated successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating release with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to update release', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  deleteRelease: async id => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${ENDPOINTS.releases}/${id}`);

      // Show success notification
      notifications.showToast('Release deleted successfully', 'success', {
        title: 'Success',
      });

      return true;
    } catch (error) {
      console.error(`Error deleting release with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to delete release', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  executeRelease: async id => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(`${ENDPOINTS.releases}/${id}/execute`);

      // Show success notification
      notifications.showToast('Release execution initiated', 'success', {
        title: 'Success',
      });

      // Add persistent notification
      notifications.addNotification({
        title: 'Release Execution Started',
        message: `Release #${id} execution has been initiated. Check the release status for updates.`,
        type: 'info',
        actionLabel: 'View Status',
        onActionClick: () => (window.location.href = `/admin/releases/${id}`),
      });

      return response.data;
    } catch (error) {
      console.error(`Error executing release with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to execute release', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Tenant methods
  getTenants: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.tenants, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  getTenantById: async id => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.tenants}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tenant with ID ${id}:`, error);
      throw error;
    }
  },

  createTenant: async tenantData => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(ENDPOINTS.tenants, tenantData);

      // Show success notification
      notifications.showToast('Tenant created successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating tenant:', error);

      // Show error notification
      notifications.showToast('Failed to create tenant', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  updateTenant: async (id, tenantData) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.put(`${ENDPOINTS.tenants}/${id}`, tenantData);

      // Show success notification
      notifications.showToast('Tenant updated successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating tenant with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to update tenant', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  deleteTenant: async id => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${ENDPOINTS.tenants}/${id}`);

      // Show success notification
      notifications.showToast('Tenant deleted successfully', 'success', {
        title: 'Success',
      });

      return true;
    } catch (error) {
      console.error(`Error deleting tenant with ID ${id}:`, error);

      // Show error notification
      notifications.showToast('Failed to delete tenant', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Get tenant applications (all applications available to a tenant)
  getTenantApplications: async tenantId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.tenants}/${tenantId}/applications`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching applications for tenant with ID ${tenantId}:`, error);
      throw error;
    }
  },

  // Add application to tenant
  addApplicationToTenant: async (tenantId, applicationId) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.tenants}/${tenantId}/applications/${applicationId}`
      );

      // Show success notification
      notifications.showToast('Application added to tenant successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(`Error adding application to tenant with ID ${tenantId}:`, error);

      // Show error notification
      notifications.showToast('Failed to add application to tenant', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Remove application from tenant
  removeApplicationFromTenant: async (tenantId, applicationId) => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${ENDPOINTS.tenants}/${tenantId}/applications/${applicationId}`);

      // Show success notification
      notifications.showToast('Application removed from tenant successfully', 'success', {
        title: 'Success',
      });

      return true;
    } catch (error) {
      console.error(`Error removing application from tenant with ID ${tenantId}:`, error);

      // Show error notification
      notifications.showToast('Failed to remove application from tenant', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Get tenant datasets
  getTenantDatasets: async tenantId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.tenants}/${tenantId}/datasets`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching datasets for tenant with ID ${tenantId}:`, error);
      throw error;
    }
  },

  // Add dataset to tenant
  addDatasetToTenant: async (tenantId, datasetId) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.tenants}/${tenantId}/datasets/${datasetId}`
      );

      // Show success notification
      notifications.showToast('Dataset added to tenant successfully', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(`Error adding dataset to tenant with ID ${tenantId}:`, error);

      // Show error notification
      notifications.showToast('Failed to add dataset to tenant', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Remove dataset from tenant
  removeDatasetFromTenant: async (tenantId, datasetId) => {
    const notifications = createNotificationManager();
    try {
      await apiClient.delete(`${ENDPOINTS.tenants}/${tenantId}/datasets/${datasetId}`);

      // Show success notification
      notifications.showToast('Dataset removed from tenant successfully', 'success', {
        title: 'Success',
      });

      return true;
    } catch (error) {
      console.error(`Error removing dataset from tenant with ID ${tenantId}:`, error);

      // Show error notification
      notifications.showToast('Failed to remove dataset from tenant', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Get application details with usage statistics
  getApplicationUsageStats: async applicationId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.applications}/${applicationId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching usage stats for application with ID ${applicationId}:`, error);
      throw error;
    }
  },

  // Get dataset details with usage statistics
  getDatasetUsageStats: async datasetId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.datasets}/${datasetId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching usage stats for dataset with ID ${datasetId}:`, error);
      throw error;
    }
  },

  // Schema discovery methods
  discoverApplicationSchema: async (applicationId, method, discoveryConfig = {}) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.applications}/${applicationId}/discover-schema?method=${method}`,
        discoveryConfig
      );
      return response.data;
    } catch (error) {
      console.error(`Error discovering schema for application with ID ${applicationId}:`, error);

      // Show error notification
      notifications.showToast('Failed to discover schema', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },

  createDatasetFromSchema: async (applicationId, name, description, fields) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.applications}/${applicationId}/create-dataset-from-schema?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`,
        fields
      );

      // Show success notification
      notifications.showToast('Dataset created successfully from schema', 'success', {
        title: 'Success',
      });

      return response.data;
    } catch (error) {
      console.error(
        `Error creating dataset from schema for application with ID ${applicationId}:`,
        error
      );

      // Show error notification
      notifications.showToast('Failed to create dataset from schema', 'error', {
        title: 'API Error',
        duration: 8000,
      });

      throw error;
    }
  },
};

export const {
  // Webhook exports
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,

  // Application exports
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,

  // Dataset exports
  getDatasets,
  getDatasetById,
  createDataset,
  updateDataset,
  deleteDataset,

  // Release exports
  getReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  executeRelease,

  // Tenant exports
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantApplications,
  addApplicationToTenant,
  removeApplicationFromTenant,
  getTenantDatasets,
  addDatasetToTenant,
  removeDatasetFromTenant,

  // Usage statistics exports
  getApplicationUsageStats,
  getDatasetUsageStats,

  // Schema discovery exports
  discoverApplicationSchema,
  createDatasetFromSchema,
} = adminService;

export default adminService;
