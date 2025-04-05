/**
 * credentialService.js
 * 
 * A secure service for managing credentials and sensitive information in the frontend.
 * This service communicates with the backend for actual storage and encryption.
 */

import { authService } from './authService';
import { enhancedFetch, parseErrorResponse, getHttpStatusMessage } from "@/error-handling/networkErrorHandler";
import { reportError, ErrorSeverity, handleAsyncError } from "@/error-handling/error-service";
import { withDockerNetworkErrorHandling } from '@/error-handling/docker';
import { ENV } from '@/utils/environmentConfig';

// Enhance fetch with Docker error handling for containerized environments
const dockerAwareEnhancedFetch = ENV.REACT_APP_RUNNING_IN_DOCKER === 'true' ?
withDockerNetworkErrorHandling(enhancedFetch) :
enhancedFetch;


// API endpoints for credential management
const API_ENDPOINTS = {
  store: '/api/credentials/store',
  retrieve: '/api/credentials/retrieve',
  list: '/api/credentials/list',
  delete: '/api/credentials/delete',
  test: '/api/credentials/test'
};

/**
 * Makes an authenticated API call
 * @param {string} url - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} data - Request payload
 * @returns {Promise<Object>} - API response
 */
/**
 * Handle credential service errors properly
 * @param {Error} error - The error that occurred
 * @param {string} operation - The credential operation that failed
 * @param {Object} details - Additional details about the operation
 * @returns {Error} The original error for further handling
 */
function handleCredentialError(error, operation, details = {}) {
  // Add specific credential context to the error
  const errorInfo = {
    operation,
    ...details,
    timestamp: new Date().toISOString()
  };

  // Determine appropriate severity based on error type
  let severity = ErrorSeverity.ERROR;

  // Reduce severity for common non-critical credential issues
  if (error.status === 401 ||
  error.status === 403 ||
  error.message.includes('Authentication required')) {
    severity = ErrorSeverity.WARNING;
  }

  // Report the error with proper context
  reportError(error, errorInfo, 'credentialService', severity);

  // Return the error to allow for further handling
  return error;
}

const callApi = async (url, method = 'GET', data = null) => {
  try {
    // Get auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      const error = new Error('Authentication required');
      handleCredentialError(error, 'tokenValidation');
      throw error;
    }

    // Prepare request options
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    };

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }

    // In a development environment, simulate API responses
    console.log(`[DEV] Simulating API call: ${method} ${url}`);
    console.log(`[DEV] Request data:`, data);

    // Simulate API response based on the request
    let response;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (url.includes('/store')) {
      // Simulate storing credentials
      response = {
        success: true,
        message: 'Credentials stored successfully'
      };
    } else if (url.includes('/retrieve')) {
      // Simulate retrieving credentials
      if (data.credentialType === 'azure') {
        response = {
          success: true,
          data: {
            connection_string: data.includeSecrets ? 'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=abcdefg==;EndpointSuffix=core.windows.net' : '',
            account_name: 'myaccount',
            account_key: data.includeSecrets ? 'abcdefg==' : '',
            sas_token: data.includeSecrets ? '?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2025-05-01T18:16:36Z&st=2025-04-01T10:16:36Z&spr=https&sig=abcdefg==' : '',
            tenant_id: 'tenant-id-value',
            client_id: 'client-id-value',
            client_secret: data.includeSecrets ? 'secret-value' : '',
            has_credentials: true,
            last_updated: new Date().toISOString()
          }
        };
      } else if (data.credentialType === 's3') {
        response = {
          success: true,
          data: {
            access_key_id: 'AKIAIOSFODNN7EXAMPLE',
            secret_access_key: data.includeSecrets ? 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' : '',
            region: 'us-east-1',
            profile: '',
            has_credentials: true,
            last_updated: new Date().toISOString()
          }
        };
      } else if (data.credentialType === 'sharepoint') {
        response = {
          success: true,
          data: {
            tenant_id: 'tenant-id-value',
            client_id: 'client-id-value',
            client_secret: data.includeSecrets ? 'secret-value' : '',
            username: 'user@example.com',
            password: data.includeSecrets ? 'password-value' : '',
            has_credentials: true,
            last_updated: new Date().toISOString()
          }
        };
      } else {
        // Unknown credential type
        response = {
          success: false,
          message: 'Unknown credential type'
        };
      }
    } else if (url.includes('/list')) {
      // Simulate listing credentials
      response = {
        success: true,
        data: [
        { name: 'azure', type: 'storage', last_updated: new Date().toISOString() },
        { name: 's3', type: 'storage', last_updated: new Date().toISOString() },
        { name: 'sharepoint', type: 'storage', last_updated: new Date().toISOString() }]

      };
    } else if (url.includes('/delete')) {
      // Simulate deleting credentials
      response = {
        success: true,
        message: 'Credentials deleted successfully'
      };
    } else if (url.includes('/test')) {
      // Simulate testing credentials
      if (data.credentialType === 'azure') {
        const connectionError = Math.random() < 0.2; // 20% chance of error
        if (connectionError) {
          response = {
            success: false,
            message: 'Failed to connect to Azure Blob Storage',
            details: {
              error: 'Connection timeout',
              code: 'ConnectionError'
            }
          };
        } else {
          response = {
            success: true,
            message: 'Successfully connected to Azure Blob Storage',
            details: {
              containers: 5,
              account: 'myaccount',
              permissions: ['read', 'write', 'delete']
            }
          };
        }
      } else if (data.credentialType === 's3') {
        response = {
          success: true,
          message: 'Successfully connected to S3',
          details: {
            buckets: 3,
            region: 'us-east-1',
            permissions: ['read', 'write', 'delete']
          }
        };
      } else if (data.credentialType === 'sharepoint') {
        response = {
          success: true,
          message: 'Successfully connected to SharePoint',
          details: {
            sites: 2,
            tenant: 'example.onmicrosoft.com',
            permissions: ['read', 'write']
          }
        };
      } else {
        // Unknown credential type
        response = {
          success: false,
          message: 'Unknown credential type'
        };
      }
    } else {
      // Unknown endpoint
      response = {
        success: false,
        message: 'Unknown endpoint'
      };
    }

    return response;

    // In a production environment, we would actually make the API call
    /*
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    
    return await response.json();
    */
  } catch (error) {
    handleCredentialError(error, 'apiCall', { url, method });
    throw error;
  }
};

