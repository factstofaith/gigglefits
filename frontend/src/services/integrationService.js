// integrationService.js
// -----------------------------------------------------------------------------
// Service for managing integrations, connecting to the backend API

import axios from 'axios';

// Base API URL - would come from environment config in a real app
const API_BASE_URL = '/api';

// Integration endpoints
const ENDPOINTS = {
  integrations: `${API_BASE_URL}/integrations`,
  sources: `${API_BASE_URL}/integrations/sources`,
  destinations: `${API_BASE_URL}/integrations/destinations`,
  currentUser: `${API_BASE_URL}/integrations/current-user`
};

// Configure axios for authentication
const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API client with authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(config => {
  const headers = getAuthHeader();
  config.headers = { ...config.headers, ...headers };
  return config;
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized or 403 Forbidden errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error);
      
      // Clear auth state and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      
      // Show login modal or redirect to login page
      // For now, just redirect to home
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Integration service with API methods
const integrationService = {
  // Get all integrations with optional filtering
  getIntegrations: async (params = {}) => {
    try {
      const response = await apiClient.get(ENDPOINTS.integrations, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  },

  // Get integration by ID
  getIntegrationById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new integration
  createIntegration: async (integrationData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.integrations, integrationData);
      return response.data;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  },

  // Update an existing integration
  updateIntegration: async (id, integrationData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.integrations}/${id}`, integrationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an integration
  deleteIntegration: async (id) => {
    try {
      await apiClient.delete(`${ENDPOINTS.integrations}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Run an integration
  runIntegration: async (id) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.integrations}/${id}/run`);
      return response.data;
    } catch (error) {
      console.error(`Error running integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Get integration run history
  getIntegrationHistory: async (id, limit = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${id}/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for integration with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Get field mappings for an integration
  getFieldMappings: async (integrationId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${integrationId}/mappings`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching field mappings for integration with ID ${integrationId}:`, error);
      throw error;
    }
  },

  // Create a new field mapping
  createFieldMapping: async (integrationId, mappingData) => {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.integrations}/${integrationId}/mappings`, 
        mappingData
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating field mapping for integration with ID ${integrationId}:`, error);
      throw error;
    }
  },

  // Update a field mapping
  updateFieldMapping: async (integrationId, mappingId, mappingData) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.integrations}/${integrationId}/mappings/${mappingId}`, 
        mappingData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating field mapping ${mappingId} for integration with ID ${integrationId}:`, error);
      throw error;
    }
  },

  // Delete a field mapping
  deleteFieldMapping: async (integrationId, mappingId) => {
    try {
      await apiClient.delete(`${ENDPOINTS.integrations}/${integrationId}/mappings/${mappingId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting field mapping ${mappingId} for integration with ID ${integrationId}:`, error);
      throw error;
    }
  },

  // Get available sources for integration type
  getAvailableSources: async (integrationType) => {
    try {
      const response = await apiClient.get(ENDPOINTS.sources, {
        params: { integration_type: integrationType }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching available sources for type ${integrationType}:`, error);
      throw error;
    }
  },

  // Get available destinations for integration type
  getAvailableDestinations: async (integrationType) => {
    try {
      const response = await apiClient.get(ENDPOINTS.destinations, {
        params: { integration_type: integrationType }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching available destinations for type ${integrationType}:`, error);
      throw error;
    }
  },

  // Discover fields from a source or destination
  discoverFields: async (integrationId, sourceOrDest = 'source') => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.integrations}/${integrationId}/discover-fields`, 
        { params: { source_or_dest: sourceOrDest } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error discovering fields for integration ${integrationId}:`, error);
      throw error;
    }
  },
  
  // Get Azure Blob Storage configuration
  getAzureBlobConfig: async (integrationId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${integrationId}/azure-blob-config`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Azure Blob config for integration ${integrationId}:`, error);
      throw error;
    }
  },
  
  // Update Azure Blob Storage configuration
  updateAzureBlobConfig: async (integrationId, config) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.integrations}/${integrationId}/azure-blob-config`,
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating Azure Blob config for integration ${integrationId}:`, error);
      throw error;
    }
  },
  
  // Test Azure Blob Storage connection
  testAzureBlobConnection: async (integrationId) => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.integrations}/${integrationId}/azure-blob-config/test`);
      return response.data;
    } catch (error) {
      console.error(`Error testing Azure Blob connection for integration ${integrationId}:`, error);
      throw error;
    }
  },
  
  // Get schedule configuration
  getScheduleConfig: async (integrationId) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${integrationId}/schedule`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule config for integration ${integrationId}:`, error);
      throw error;
    }
  },
  
  // Update schedule configuration
  updateScheduleConfig: async (integrationId, schedule) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.integrations}/${integrationId}/schedule`,
        schedule
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule config for integration ${integrationId}:`, error);
      throw error;
    }
  },
  
  // Get detailed run history
  getIntegrationRuns: async (integrationId, skip = 0, limit = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${integrationId}/runs`, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching run history for integration ${integrationId}:`, error);
      throw error;
    }
  },
  
  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.currentUser);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

export const {
  getIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  runIntegration,
  getIntegrationHistory,
  getFieldMappings,
  createFieldMapping,
  updateFieldMapping,
  deleteFieldMapping,
  getAvailableSources,
  getAvailableDestinations,
  discoverFields,
  getAzureBlobConfig,
  updateAzureBlobConfig,
  testAzureBlobConnection,
  getScheduleConfig,
  updateScheduleConfig,
  getIntegrationRuns,
  getCurrentUser
} = integrationService;

export default integrationService;