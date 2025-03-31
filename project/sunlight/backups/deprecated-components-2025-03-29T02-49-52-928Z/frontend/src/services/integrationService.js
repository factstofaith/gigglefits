// integrationService.js
// -----------------------------------------------------------------------------
// Service for managing integrations, connecting to the backend API

import axios from 'axios';

// Import auth service for token management
import authService from './/authService';

// Import notification hook factory for optional notification support
import { createNotificationManager } from '@utils/notificationHelper';

// Import flow validation utility
import { createFlowValidator } from '@utils/flowValidation';

// Base API URL - would come from environment config in a real app
const API_BASE_URL = '/api';

// Integration endpoints
const ENDPOINTS = {
  integrations: `${API_BASE_URL}/integrations`,
  sources: `${API_BASE_URL}/integrations/sources`,
  destinations: `${API_BASE_URL}/integrations/destinations`,
  transformations: `${API_BASE_URL}/integrations/transformations`,
  currentUser: `${API_BASE_URL}/integrations/current-user`,
  webhooks: `${API_BASE_URL}/admin/webhooks`,
  earningsCodes: `${API_BASE_URL}/integrations/earnings/codes`,
  datasets: `${API_BASE_URL}/admin/datasets`,
  templates: `${API_BASE_URL}/integrations/templates`,
  flows: `${API_BASE_URL}/integrations/flows`,
};

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
  getIntegrationById: async id => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new integration
  createIntegration: async integrationData => {
    const notifications = createNotificationManager();
    try {
      // Extract dataset IDs if present
      const datasetIds = integrationData.datasetIds || [];

      // Clone the data without the datasetIds property
      const { datasetIds: _, ...integrationDataWithoutDatasets } = integrationData;

      // Create the integration
      const response = await apiClient.post(ENDPOINTS.integrations, integrationDataWithoutDatasets);
      const createdIntegration = response.data;

      // Now associate the datasets if there are any
      if (datasetIds.length > 0) {
        const associationPromises = datasetIds.map(datasetId =>
          apiClient
            .post(`${ENDPOINTS.integrations}/${createdIntegration.id}/datasets/${datasetId}`)
            .catch(err => {
              console.error(`Error associating dataset ${datasetId}:`, err);
              // Return false to indicate failure for this dataset
              return false;
            })
        );

        // Wait for all dataset associations to complete
        const associationResults = await Promise.all(associationPromises);

        // Check if there were any failures
        const failedAssociations = associationResults.filter(result => result === false).length;
        if (failedAssociations > 0) {
          notifications.showToast(
            `Integration created successfully, but ${failedAssociations} dataset(s) could not be associated`,
            'warning',
            { title: 'Partial Success', duration: 8000 }
          );
        } else {
          notifications.showToast('Integration created successfully', 'success', {
            title: 'Success',
          });
        }
      } else {
        notifications.showToast('Integration created successfully', 'success', {
          title: 'Success',
        });
      }

      return createdIntegration;
    } catch (error) {
      console.error('Error creating integration:', error);
      // Show error notification
      notifications.showToast('Failed to create integration', 'error', {
        title: 'API Error',
        duration: 8000,
      });
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
  deleteIntegration: async id => {
    try {
      await apiClient.delete(`${ENDPOINTS.integrations}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Run an integration
  runIntegration: async id => {
    const notifications = createNotificationManager();
    try {
      notifications.showToast('Starting integration run...', 'info', {
        title: 'Running',
      });

      const response = await apiClient.post(`${ENDPOINTS.integrations}/${id}/run`);

      // Add persistent notification for the run
      notifications.addNotification({
        title: 'Integration Run Started',
        message: `Integration #${id} run has been initiated. Check the run logs for details.`,
        type: 'info',
        actionLabel: 'View Run Log',
        onActionClick: () =>
          (window.location.href = `/integrations/${id}/runs/${response.data.runId}`),
      });

      return response.data;
    } catch (error) {
      console.error(`Error running integration with ID ${id}:`, error);

      notifications.showToast(`Failed to run integration #${id}`, 'error', {
        title: 'Run Error',
        duration: 8000,
      });

      throw error;
    }
  },

  // Get integration run history
  getIntegrationHistory: async (id, limit = 10) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${id}/history`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for integration with ID ${id}:`, error);
      throw error;
    }
  },

  // Get field mappings for an integration
  getFieldMappings: async integrationId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${integrationId}/mappings`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching field mappings for integration with ID ${integrationId}:`,
        error
      );
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
      console.error(
        `Error creating field mapping for integration with ID ${integrationId}:`,
        error
      );
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
      console.error(
        `Error updating field mapping ${mappingId} for integration with ID ${integrationId}:`,
        error
      );
      throw error;
    }
  },

  // Delete a field mapping
  deleteFieldMapping: async (integrationId, mappingId) => {
    try {
      await apiClient.delete(`${ENDPOINTS.integrations}/${integrationId}/mappings/${mappingId}`);
      return true;
    } catch (error) {
      console.error(
        `Error deleting field mapping ${mappingId} for integration with ID ${integrationId}:`,
        error
      );
      throw error;
    }
  },

  // Get available sources for integration type
  getAvailableSources: async integrationType => {
    try {
      const response = await apiClient.get(ENDPOINTS.sources, {
        params: { integration_type: integrationType },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching available sources for type ${integrationType}:`, error);
      throw error;
    }
  },

  // Get available destinations for integration type
  getAvailableDestinations: async integrationType => {
    try {
      const response = await apiClient.get(ENDPOINTS.destinations, {
        params: { integration_type: integrationType },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching available destinations for type ${integrationType}:`, error);
      throw error;
    }
  },

  // Get available transformations
  getTransformations: async (dataType = null) => {
    try {
      const params = dataType ? { data_type: dataType } : {};
      const response = await apiClient.get(ENDPOINTS.transformations, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching transformations:`, error);
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
  getAzureBlobConfig: async integrationId => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.integrations}/${integrationId}/azure-blob-config`
      );
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
  testAzureBlobConnection: async integrationId => {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.integrations}/${integrationId}/azure-blob-config/test`
      );
      return response.data;
    } catch (error) {
      console.error(`Error testing Azure Blob connection for integration ${integrationId}:`, error);
      throw error;
    }
  },

  // Get schedule configuration
  getScheduleConfig: async integrationId => {
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
        params: { skip, limit },
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
  },

  // Webhook methods

  // Get webhooks for an integration
  getWebhooks: async integrationId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.webhooks}?integration_id=${integrationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching webhooks for integration ${integrationId}:`, error);
      throw error;
    }
  },

  // Create a new webhook
  createWebhook: async webhookData => {
    try {
      const response = await apiClient.post(ENDPOINTS.webhooks, webhookData);
      return response.data;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  },

  // Get a webhook by ID
  getWebhook: async webhookId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.webhooks}/${webhookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching webhook ${webhookId}:`, error);
      throw error;
    }
  },

  // Update a webhook
  updateWebhook: async (webhookId, webhookData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.webhooks}/${webhookId}`, webhookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating webhook ${webhookId}:`, error);
      throw error;
    }
  },

  // Delete a webhook
  deleteWebhook: async webhookId => {
    try {
      await apiClient.delete(`${ENDPOINTS.webhooks}/${webhookId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting webhook ${webhookId}:`, error);
      throw error;
    }
  },

  // Get webhook logs
  getWebhookLogs: async (webhookId, params = {}) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.webhooks}/${webhookId}/logs`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching logs for webhook ${webhookId}:`, error);
      throw error;
    }
  },

  // Test a webhook
  testWebhook: async webhookId => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.webhooks}/${webhookId}/test`);
      return response.data;
    } catch (error) {
      console.error(`Error testing webhook ${webhookId}:`, error);
      throw error;
    }
  },

  // Dataset methods

  // Get datasets associated with an integration
  getIntegrationDatasets: async integrationId => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.integrations}/${integrationId}/datasets`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching datasets for integration ${integrationId}:`, error);
      throw error;
    }
  },

  // Associate a dataset with an integration
  associateDataset: async (integrationId, datasetId) => {
    try {
      await apiClient.post(`${ENDPOINTS.integrations}/${integrationId}/datasets/${datasetId}`);
      return true;
    } catch (error) {
      console.error(
        `Error associating dataset ${datasetId} with integration ${integrationId}:`,
        error
      );
      throw error;
    }
  },

  // Remove dataset association from an integration
  disassociateDataset: async (integrationId, datasetId) => {
    try {
      await apiClient.delete(`${ENDPOINTS.integrations}/${integrationId}/datasets/${datasetId}`);
      return true;
    } catch (error) {
      console.error(
        `Error disassociating dataset ${datasetId} from integration ${integrationId}:`,
        error
      );
      throw error;
    }
  },

  // Earnings mapping methods

  // Get earnings mappings for an integration
  getEarningsMappings: async integrationId => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.integrations}/${integrationId}/earnings/mappings`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching earnings mappings for integration ${integrationId}:`, error);
      throw error;
    }
  },

  // Create a new earnings mapping
  createEarningsMapping: async (integrationId, mappingData) => {
    const notifications = createNotificationManager();
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.integrations}/${integrationId}/earnings/mappings`,
        mappingData
      );
      notifications.showToast('Earnings mapping created successfully', 'success', {
        title: 'Success',
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating earnings mapping for integration ${integrationId}:`, error);
      notifications.showToast('Failed to create earnings mapping', 'error', {
        title: 'API Error',
        duration: 8000,
      });
      throw error;
    }
  },

  // Update an earnings mapping
  updateEarningsMapping: async (integrationId, mappingId, mappingData) => {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.integrations}/${integrationId}/earnings/mappings/${mappingId}`,
        mappingData
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating earnings mapping ${mappingId} for integration ${integrationId}:`,
        error
      );
      throw error;
    }
  },

  // Delete an earnings mapping
  deleteEarningsMapping: async (integrationId, mappingId) => {
    try {
      await apiClient.delete(
        `${ENDPOINTS.integrations}/${integrationId}/earnings/mappings/${mappingId}`
      );
      return true;
    } catch (error) {
      console.error(
        `Error deleting earnings mapping ${mappingId} for integration ${integrationId}:`,
        error
      );
      throw error;
    }
  },

  // Test an earnings mapping with sample data
  testEarningsMapping: async (integrationId, mappingId, testData) => {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.integrations}/${integrationId}/earnings/mappings/${mappingId}/test`,
        testData
      );
      return response.data;
    } catch (error) {
      console.error(`Error testing earnings mapping ${mappingId}:`, error);
      throw error;
    }
  },

  // Earnings codes methods

  // Get all earnings codes with optional filtering
  getEarningsCodes: async destinationSystem => {
    try {
      const params = destinationSystem ? { destination_system: destinationSystem } : {};
      const response = await apiClient.get(ENDPOINTS.earningsCodes, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings codes:', error);
      throw error;
    }
  },

  // Create a new earnings code
  createEarningsCode: async codeData => {
    try {
      const response = await apiClient.post(ENDPOINTS.earningsCodes, codeData);
      return response.data;
    } catch (error) {
      console.error('Error creating earnings code:', error);
      throw error;
    }
  },

  // Update an earnings code
  updateEarningsCode: async (codeId, codeData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.earningsCodes}/${codeId}`, codeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating earnings code ${codeId}:`, error);
      throw error;
    }
  },
};

// Add getDatasets method to integrationService
integrationService.getDatasets = async (params = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.datasets, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
};

// Template-related methods

// Get all integration templates with optional filtering
integrationService.getTemplates = async (params = {}) => {
  try {
    const response = await apiClient.get(ENDPOINTS.templates, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching integration templates:', error);
    throw error;
  }
};

// Get a specific template by ID
integrationService.getTemplateById = async templateId => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.templates}/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching template with ID ${templateId}:`, error);
    throw error;
  }
};

