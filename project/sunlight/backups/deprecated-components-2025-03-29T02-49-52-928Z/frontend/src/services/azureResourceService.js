// azureResourceService.js
// Service for discovering and managing Azure resources

import axios from 'axios';

/**
 * Get all Azure resources within a subscription or resource group
 * @param {string} resourceGroup - Optional resource group to filter by
 * @returns {Promise<Array>} List of Azure resources
 */
export const getAzureResources = async (resourceGroup) => {
  try {
    const response = await axios.get('/api/admin/monitoring/azure/resources', {
      params: { resourceGroup }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Azure resources:', error);
    throw new Error('Failed to fetch Azure resources');
  }
};

/**
 * Get details for a specific Azure resource
 * @param {string} resourceId - Azure resource ID
 * @returns {Promise<Object>} Resource details
 */
export const getResourceDetails = async (resourceId) => {
  try {
    const response = await axios.get(`/api/admin/monitoring/azure/resources/${encodeURIComponent(resourceId)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resource details for ${resourceId}:`, error);
    throw new Error('Failed to fetch resource details');
  }
};

/**
 * Get resource types available in the subscription
 * @returns {Promise<Array>} List of resource types
 */
export const getResourceTypes = async () => {
  try {
    const response = await axios.get('/api/admin/monitoring/azure/resource-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching resource types:', error);
    throw new Error('Failed to fetch resource types');
  }
};

/**
 * Get resource groups in the configured subscription
 * @returns {Promise<Array>} List of resource groups
 */
export const getResourceGroups = async () => {
  try {
    const response = await axios.get('/api/admin/monitoring/azure/resource-groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching resource groups:', error);
    throw new Error('Failed to fetch resource groups');
  }
};

/**
 * Get resource health status
 * @param {string} resourceId - Azure resource ID
 * @returns {Promise<Object>} Health status
 */
export const getResourceHealth = async (resourceId) => {
  try {
    const response = await axios.get(`/api/admin/monitoring/azure/health/${encodeURIComponent(resourceId)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching health for ${resourceId}:`, error);
    throw new Error('Failed to fetch resource health');
  }
};

/**
 * Discover all resources based on the configured Azure subscription
 * Performs a full discovery and updates the local database
 * @returns {Promise<Object>} Discovery results
 */
export const discoverResources = async () => {
  try {
    const response = await axios.post('/api/admin/monitoring/azure/discover');
    return response.data;
  } catch (error) {
    console.error('Error discovering resources:', error);
    throw new Error('Failed to discover resources');
  }
};

/**
 * Get the status of the most recent resource discovery operation
 * @returns {Promise<Object>} Discovery status
 */
export const getDiscoveryStatus = async () => {
  try {
    const response = await axios.get('/api/admin/monitoring/azure/discover/status');
    return response.data;
  } catch (error) {
    console.error('Error getting discovery status:', error);
    throw new Error('Failed to get discovery status');
  }
};

export default {
  getAzureResources,
  getResourceDetails,
  getResourceTypes,
  getResourceGroups,
  getResourceHealth,
  discoverResources,
  getDiscoveryStatus
};