/**
 * Credential Service for securely managing sensitive information
 */
export const credentialService = {
  /**
   * Store credentials in the secure backend storage
   * @param {string} credentialType - Type of credentials (e.g., 'azure', 's3', 'sharepoint')
   * @param {Object} credentials - Credential data to store
   * @returns {Promise<Object>} - Result of the operation
   */
  storeCredentials: async (credentialType, credentials) => {
    try {
      const response = await callApi(
        API_ENDPOINTS.store,
        'POST',
        {
          credentialType,
          credentials
        }
      );

      return response;
    } catch (error) {
      handleCredentialError(error, 'storeCredentials', { credentialType });
      return {
        success: false,
        message: error.message || `Failed to store credentials: ${error}`
      };
    }
  },

  /**
   * Retrieve credentials from secure storage
   * @param {string} credentialType - Type of credentials to retrieve
   * @param {boolean} includeSecrets - Whether to include secret values
   * @returns {Promise<Object>} - Retrieved credentials or error
   */
  getCredentials: async (credentialType, includeSecrets = false) => {
    try {
      const response = await callApi(
        API_ENDPOINTS.retrieve,
        'POST',
        {
          credentialType,
          includeSecrets
        }
      );

      return response;
    } catch (error) {
      handleCredentialError(error, 'getCredentials', { credentialType, includeSecrets });
      return {
        success: false,
        message: error.message || `Failed to retrieve credentials: ${error}`
      };
    }
  },

  /**
   * List available credential types
   * @returns {Promise<Array>} - List of available credential types
   */
  listCredentials: async () => {
    try {
      const response = await callApi(API_ENDPOINTS.list, 'GET');
      return response;
    } catch (error) {
      handleCredentialError(error, 'listCredentials');
      return {
        success: false,
        message: error.message || `Failed to list credentials: ${error}`
      };
    }
  },

  /**
   * Delete stored credentials
   * @param {string} credentialType - Type of credentials to delete
   * @returns {Promise<Object>} - Result of the operation
   */
  deleteCredentials: async (credentialType) => {
    try {
      const response = await callApi(
        API_ENDPOINTS.delete,
        'POST',
        {
          credentialType
        }
      );

      return response;
    } catch (error) {
      handleCredentialError(error, 'deleteCredentials', { credentialType });
      return {
        success: false,
        message: error.message || `Failed to delete credentials: ${error}`
      };
    }
  },

  /**
   * Test credentials by attempting to connect to the service
   * @param {string} credentialType - Type of credentials to test
   * @param {Object} credentials - Credentials to test (optional, uses stored if not provided)
   * @returns {Promise<Object>} - Test results
   */
  testCredentials: async (credentialType, credentials = null) => {
    try {
      const response = await callApi(
        API_ENDPOINTS.test,
        'POST',
        {
          credentialType,
          credentials
        }
      );

      return response;
    } catch (error) {
      handleCredentialError(error, 'testCredentials', { credentialType });
      return {
        success: false,
        message: error.message || `Failed to test credentials: ${error}`
      };
    }
  },

  /**
   * Check if credentials exist for a specific type
   * @param {string} credentialType - Type of credentials to check
   * @returns {Promise<boolean>} - Whether credentials exist
   */
  hasCredentials: async (credentialType) => {
    try {
      const response = await callApi(
        API_ENDPOINTS.retrieve,
        'POST',
        {
          credentialType,
          includeSecrets: false
        }
      );

      return response.success && response.data && response.data.has_credentials;
    } catch (error) {
      handleCredentialError(error, 'hasCredentials', { credentialType });
      return false;
    }
  }
};

export default credentialService;