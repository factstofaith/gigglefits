// azureConfigService.js
// Service for managing Azure configuration and authentication

import axios from 'axios';

/**
 * Get the current Azure configuration
 * @returns {Promise<Object>} Azure configuration
 */
export const getAzureConfig = async () => {
  try {
    const response = await axios.get('/api/admin/monitoring/azure-config');
    return response.data;
  } catch (error) {
    console.error('Error fetching Azure configuration:', error);
    throw new Error('Failed to fetch Azure configuration');
  }
};

/**
 * Save Azure configuration
 * @param {Object} config - Azure configuration
 * @returns {Promise<Object>} Saved configuration
 */
export const saveAzureConfig = async (config) => {
  try {
    const response = await axios.post('/api/admin/monitoring/azure-config', config);
    return response.data;
  } catch (error) {
    console.error('Error saving Azure configuration:', error);
    throw new Error('Failed to save Azure configuration');
  }
};

/**
 * Test Azure connection with provided configuration
 * @param {Object} config - Azure configuration to test
 * @returns {Promise<Object>} Connection test result
 */
export const testAzureConnection = async (config) => {
  try {
    const response = await axios.post('/api/admin/monitoring/azure-config/test', config);
    return response.data;
  } catch (error) {
    console.error('Error testing Azure connection:', error);
    throw error;
  }
};

/**
 * Get Azure access token using stored credentials
 * @returns {Promise<Object>} Azure token information
 */
export const getAzureToken = async () => {
  try {
    const response = await axios.get('/api/admin/monitoring/azure-token');
    return response.data;
  } catch (error) {
    console.error('Error fetching Azure token:', error);
    throw new Error('Failed to fetch Azure token');
  }
};

/**
 * Check if Azure connection is configured and working
 * @returns {Promise<boolean>} True if connected
 */
export const checkAzureConnection = async () => {
  try {
    const response = await axios.get('/api/admin/monitoring/azure-config/status');
    return response.data.connected;
  } catch (error) {
    console.error('Error checking Azure connection:', error);
    return false;
  }
};

/**
 * Clear stored Azure configuration
 * @returns {Promise<Object>} Result of the operation
 */
export const clearAzureConfig = async () => {
  try {
    const response = await axios.delete('/api/admin/monitoring/azure-config');
    return response.data;
  } catch (error) {
    console.error('Error clearing Azure configuration:', error);
    throw new Error('Failed to clear Azure configuration');
  }
};

export default {
  getAzureConfig,
  saveAzureConfig,
  testAzureConnection,
  getAzureToken,
  checkAzureConnection,
  clearAzureConfig
};