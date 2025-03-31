/**
 * WebhookContext.jsx
 * -----------------------------------------------------------------------------
 * Context provider for managing webhook configurations and integrations across
 * the application. Manages webhook data, templates, and provides methods for
 * interacting with webhook-related API endpoints.
 * 
 * @module contexts/WebhookContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createApiService } from '@utils/apiServiceFactory';

/**
 * Context for webhook management
 * Provides webhook data and operations to components
 * @type {React.Context}
 */
const WebhookContext = createContext();

/**
 * Custom hook for accessing the webhook context
 * Provides a convenient way to access webhook state and operations
 * 
 * @function
 * @returns {Object} Webhook context value
 * @throws {Error} If used outside of a WebhookProvider
 * 
 * @example
 * // Inside a component
 * function WebhookList() {
  // Added display name
  WebhookList.displayName = 'WebhookList';

 *   const { 
 *     webhooks, 
 *     isLoading, 
 *     error, 
 *     fetchWebhooks,
 *     deleteWebhook
 *   } = useWebhook();
 *   
 *   // Component logic using webhook context...
 * }
 */
export const useWebhook = () => {
  // Added display name
  useWebhook.displayName = 'useWebhook';

  // Added display name
  useWebhook.displayName = 'useWebhook';

  // Added display name
  useWebhook.displayName = 'useWebhook';

  // Added display name
  useWebhook.displayName = 'useWebhook';

  // Added display name
  useWebhook.displayName = 'useWebhook';


  const context = useContext(WebhookContext);
  if (!context) {
    throw new Error('useWebhook must be used within a WebhookProvider');
  }
  return context;
};

/**
 * Default API service for webhook operations
 * Configured with caching to optimize request performance
 * @type {Object}
 * @private
 */
const defaultWebhookApiService = createApiService({
  baseUrl: '/api/webhooks',
  entityName: 'webhook',
  cacheConfig: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
});

/**
 * Provider component for webhook-related state and operations
 * Supports dependency injection for service implementations to facilitate testing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.apiService=defaultWebhookApiService] - Service implementation for API operations
 * @returns {React.ReactElement} Provider component
 * 
 * @example
 * // Basic usage
 * function App() {
  // Added display name
  App.displayName = 'App';

 *   return (
 *     <WebhookProvider>
 *       <WebhookList />
 *       <WebhookDetails />
 *     </WebhookProvider>
 *   );
 * }
 * 
 * // With custom service implementation for testing
 * function TestComponent({ mockService }) {
  // Added display name
  TestComponent.displayName = 'TestComponent';

 *   return (
 *     <WebhookProvider apiService={mockService}>
 *       <ComponentUnderTest />
 *     </WebhookProvider>
 *   );
 * }
 */