// Create a new template from an existing integration
integrationService.createTemplateFromIntegration = async (integrationId, templateData) => {
  const notifications = createNotificationManager();
  try {
    const response = await apiClient.post(
      `${ENDPOINTS.integrations}/${integrationId}/save-as-template`,
      templateData
    );

    notifications.showToast('Integration template created successfully', 'success', {
      title: 'Success',
    });

    return response.data;
  } catch (error) {
    console.error('Error creating template from integration:', error);
    notifications.showToast('Failed to create integration template', 'error', {
      title: 'API Error',
      duration: 8000,
    });
    throw error;
  }
};

// Create a new template directly
integrationService.createTemplate = async templateData => {
  const notifications = createNotificationManager();
  try {
    const response = await apiClient.post(ENDPOINTS.templates, templateData);

    notifications.showToast('Integration template created successfully', 'success', {
      title: 'Success',
    });

    return response.data;
  } catch (error) {
    console.error('Error creating integration template:', error);
    notifications.showToast('Failed to create integration template', 'error', {
      title: 'API Error',
      duration: 8000,
    });
    throw error;
  }
};

// Update an existing template
integrationService.updateTemplate = async (templateId, templateData) => {
  try {
    const response = await apiClient.put(`${ENDPOINTS.templates}/${templateId}`, templateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating template with ID ${templateId}:`, error);
    throw error;
  }
};

// Delete a template
integrationService.deleteTemplate = async templateId => {
  try {
    await apiClient.delete(`${ENDPOINTS.templates}/${templateId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting template with ID ${templateId}:`, error);
    throw error;
  }
};

// Create a new integration from a template
integrationService.createIntegrationFromTemplate = async (templateId, customizationData = {}) => {
  const notifications = createNotificationManager();
  try {
    const response = await apiClient.post(
      `${ENDPOINTS.templates}/${templateId}/create-integration`,
      customizationData
    );

    notifications.showToast('Integration created successfully from template', 'success', {
      title: 'Success',
    });

    return response.data;
  } catch (error) {
    console.error(`Error creating integration from template ${templateId}:`, error);
    notifications.showToast('Failed to create integration from template', 'error', {
      title: 'API Error',
      duration: 8000,
    });
    throw error;
  }
};

// Flow-related methods

// Get flow data for an integration
integrationService.getIntegrationFlow = async integrationId => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.flows}/${integrationId}`);
    return response.data;
  } catch (error) {
    // If 404, it's a new integration without a flow yet - return empty flow
    if (error.response && error.response.status === 404) {
      return { nodes: [], edges: [] };
    }
    console.error(`Error fetching flow data for integration ${integrationId}:`, error);
    throw error;
  }
};

// Save flow data for an integration
integrationService.saveIntegrationFlow = async (integrationId, flowData) => {
  const notifications = createNotificationManager();
  try {
    const response = await apiClient.put(`${ENDPOINTS.flows}/${integrationId}`, flowData);
    
    notifications.showToast('Integration flow saved successfully', 'success', {
      title: 'Success',
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error saving flow data for integration ${integrationId}:`, error);
    
    notifications.showToast('Failed to save integration flow', 'error', {
      title: 'API Error',
      duration: 8000,
    });
    
    throw error;
  }
};

// Validate flow data - uses both client-side validation and server-side validation
integrationService.validateIntegrationFlow = async (integrationId, flowData) => {
  const notifications = createNotificationManager();
  
  try {
    // First perform client-side validation
    const flowValidator = createFlowValidator();
    const clientValidation = flowValidator.validateFlow(flowData.nodes, flowData.edges);
    
    // If there are critical errors in client validation, return immediately
    if (!clientValidation.isValid) {
      return {
        isValid: false,
        clientErrors: clientValidation.errors,
        clientWarnings: clientValidation.warnings,
        clientInfo: clientValidation.info,
        serverErrors: [],
        serverWarnings: [],
        validationSource: 'client'
      };
    }
    
    // If client validation passes, proceed with server validation
    try {
      const response = await apiClient.post(`${ENDPOINTS.flows}/${integrationId}/validate`, flowData);
      
      // Combine client and server validation results
      const serverResult = response.data;
      
      return {
        isValid: serverResult.isValid && clientValidation.isValid,
        clientErrors: clientValidation.errors,
        clientWarnings: clientValidation.warnings,
        clientInfo: clientValidation.info,
        serverErrors: serverResult.errors || [],
        serverWarnings: serverResult.warnings || [],
        validationSource: 'both'
      };
    } catch (serverError) {
      // If server validation fails but client validation passed,
      // still return the client validation results with error info
      console.error(`Server validation error for integration ${integrationId}:`, serverError);
      
      return {
        isValid: false,
        clientErrors: clientValidation.errors,
        clientWarnings: clientValidation.warnings,
        clientInfo: clientValidation.info,
        serverErrors: [{
          id: 'server-validation-failed',
          severity: 'error',
          message: 'Server validation failed',
          details: serverError.message || 'Could not validate flow on server',
          recommendation: 'Check server logs for more details'
        }],
        serverWarnings: [],
        validationSource: 'client'
      };
    }
  } catch (error) {
    console.error(`Error during flow validation for integration ${integrationId}:`, error);
    
    notifications.showToast('Flow validation failed', 'error', {
      title: 'Validation Error',
      duration: 5000,
    });
    
    throw error;
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
  getTransformations,
  discoverFields,
  getAzureBlobConfig,
  updateAzureBlobConfig,
  testAzureBlobConnection,
  getScheduleConfig,
  updateScheduleConfig,
  getIntegrationRuns,
  getCurrentUser,
  getWebhooks,
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs,
  testWebhook,
  // Dataset methods
  getDatasets,
  getIntegrationDatasets,
  associateDataset,
  disassociateDataset,
  // Earnings mapping methods
  getEarningsMappings,
  createEarningsMapping,
  updateEarningsMapping,
  deleteEarningsMapping,
  testEarningsMapping,
  // Earnings codes methods
  getEarningsCodes,
  createEarningsCode,
  updateEarningsCode,
  // Template methods
  getTemplates,
  getTemplateById,
  createTemplateFromIntegration,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createIntegrationFromTemplate,
  // Flow methods
  getIntegrationFlow,
  saveIntegrationFlow,
  validateIntegrationFlow,
} = integrationService;

export default integrationService;