export const WebhookProvider = ({ children, apiService = defaultWebhookApiService }) => {
  // Added display name
  WebhookProvider.displayName = 'WebhookProvider';

  // Added display name
  WebhookProvider.displayName = 'WebhookProvider';

  // Added display name
  WebhookProvider.displayName = 'WebhookProvider';

  // Added display name
  WebhookProvider.displayName = 'WebhookProvider';

  // Added display name
  WebhookProvider.displayName = 'WebhookProvider';


  /**
   * State to store the list of all webhooks
   * @type {[Array<Object>, Function]} Webhooks array and setter function
   */
  const [webhooks, setWebhooks] = useState([]);
  
  /**
   * State to store the currently selected webhook
   * @type {[Object|null, Function]} Webhook object and setter function
   */
  const [webhook, setWebhook] = useState(null);

  /**
   * State to store available webhook templates
   * @type {[Array<Object>, Function]} Templates array and setter function
   */
  const [webhookTemplates, setWebhookTemplates] = useState([]);

  /**
   * State to store integration status for webhooks
   * @type {[Object, Function]} Status object (keyed by webhook ID) and setter function
   */
  const [integrationStatus, setIntegrationStatus] = useState({});
  
  /**
   * State to store webhook events history
   * @type {[Object, Function]} Events object (keyed by webhook ID) and setter function
   */
  const [webhookEvents, setWebhookEvents] = useState({});
  
  /**
   * State to store webhook security settings
   * @type {[Object, Function]} Security settings object and setter function
   */
  const [securitySettings, setSecuritySettings] = useState({});

  /**
   * Loading state for general webhook operations
   * @type {[boolean, Function]} Loading state and setter function
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Loading state for template operations
   * @type {[boolean, Function]} Template loading state and setter function
   */
  const [templateLoading, setTemplateLoading] = useState(false);
  
  /**
   * Loading state for integration status operations
   * @type {[boolean, Function]} Status loading state and setter function
   */
  const [statusLoading, setStatusLoading] = useState(false);
  
  /**
   * Loading state for webhook events operations
   * @type {[boolean, Function]} Events loading state and setter function
   */
  const [eventsLoading, setEventsLoading] = useState(false);
  
  /**
   * Loading state for security settings operations
   * @type {[boolean, Function]} Security settings loading state and setter function
   */
  const [securityLoading, setSecurityLoading] = useState(false);

  /**
   * Error state for general webhook operations
   * @type {[string|null, Function]} Error message and setter function
   */
  const [error, setError] = useState(null);
  
  /**
   * Error state for template operations
   * @type {[string|null, Function]} Template error message and setter function
   */
  const [templateError, setTemplateError] = useState(null);
  
  /**
   * Error state for integration status operations
   * @type {[string|null, Function]} Status error message and setter function
   */
  const [statusError, setStatusError] = useState(null);
  
  /**
   * Error state for webhook events operations
   * @type {[string|null, Function]} Events error message and setter function
   */
  const [eventsError, setEventsError] = useState(null);
  
  /**
   * Error state for security settings operations
   * @type {[string|null, Function]} Security settings error message and setter function
   */
  const [securityError, setSecurityError] = useState(null);

  /**
   * Fetches all webhooks from the API
   * 
   * @function
   * @async
   * @returns {Promise<Array<Object>>} Array of webhook objects
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Fetch all webhooks
   * const allWebhooks = await fetchWebhooks();
   */
  const fetchWebhooks = useCallback(async () => {
  // Added display name
  fetchWebhooks.displayName = 'fetchWebhooks';

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.getAll();
      setWebhooks(data);
      return data;
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setError('Failed to fetch webhooks');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetches a specific webhook by ID
   * 
   * @function
   * @async
   * @param {string|number} id - ID of the webhook to fetch
   * @returns {Promise<Object>} Webhook object
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Fetch a specific webhook
   * const webhookDetails = await fetchWebhookById('webhook-123');
   */
  const fetchWebhookById = useCallback(async id => {
  // Added display name
  fetchWebhookById.displayName = 'fetchWebhookById';

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.getById(id);
      setWebhook(data);
      return data;
    } catch (error) {
      console.error(`Error fetching webhook with ID ${id}:`, error);
      setError('Failed to fetch webhook details');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Creates a new webhook
   * 
   * @function
   * @async
   * @param {Object} webhookData - Data for the new webhook
   * @param {string} webhookData.name - Webhook name
   * @param {string} webhookData.url - Webhook endpoint URL
   * @param {string} [webhookData.method='POST'] - HTTP method
   * @param {Object} [webhookData.headers] - HTTP headers
   * @param {string} [webhookData.contentType='application/json'] - Content type
   * @param {Array<string>} [webhookData.events] - Events to trigger webhook
   * @returns {Promise<Object>} Newly created webhook
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Create a new webhook
   * const newWebhook = await createWebhook({
   *   name: 'My Webhook',
   *   url: 'https://example.com/webhook',
   *   method: 'POST',
   *   events: ['integration.completed', 'integration.failed']
   * });
   */
  const createWebhook = useCallback(async webhookData => {
  // Added display name
  createWebhook.displayName = 'createWebhook';

    setIsLoading(true);
    setError(null);

    try {
      const newWebhook = await apiService.create(webhookData);
      setWebhooks(prev => [...(prev || []), newWebhook]);
      setWebhook(newWebhook);
      return newWebhook;
    } catch (error) {
      console.error('Error creating webhook:', error);
      setError('Failed to create webhook');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  /**
   * Updates an existing webhook
   * 
   * @function
   * @async
   * @param {string|number} id - ID of the webhook to update
   * @param {Object} webhookData - New webhook data
   * @returns {Promise<Object>} Updated webhook
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Update a webhook
   * const updatedWebhook = await updateWebhook('webhook-123', {
   *   name: 'Updated Webhook Name',
   *   events: ['integration.completed', 'integration.failed', 'integration.started']
   * });
   */
  const updateWebhook = useCallback(async (id, webhookData) => {
  // Added display name
  updateWebhook.displayName = 'updateWebhook';

    setIsLoading(true);
    setError(null);

    try {
      const updatedWebhook = await apiService.update(id, webhookData);
      setWebhooks(prev => (prev || []).map(hook => (hook.id === id ? updatedWebhook : hook)));
      setWebhook(updatedWebhook);
      return updatedWebhook;
    } catch (error) {
      console.error(`Error updating webhook with ID ${id}:`, error);
      setError('Failed to update webhook');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  /**
   * Deletes a webhook
   * Also updates the webhooks list and clears the selected webhook if it matches the deleted one
   * 
   * @function
   * @async
   * @param {string|number} id - ID of the webhook to delete
   * @returns {Promise<boolean>} True if successful
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Delete a webhook
   * try {
   *   await deleteWebhook('webhook-123');
   * } catch (error) {
   *   console.error('Failed to delete webhook:', error);
   * }
   */
  const deleteWebhook = useCallback(
    async id => {
  // Added display name
  deleteWebhook.displayName = 'deleteWebhook';

      setIsLoading(true);
      setError(null);

      try {
        await apiService.delete(id);
        setWebhooks(prev => (prev || []).filter(hook => hook.id !== id));
        if (webhook?.id === id) {
          setWebhook(null);
        }
        return true;
      } catch (error) {
        console.error(`Error deleting webhook with ID ${id}:`, error);
        setError('Failed to delete webhook');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [webhook, apiService]
  );

  /**
   * Tests a webhook by sending a test payload
   * 
   * @function
   * @async
   * @param {string|number} id - ID of the webhook to test
   * @param {Object} [testData={}] - Test payload data
   * @returns {Promise<Object>} Test result
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Test a webhook with custom data
   * const result = await testWebhook('webhook-123', {
   *   event: 'test.event',
   *   data: { message: 'This is a test' }
   * });
   * 
   * // Test a webhook with default data
   * const defaultResult = await testWebhook('webhook-123');
   */
  const testWebhook = useCallback(async (id, testData = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.executeCustom(`${id}/test`, 'POST', testData);
      return result;
    } catch (error) {
      console.error(`Error testing webhook with ID ${id}:`, error);
      setError('Failed to test webhook');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetches available webhook templates
   * 
   * @function
   * @async
   * @returns {Promise<Array<Object>>} Array of template objects
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Fetch all available webhook templates
   * const templates = await fetchWebhookTemplates();
   */
  const fetchWebhookTemplates = useCallback(async () => {
  // Added display name
  fetchWebhookTemplates.displayName = 'fetchWebhookTemplates';

    setTemplateLoading(true);
    setTemplateError(null);

    try {
      const templates = await apiService.executeCustom('templates', 'GET');
      setWebhookTemplates(templates);
      return templates;
    } catch (error) {
      console.error('Error fetching webhook templates:', error);
      setTemplateError('Failed to fetch webhook templates');
      throw error;
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  /**
   * Creates a new webhook from a template
   * 
   * @function
   * @async
   * @param {string|number} templateId - ID of the template to use
   * @param {Object} [customization={}] - Custom properties to override template defaults
   * @returns {Promise<Object>} Newly created webhook
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Create webhook from template with customizations
   * const newWebhook = await createWebhookFromTemplate('template-123', {
   *   name: 'Custom Template Webhook',
   *   url: 'https://my-custom-endpoint.com/webhook'
   * });
   * 
   * // Create webhook from template with defaults
   * const defaultWebhook = await createWebhookFromTemplate('template-123');
   */
  const createWebhookFromTemplate = useCallback(async (templateId, customization = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const newWebhook = await apiService.executeCustom('create-from-template', 'POST', {
        templateId,
        ...customization,
      });

      setWebhooks(prev => [...(prev || []), newWebhook]);
      setWebhook(newWebhook);
      return newWebhook;
    } catch (error) {
      console.error('Error creating webhook from template:', error);
      setError('Failed to create webhook from template');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  /**
   * Fetches integration status for a webhook
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @returns {Promise<Object>} Integration status object
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Get current integration status
   * const status = await fetchIntegrationStatus('webhook-123');
   */
  const fetchIntegrationStatus = useCallback(async webhookId => {
  // Added display name
  fetchIntegrationStatus.displayName = 'fetchIntegrationStatus';

    setStatusLoading(true);
    setStatusError(null);

    try {
      const status = await apiService.executeCustom(
        `${webhookId}/integration-status`,
        'GET'
      );
      setIntegrationStatus(prev => ({
        ...prev,
        [webhookId]: status,
      }));
      return status;
    } catch (error) {
      console.error(`Error fetching integration status for webhook ${webhookId}:`, error);
      setStatusError('Failed to fetch integration status');
      throw error;
    } finally {
      setStatusLoading(false);
    }
  }, []);

  /**
   * Fetches execution logs for a webhook
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @param {Object} [params={}] - Query parameters for filtering logs
   * @param {number} [params.limit] - Maximum number of logs to retrieve
   * @param {number} [params.offset] - Offset for pagination
   * @param {string} [params.status] - Filter by status (success, failed)
   * @param {string} [params.startDate] - Filter by start date
   * @param {string} [params.endDate] - Filter by end date
   * @returns {Promise<Array<Object>>} Array of log entries
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Get all logs for a webhook
   * const allLogs = await fetchWebhookLogs('webhook-123');
   * 
   * // Get recent successful logs with pagination
   * const successLogs = await fetchWebhookLogs('webhook-123', {
   *   status: 'success',
   *   limit: 10,
   *   offset: 0
   * });
   */
  const fetchWebhookLogs = useCallback(async (webhookId, params = {}) => {
    try {
      const logs = await apiService.executeCustom(`${webhookId}/logs`, 'GET', null, {
        params,
      });
      return logs;
    } catch (error) {
      console.error(`Error fetching logs for webhook ${webhookId}:`, error);
      throw error;
    }
  }, []);

  /**
   * Generates documentation for a webhook
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @returns {Promise<Object>} Documentation object
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Generate documentation for a webhook
   * const docs = await generateWebhookDocumentation('webhook-123');
   */
  const generateWebhookDocumentation = useCallback(async webhookId => {
  // Added display name
  generateWebhookDocumentation.displayName = 'generateWebhookDocumentation';

    try {
      const documentation = await apiService.executeCustom(
        `${webhookId}/documentation`,
        'GET'
      );
      return documentation;
    } catch (error) {
      console.error(`Error generating documentation for webhook ${webhookId}:`, error);
      throw error;
    }
  }, [apiService]);

  /**
   * Parses a webhook payload for testing
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @param {Object|string} payload - Webhook payload to parse
   * @returns {Promise<Object>} Parsed payload data
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Parse a JSON payload
   * const parsedData = await parseWebhookPayload('webhook-123', {
   *   event: 'order.created',
   *   data: { id: '12345', total: 99.99 }
   * });
   * 
   * // Parse a string payload
   * const parsedStringData = await parseWebhookPayload('webhook-123', 
   *   '{"event":"order.created","data":{"id":"12345","total":99.99}}'
   * );
   */
  const parseWebhookPayload = useCallback(async (webhookId, payload) => {
  // Added display name
  parseWebhookPayload.displayName = 'parseWebhookPayload';

    try {
      const parsedData = await apiService.executeCustom(
        `${webhookId}/parse-payload`,
        'POST',
        { payload }
      );
      return parsedData;
    } catch (error) {
      console.error(`Error parsing payload for webhook ${webhookId}:`, error);
      throw error;
    }
  }, [apiService]);
  
  /**
   * Fetches events for a specific webhook
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @param {Object} [filters={}] - Filters for the events query
   * @param {string} [filters.status] - Filter by status (success, failed, pending)
   * @param {string} [filters.from] - Filter by start date
   * @param {string} [filters.to] - Filter by end date
   * @param {number} [filters.limit=20] - Maximum number of events to retrieve
   * @param {number} [filters.offset=0] - Offset for pagination
   * @returns {Promise<Array<Object>>} Array of webhook events
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Get all events for a webhook
   * const events = await fetchWebhookEvents('webhook-123');
   * 
   * // Get filtered events
   * const filteredEvents = await fetchWebhookEvents('webhook-123', {
   *   status: 'failed',
   *   from: '2025-01-01',
   *   limit: 10
   * });
   */
  const fetchWebhookEvents = useCallback(async (webhookId, filters = {}) => {
    setEventsLoading(true);
    setEventsError(null);

    try {
      const events = await apiService.executeCustom(`${webhookId}/events`, 'GET', null, {
        params: filters,
      });
      
      setWebhookEvents(prev => ({
        ...prev,
        [webhookId]: events
      }));
      
      return events;
    } catch (error) {
      console.error(`Error fetching events for webhook ${webhookId}:`, error);
      setEventsError(`Failed to fetch events for webhook ${webhookId}`);
      throw error;
    } finally {
      setEventsLoading(false);
    }
  }, [apiService]);
  
  /**
   * Replays a failed webhook event
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @param {string|number} eventId - ID of the event to replay
   * @returns {Promise<Object>} Replay result
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Replay a failed event
   * const result = await replayWebhookEvent('webhook-123', 'event-456');
   * if (result.success) {
   * }
   */
  const replayWebhookEvent = useCallback(async (webhookId, eventId) => {
  // Added display name
  replayWebhookEvent.displayName = 'replayWebhookEvent';

    setEventsLoading(true);
    setEventsError(null);

    try {
      const result = await apiService.executeCustom(
        `${webhookId}/events/${eventId}/replay`,
        'POST'
      );
      
      // Refresh events after replay
      await fetchWebhookEvents(webhookId);
      
      return result;
    } catch (error) {
      console.error(`Error replaying event ${eventId} for webhook ${webhookId}:`, error);
      setEventsError(`Failed to replay event ${eventId}`);
      throw error;
    } finally {
      setEventsLoading(false);
    }
  }, [apiService, fetchWebhookEvents]);
  
  /**
   * Fetches security settings for a webhook
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @returns {Promise<Object>} Security settings
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Get security settings for a webhook
   * const security = await fetchSecuritySettings('webhook-123');
   */
  const fetchSecuritySettings = useCallback(async (webhookId) => {
  // Added display name
  fetchSecuritySettings.displayName = 'fetchSecuritySettings';

    setSecurityLoading(true);
    setSecurityError(null);

    try {
      const settings = await apiService.executeCustom(
        `${webhookId}/security`,
        'GET'
      );
      
      setSecuritySettings(prev => ({
        ...prev,
        [webhookId]: settings
      }));
      
      return settings;
    } catch (error) {
      console.error(`Error fetching security settings for webhook ${webhookId}:`, error);
      setSecurityError(`Failed to fetch security settings for webhook ${webhookId}`);
      throw error;
    } finally {
      setSecurityLoading(false);
    }
  }, [apiService]);
  
  /**
   * Updates security settings for a webhook
   * 
   * @function
   * @async
   * @param {string|number} webhookId - ID of the webhook
   * @param {Object} settings - Security settings to apply
   * @param {string} [settings.authType] - Authentication type (api_key, basic, oauth, jwt, hmac)
   * @param {string} [settings.apiKey] - API key for authentication
   * @param {string} [settings.username] - Username for Basic authentication
   * @param {string} [settings.password] - Password for Basic authentication
   * @param {string} [settings.signatureMethod] - Signature method for HMAC (sha256, sha1)
   * @param {boolean} [settings.includePayloadInSignature] - Whether to include payload in signature
   * @param {Object} [settings.ipFiltering] - IP filtering settings
   * @returns {Promise<Object>} Updated security settings
   * @throws {Error} If the API request fails
   * 
   * @example
   * // Update security settings
   * const updatedSecurity = await updateSecuritySettings('webhook-123', {
   *   authType: 'api_key',
   *   apiKey: 'secret-api-key',
   *   ipFiltering: {
   *     enabled: true,
   *     allowedIps: ['192.168.1.1', '10.0.0.1']
   *   }
   * });
   */
  const updateSecuritySettings = useCallback(async (webhookId, settings) => {
  // Added display name
  updateSecuritySettings.displayName = 'updateSecuritySettings';

    setSecurityLoading(true);
    setSecurityError(null);

    try {
      const updatedSettings = await apiService.executeCustom(
        `${webhookId}/security`,
        'PUT',
        settings
      );
      
      setSecuritySettings(prev => ({
        ...prev,
        [webhookId]: updatedSettings
      }));
      
      return updatedSettings;
    } catch (error) {
      console.error(`Error updating security settings for webhook ${webhookId}:`, error);
      setSecurityError(`Failed to update security settings for webhook ${webhookId}`);
      throw error;
    } finally {
      setSecurityLoading(false);
    }
  }, [apiService]);

  /**
   * Effect to load initial webhooks and templates data when provider mounts
   * Automatically fetches webhook list and available templates
   */
  useEffect(() => {
    fetchWebhooks().catch(err => {
      console.error('Failed to load initial webhooks:', err);
    });

    fetchWebhookTemplates().catch(err => {
      console.error('Failed to load webhook templates:', err);
    });
  }, [fetchWebhooks, fetchWebhookTemplates]);

  /**
   * Context value provided to consumers
   * Includes state, loading indicators, errors, and all webhook operations
   * @type {Object}
   */
  const value = {
    // Webhook state
    webhooks,
    webhook,
    webhookTemplates,
    integrationStatus,
    webhookEvents,
    securitySettings,

    // Loading states
    isLoading,
    templateLoading,
    statusLoading,
    eventsLoading,
    securityLoading,

    // Error states
    error,
    templateError,
    statusError,
    eventsError,
    securityError,

    // CRUD methods
    fetchWebhooks,
    fetchWebhookById,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,

    // Template methods
    fetchWebhookTemplates,
    createWebhookFromTemplate,

    // Integration methods
    fetchIntegrationStatus,

    // Event methods
    fetchWebhookEvents,
    replayWebhookEvent,
    
    // Security methods
    fetchSecuritySettings,
    updateSecuritySettings,

    // Utility methods
    fetchWebhookLogs,
    generateWebhookDocumentation,
    parseWebhookPayload,

    // Helper methods
    /**
     * Clears the main error state
     * @function
     */
    clearError: () => setError(null),
    
    /**
     * Clears the template error state
     * @function
     */
    clearTemplateError: () => setTemplateError(null),
    
    /**
     * Clears the status error state
     * @function
     */
    clearStatusError: () => setStatusError(null),
    
    /**
     * Clears the events error state
     * @function
     */
    clearEventsError: () => setEventsError(null),
    
    /**
     * Clears the security error state
     * @function
     */
    clearSecurityError: () => setSecurityError(null),
    
    /**
     * Clears the selected webhook
     * @function
     */
    clearWebhook: () => setWebhook(null),
  };

  return <WebhookContext.Provider value={value}>{children}</WebhookContext.Provider>;
};

export default WebhookContext;
