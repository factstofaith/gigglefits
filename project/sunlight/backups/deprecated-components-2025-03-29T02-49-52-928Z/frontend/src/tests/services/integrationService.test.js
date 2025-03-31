// integrationService.test.js
import axios from 'axios';
import integrationService from '@services/integrationService';
import authService from '@services/authService';
import * as notificationHelper from '@utils/notificationHelper';

// Mock axios
jest.mock('axios');

// Mock authService
jest.mock('../../services/authService', () => ({
  getAuthToken: jest.fn().mockResolvedValue('mock-token'),
  refreshToken: jest.fn().mockResolvedValue({ token: 'refreshed-token', expiresIn: 1800 * 1000 }),
  logout: jest.fn().mockResolvedValue(true),
}));

// Mock notificationHelper
const mockShowToast = jest.fn();
const mockAddNotification = jest.fn();
const mockUpdateNotification = jest.fn();
const mockRemoveNotification = jest.fn();
const mockMarkAsRead = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockClearAllNotifications = jest.fn();

jest.mock('../../utils/notificationHelper', () => ({
  createNotificationManager: jest.fn(() => ({
    showToast: mockShowToast,
    addNotification: mockAddNotification,
    updateNotification: mockUpdateNotification,
    removeNotification: mockRemoveNotification,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
    clearAllNotifications: mockClearAllNotifications,
  })),
  initNotificationHelper: jest.fn(),
}));

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  href: '',
};

describe('Integration Service', () => {
  // Mock API client
  const mockApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };

  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    window.location.href = '';
    
    // Setup axios mock for creating the apiClient
    axios.create.mockReturnValue(mockApiClient);

    // Setup default success responses
    mockApiClient.get.mockImplementation((url) => {
      if (url.includes('/integrations')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Test Integration 1', type: 'salesforce' },
            { id: 2, name: 'Test Integration 2', type: 'azure-blob' },
          ],
        });
      }
      if (url.includes('/mappings')) {
        return Promise.resolve({
          data: [
            { id: 1, sourceField: 'name', destinationField: 'fullName' },
            { id: 2, sourceField: 'email', destinationField: 'emailAddress' },
          ],
        });
      }
      if (url.includes('/earnings/mappings')) {
        return Promise.resolve({
          data: [
            { id: 1, sourceCode: 'REG', destinationCode: 'REGULAR' },
            { id: 2, sourceCode: 'OT', destinationCode: 'OVERTIME' },
          ],
        });
      }
      if (url.includes('/webhooks')) {
        return Promise.resolve({
          data: [
            { id: 1, url: 'https://example.com/webhook1', event: 'integration.completed' },
            { id: 2, url: 'https://example.com/webhook2', event: 'integration.failed' },
          ],
        });
      }
      if (url.includes('/datasets')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Employee Dataset', type: 'HR' },
            { id: 2, name: 'Payroll Dataset', type: 'Finance' },
          ],
        });
      }
      if (url.includes('/templates')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'HR Integration Template', description: 'Template for HR integrations' },
            { id: 2, name: 'Finance Integration Template', description: 'Template for finance integrations' },
          ],
        });
      }
      if (url.includes('/sources')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Salesforce', type: 'CRM' },
            { id: 2, name: 'ServiceNow', type: 'ITSM' },
          ],
        });
      }
      if (url.includes('/destinations')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'ADP', type: 'HR' },
            { id: 2, name: 'QuickBooks', type: 'Finance' },
          ],
        });
      }
      if (url.includes('/transformations')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Name Formatter', type: 'string' },
            { id: 2, name: 'Date Converter', type: 'date' },
          ],
        });
      }
      if (url.includes('/current-user')) {
        return Promise.resolve({
          data: { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' },
        });
      }
      if (url.includes('/schedule')) {
        return Promise.resolve({
          data: { frequency: 'daily', time: '08:00', enabled: true },
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    mockApiClient.post.mockImplementation((url) => {
      if (url.includes('/run')) {
        return Promise.resolve({
          data: { runId: 123, status: 'started', startTime: new Date().toISOString() },
        });
      }
      if (url.includes('/integrations')) {
        return Promise.resolve({
          data: { id: 3, name: 'New Integration', type: 'custom' },
        });
      }
      if (url.includes('/mappings')) {
        return Promise.resolve({
          data: { id: 3, sourceField: 'phone', destinationField: 'phoneNumber' },
        });
      }
      if (url.includes('/webhooks')) {
        return Promise.resolve({
          data: { id: 3, url: 'https://example.com/webhook3', event: 'integration.started' },
        });
      }
      if (url.includes('/templates')) {
        return Promise.resolve({
          data: { id: 3, name: 'New Template', description: 'A new template' },
        });
      }
      if (url.includes('/test')) {
        return Promise.resolve({
          data: { status: 'success', message: 'Test successful' },
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    mockApiClient.put.mockImplementation((url) => {
      if (url.includes('/integrations')) {
        return Promise.resolve({
          data: { id: 1, name: 'Updated Integration', type: 'salesforce' },
        });
      }
      if (url.includes('/mappings')) {
        return Promise.resolve({
          data: { id: 1, sourceField: 'updatedField', destinationField: 'updatedDestination' },
        });
      }
      if (url.includes('/webhooks')) {
        return Promise.resolve({
          data: { id: 1, url: 'https://example.com/updated', event: 'integration.completed' },
        });
      }
      if (url.includes('/templates')) {
        return Promise.resolve({
          data: { id: 1, name: 'Updated Template', description: 'An updated template' },
        });
      }
      if (url.includes('/schedule')) {
        return Promise.resolve({
          data: { frequency: 'weekly', time: '10:00', enabled: true },
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    mockApiClient.delete.mockImplementation(() => {
      return Promise.resolve({ data: null, status: 204 });
    });
  });

  // Restore after each test
  afterEach(() => {
    window.location = originalLocation;
  });

  // Test getIntegrations
  describe('getIntegrations', () => {
    it('fetches integrations successfully', async () => {
      // Act
      const result = await integrationService.getIntegrations();
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/integrations', { params: {} });
      expect(result).toEqual([
        { id: 1, name: 'Test Integration 1', type: 'salesforce' },
        { id: 2, name: 'Test Integration 2', type: 'azure-blob' },
      ]);
    });
    
    it('accepts filter parameters', async () => {
      // Act
      await integrationService.getIntegrations({ type: 'salesforce', status: 'active' });
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/integrations', { 
        params: { type: 'salesforce', status: 'active' } 
      });
    });
    
    it('handles fetch errors properly', async () => {
      // Arrange
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));
      
      // Act & Assert
      await expect(integrationService.getIntegrations())
        .rejects.toThrow('Network error');
    });
  });
  
  // Test getIntegrationById
  describe('getIntegrationById', () => {
    it('fetches a specific integration by ID', async () => {
      // Arrange
      const integrationId = 5;
      mockApiClient.get.mockResolvedValueOnce({
        data: { id: integrationId, name: 'Specific Integration', type: 'custom' }
      });
      
      // Act
      const result = await integrationService.getIntegrationById(integrationId);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/integrations/${integrationId}`);
      expect(result).toEqual({ id: integrationId, name: 'Specific Integration', type: 'custom' });
    });
    
    it('handles integration fetch errors', async () => {
      // Arrange
      const integrationId = 999;
      mockApiClient.get.mockRejectedValueOnce(new Error('Integration not found'));
      
      // Act & Assert
      await expect(integrationService.getIntegrationById(integrationId))
        .rejects.toThrow('Integration not found');
    });
  });
  
  // Test createIntegration
  describe('createIntegration', () => {
    it('creates an integration successfully', async () => {
      // Arrange
      const integrationData = {
        name: 'New Integration',
        type: 'custom',
        description: 'A test integration'
      };
      
      // Act
      const result = await integrationService.createIntegration(integrationData);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/integrations', integrationData);
      expect(result).toEqual({ id: 3, name: 'New Integration', type: 'custom' });
      expect(mockShowToast).toHaveBeenCalledWith(
        'Integration created successfully', 
        'success', 
        expect.objectContaining({ title: 'Success' })
      );
    });
    
    it('associates datasets with the integration if provided', async () => {
      // Arrange
      const integrationData = {
        name: 'New Integration',
        type: 'custom',
        description: 'A test integration',
        datasetIds: [1, 2]
      };
      
      mockApiClient.post
        .mockResolvedValueOnce({
          data: { id: 3, name: 'New Integration', type: 'custom' }
        })
        .mockResolvedValueOnce({ data: { success: true } })
        .mockResolvedValueOnce({ data: { success: true } });
      
      // Act
      const result = await integrationService.createIntegration(integrationData);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/integrations', {
        name: 'New Integration',
        type: 'custom',
        description: 'A test integration'
      });
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/integrations/3/datasets/1');
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/integrations/3/datasets/2');
      expect(result).toEqual({ id: 3, name: 'New Integration', type: 'custom' });
      expect(mockShowToast).toHaveBeenCalledWith(
        'Integration created successfully', 
        'success', 
        expect.objectContaining({ title: 'Success' })
      );
    });
    
    it('handles partial dataset association failures', async () => {
      // Arrange
      const integrationData = {
        name: 'New Integration',
        type: 'custom',
        description: 'A test integration',
        datasetIds: [1, 2, 3]
      };
      
      mockApiClient.post
        .mockResolvedValueOnce({
          data: { id: 3, name: 'New Integration', type: 'custom' }
        })
        .mockResolvedValueOnce({ data: { success: true } })
        .mockRejectedValueOnce(new Error('Association failed'))
        .mockResolvedValueOnce({ data: { success: true } });
      
      // Act
      const result = await integrationService.createIntegration(integrationData);
      
      // Assert
      expect(result).toEqual({ id: 3, name: 'New Integration', type: 'custom' });
      expect(mockShowToast).toHaveBeenCalledWith(
        'Integration created successfully, but 1 dataset(s) could not be associated', 
        'warning', 
        expect.objectContaining({ title: 'Partial Success', duration: 8000 })
      );
    });
    
    it('handles creation errors properly', async () => {
      // Arrange
      const integrationData = {
        name: 'New Integration',
        type: 'custom',
        description: 'A test integration'
      };
      
      mockApiClient.post.mockRejectedValueOnce(new Error('Creation failed'));
      
      // Act & Assert
      await expect(integrationService.createIntegration(integrationData))
        .rejects.toThrow('Creation failed');
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to create integration', 
        'error', 
        expect.objectContaining({ title: 'API Error', duration: 8000 })
      );
    });
  });
  
  // Test updateIntegration
  describe('updateIntegration', () => {
    it('updates an integration successfully', async () => {
      // Arrange
      const integrationId = 1;
      const updateData = {
        name: 'Updated Integration',
        description: 'Updated description'
      };
      
      // Act
      const result = await integrationService.updateIntegration(integrationId, updateData);
      
      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/integrations/${integrationId}`, updateData);
      expect(result).toEqual({ id: 1, name: 'Updated Integration', type: 'salesforce' });
    });
    
    it('handles update errors properly', async () => {
      // Arrange
      const integrationId = 1;
      const updateData = {
        name: 'Updated Integration',
        description: 'Updated description'
      };
      
      mockApiClient.put.mockRejectedValueOnce(new Error('Update failed'));
      
      // Act & Assert
      await expect(integrationService.updateIntegration(integrationId, updateData))
        .rejects.toThrow('Update failed');
    });
  });
  
  // Test deleteIntegration
  describe('deleteIntegration', () => {
    it('deletes an integration successfully', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.deleteIntegration(integrationId);
      
      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/integrations/${integrationId}`);
      expect(result).toBe(true);
    });
    
    it('handles delete errors properly', async () => {
      // Arrange
      const integrationId = 1;
      mockApiClient.delete.mockRejectedValueOnce(new Error('Delete failed'));
      
      // Act & Assert
      await expect(integrationService.deleteIntegration(integrationId))
        .rejects.toThrow('Delete failed');
    });
  });
  
  // Test runIntegration
  describe('runIntegration', () => {
    it('runs an integration successfully', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.runIntegration(integrationId);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(`/api/integrations/${integrationId}/run`);
      expect(mockShowToast).toHaveBeenCalledWith(
        'Starting integration run...', 
        'info', 
        expect.objectContaining({ title: 'Running' })
      );
      expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Integration Run Started',
        message: expect.stringContaining(`Integration #${integrationId} run has been initiated`),
        type: 'info',
        actionLabel: 'View Run Log',
        onActionClick: expect.any(Function)
      }));
      expect(result).toEqual({ 
        runId: 123, 
        status: 'started', 
        startTime: expect.any(String) 
      });
    });
    
    it('handles run errors properly', async () => {
      // Arrange
      const integrationId = 1;
      mockApiClient.post.mockRejectedValueOnce(new Error('Run failed'));
      
      // Act & Assert
      await expect(integrationService.runIntegration(integrationId))
        .rejects.toThrow('Run failed');
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to run integration #1', 
        'error', 
        expect.objectContaining({ title: 'Run Error', duration: 8000 })
      );
    });
    
    it('sets the correct view run log URL', async () => {
      // Arrange
      const integrationId = 1;
      mockAddNotification.mockImplementationOnce(notification => {
        // Call the onActionClick handler to test URL redirection
        notification.onActionClick();
        return 'notification-id';
      });
      
      // Act
      await integrationService.runIntegration(integrationId);
      
      // Assert
      expect(window.location.href).toBe('/integrations/1/runs/123');
    });
  });
  
  // Test field mapping operations
  describe('Field Mapping Operations', () => {
    it('gets field mappings for an integration', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.getFieldMappings(integrationId);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/integrations/${integrationId}/mappings`);
      expect(result).toEqual([
        { id: 1, sourceField: 'name', destinationField: 'fullName' },
        { id: 2, sourceField: 'email', destinationField: 'emailAddress' },
      ]);
    });
    
    it('creates a field mapping', async () => {
      // Arrange
      const integrationId = 1;
      const mappingData = {
        sourceField: 'phone',
        destinationField: 'phoneNumber'
      };
      
      // Act
      const result = await integrationService.createFieldMapping(integrationId, mappingData);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/mappings`,
        mappingData
      );
      expect(result).toEqual({ id: 3, sourceField: 'phone', destinationField: 'phoneNumber' });
    });
    
    it('updates a field mapping', async () => {
      // Arrange
      const integrationId = 1;
      const mappingId = 1;
      const mappingData = {
        sourceField: 'updatedField',
        destinationField: 'updatedDestination'
      };
      
      // Act
      const result = await integrationService.updateFieldMapping(integrationId, mappingId, mappingData);
      
      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/mappings/${mappingId}`,
        mappingData
      );
      expect(result).toEqual({ id: 1, sourceField: 'updatedField', destinationField: 'updatedDestination' });
    });
    
    it('deletes a field mapping', async () => {
      // Arrange
      const integrationId = 1;
      const mappingId = 1;
      
      // Act
      const result = await integrationService.deleteFieldMapping(integrationId, mappingId);
      
      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/integrations/${integrationId}/mappings/${mappingId}`);
      expect(result).toBe(true);
    });
  });
  
  // Test webhook operations
  describe('Webhook Operations', () => {
    it('gets webhooks for an integration', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.getWebhooks(integrationId);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/admin/webhooks?integration_id=${integrationId}`);
      expect(result).toEqual([
        { id: 1, url: 'https://example.com/webhook1', event: 'integration.completed' },
        { id: 2, url: 'https://example.com/webhook2', event: 'integration.failed' },
      ]);
    });
    
    it('creates a webhook', async () => {
      // Arrange
      const webhookData = {
        url: 'https://example.com/webhook3',
        event: 'integration.started',
        integrationId: 1
      };
      
      // Act
      const result = await integrationService.createWebhook(webhookData);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/admin/webhooks', webhookData);
      expect(result).toEqual({ id: 3, url: 'https://example.com/webhook3', event: 'integration.started' });
    });
    
    it('updates a webhook', async () => {
      // Arrange
      const webhookId = 1;
      const webhookData = {
        url: 'https://example.com/updated',
        event: 'integration.completed'
      };
      
      // Act
      const result = await integrationService.updateWebhook(webhookId, webhookData);
      
      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/admin/webhooks/${webhookId}`, webhookData);
      expect(result).toEqual({ id: 1, url: 'https://example.com/updated', event: 'integration.completed' });
    });
    
    it('deletes a webhook', async () => {
      // Arrange
      const webhookId = 1;
      
      // Act
      const result = await integrationService.deleteWebhook(webhookId);
      
      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/admin/webhooks/${webhookId}`);
      expect(result).toBe(true);
    });
    
    it('tests a webhook', async () => {
      // Arrange
      const webhookId = 1;
      
      // Act
      const result = await integrationService.testWebhook(webhookId);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(`/api/admin/webhooks/${webhookId}/test`);
      expect(result).toEqual({ status: 'success', message: 'Test successful' });
    });
  });
  
  // Test template operations
  describe('Template Operations', () => {
    it('gets templates', async () => {
      // Act
      const result = await integrationService.getTemplates();
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/integrations/templates', { params: {} });
      expect(result).toEqual([
        { id: 1, name: 'HR Integration Template', description: 'Template for HR integrations' },
        { id: 2, name: 'Finance Integration Template', description: 'Template for finance integrations' },
      ]);
    });
    
    it('gets a template by ID', async () => {
      // Arrange
      const templateId = 1;
      
      // Act
      const result = await integrationService.getTemplateById(templateId);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/integrations/templates/${templateId}`);
    });
    
    it('creates a template from an integration', async () => {
      // Arrange
      const integrationId = 1;
      const templateData = {
        name: 'New Template',
        description: 'A new template'
      };
      
      // Act
      const result = await integrationService.createTemplateFromIntegration(integrationId, templateData);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/save-as-template`,
        templateData
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        'Integration template created successfully', 
        'success', 
        expect.objectContaining({ title: 'Success' })
      );
      expect(result).toEqual({ id: 3, name: 'New Template', description: 'A new template' });
    });
    
    it('handles template creation errors', async () => {
      // Arrange
      const integrationId = 1;
      const templateData = {
        name: 'New Template',
        description: 'A new template'
      };
      
      mockApiClient.post.mockRejectedValueOnce(new Error('Template creation failed'));
      
      // Act & Assert
      await expect(integrationService.createTemplateFromIntegration(integrationId, templateData))
        .rejects.toThrow('Template creation failed');
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to create integration template', 
        'error', 
        expect.objectContaining({ title: 'API Error', duration: 8000 })
      );
    });
    
    it('creates an integration from a template', async () => {
      // Arrange
      const templateId = 1;
      const customizationData = {
        name: 'Custom Integration',
        description: 'Created from template'
      };
      
      // Act
      const result = await integrationService.createIntegrationFromTemplate(templateId, customizationData);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/api/integrations/templates/${templateId}/create-integration`,
        customizationData
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        'Integration created successfully from template', 
        'success', 
        expect.objectContaining({ title: 'Success' })
      );
    });
  });
  
  // Test earnings mapping operations
  describe('Earnings Mapping Operations', () => {
    it('gets earnings mappings for an integration', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.getEarningsMappings(integrationId);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/integrations/${integrationId}/earnings/mappings`);
      expect(result).toEqual([
        { id: 1, sourceCode: 'REG', destinationCode: 'REGULAR' },
        { id: 2, sourceCode: 'OT', destinationCode: 'OVERTIME' },
      ]);
    });
    
    it('creates an earnings mapping with notification', async () => {
      // Arrange
      const integrationId = 1;
      const mappingData = {
        sourceCode: 'VAC',
        destinationCode: 'VACATION'
      };
      
      mockApiClient.post.mockResolvedValueOnce({
        data: { id: 3, sourceCode: 'VAC', destinationCode: 'VACATION' }
      });
      
      // Act
      const result = await integrationService.createEarningsMapping(integrationId, mappingData);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/earnings/mappings`,
        mappingData
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        'Earnings mapping created successfully', 
        'success', 
        expect.objectContaining({ title: 'Success' })
      );
      expect(result).toEqual({ id: 3, sourceCode: 'VAC', destinationCode: 'VACATION' });
    });
  });
  
  // Test API interceptors
  describe('API Interceptors', () => {
    it('adds auth token to requests', async () => {
      // Arrange - extract the request interceptor function
      const interceptors = {
        request: axios.create().interceptors.request,
        response: axios.create().interceptors.response,
      };
      
      // Extract the first argument from the first call (the request interceptor function)
      const requestInterceptor = interceptors.request.use.mock.calls[0][0];
      
      // Create a mock config
      const config = {
        headers: {},
      };
      
      // Act
      const result = await requestInterceptor(config);
      
      // Assert
      expect(authService.getAuthToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe('Bearer mock-token');
    });
    
    it('handles auth error in request interceptor', async () => {
      // Arrange
      const interceptors = {
        request: axios.create().interceptors.request,
        response: axios.create().interceptors.response,
      };
      
      // Extract the first argument from the first call (the request interceptor function)
      const requestInterceptor = interceptors.request.use.mock.calls[0][0];
      
      // Create a mock config
      const config = {
        headers: {},
      };
      
      // Mock an error in token retrieval
      authService.getAuthToken.mockRejectedValueOnce(new Error('Token retrieval failed'));
      
      // Act
      const result = await requestInterceptor(config);
      
      // Assert
      expect(result).toEqual(config); // Should return original config on error
    });
    
    it('refreshes token and retries on 401 response', async () => {
      // This test is a bit more complex since it requires mocking the interceptor directly
      
      // In a real test we'd extract the response.use handler from the mock
      // Create a fake error response
      const error = {
        config: {
          headers: {},
          _isRetry: false,
        },
        response: {
          status: 401,
        },
      };
      
      // Create a spy for axios to track the retry call
      const axiosSpy = jest.spyOn(axios, 'create').mockImplementation(() => mockApiClient);
      
      // Find the response.use handler (second argument in first call)
      const responseErrorHandler = axios.create().interceptors.response.use.mock.calls[0][1];
      
      // Act - call the handler with our error
      await responseErrorHandler(error).catch(() => {});
      
      // Assert
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(authService.getAuthToken).toHaveBeenCalled();
      
      // Cleanup
      axiosSpy.mockRestore();
    });
    
    it('logs out user if token refresh fails', async () => {
      // Arrange
      // Create a fake error response
      const error = {
        config: {
          headers: {},
          _isRetry: false,
        },
        response: {
          status: 401,
        },
      };
      
      // Mock refresh token to fail
      authService.refreshToken.mockRejectedValueOnce(new Error('Refresh failed'));
      
      // Find the response.use handler (second argument in first call)
      const responseErrorHandler = axios.create().interceptors.response.use.mock.calls[0][1];
      
      // Act - call the handler with our error
      await responseErrorHandler(error).catch(() => {});
      
      // Assert
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalled();
      expect(window.location.href).toBe('/');
    });
    
    it('handles 403 errors gracefully', async () => {
      // Arrange
      // Create a fake error response
      const error = {
        config: {},
        response: {
          status: 403,
        },
      };
      
      // Create console.error spy
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Find the response.use handler (second argument in first call)
      const responseErrorHandler = axios.create().interceptors.response.use.mock.calls[0][1];
      
      // Act - call the handler with our error
      await responseErrorHandler(error).catch(() => {});
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Access forbidden:', error);
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });
  
  // Test data and source/destination operations
  describe('Data and Source/Destination Operations', () => {
    it('gets available sources for integration type', async () => {
      // Arrange
      const integrationType = 'HR';
      
      // Act
      const result = await integrationService.getAvailableSources(integrationType);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/integrations/sources', {
        params: { integration_type: integrationType },
      });
      expect(result).toEqual([
        { id: 1, name: 'Salesforce', type: 'CRM' },
        { id: 2, name: 'ServiceNow', type: 'ITSM' },
      ]);
    });
    
    it('gets available destinations for integration type', async () => {
      // Arrange
      const integrationType = 'HR';
      
      // Act
      const result = await integrationService.getAvailableDestinations(integrationType);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/integrations/destinations', {
        params: { integration_type: integrationType },
      });
      expect(result).toEqual([
        { id: 1, name: 'ADP', type: 'HR' },
        { id: 2, name: 'QuickBooks', type: 'Finance' },
      ]);
    });
    
    it('gets transformation options', async () => {
      // Act
      const result = await integrationService.getTransformations();
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/integrations/transformations', { params: {} });
      expect(result).toEqual([
        { id: 1, name: 'Name Formatter', type: 'string' },
        { id: 2, name: 'Date Converter', type: 'date' },
      ]);
    });
  });
  
  // Test schedule operations
  describe('Schedule Operations', () => {
    it('gets schedule configuration', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.getScheduleConfig(integrationId);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/integrations/${integrationId}/schedule`);
      expect(result).toEqual({ frequency: 'daily', time: '08:00', enabled: true });
    });
    
    it('updates schedule configuration', async () => {
      // Arrange
      const integrationId = 1;
      const scheduleData = {
        frequency: 'weekly',
        time: '10:00',
        enabled: true,
        dayOfWeek: 'Monday'
      };
      
      // Act
      const result = await integrationService.updateScheduleConfig(integrationId, scheduleData);
      
      // Assert
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/api/integrations/${integrationId}/schedule`,
        scheduleData
      );
      expect(result).toEqual({ frequency: 'weekly', time: '10:00', enabled: true });
    });
  });
  
  // Test dataset operations
  describe('Dataset Operations', () => {
    it('gets all datasets', async () => {
      // Act
      const result = await integrationService.getDatasets();
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/admin/datasets', { params: {} });
      expect(result).toEqual([
        { id: 1, name: 'Employee Dataset', type: 'HR' },
        { id: 2, name: 'Payroll Dataset', type: 'Finance' },
      ]);
    });
    
    it('gets datasets for an integration', async () => {
      // Arrange
      const integrationId = 1;
      
      // Act
      const result = await integrationService.getIntegrationDatasets(integrationId);
      
      // Assert
      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/integrations/${integrationId}/datasets`);
      expect(result).toEqual([
        { id: 1, name: 'Employee Dataset', type: 'HR' },
        { id: 2, name: 'Payroll Dataset', type: 'Finance' },
      ]);
    });
    
    it('associates a dataset with an integration', async () => {
      // Arrange
      const integrationId = 1;
      const datasetId = 3;
      
      // Act
      const result = await integrationService.associateDataset(integrationId, datasetId);
      
      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(`/api/integrations/${integrationId}/datasets/${datasetId}`);
      expect(result).toBe(true);
    });
    
    it('disassociates a dataset from an integration', async () => {
      // Arrange
      const integrationId = 1;
      const datasetId = 2;
      
      // Act
      const result = await integrationService.disassociateDataset(integrationId, datasetId);
      
      // Assert
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/integrations/${integrationId}/datasets/${datasetId}`);
      expect(result).toBe(true);
    });
  });
  
  // Test flow validation operations
  describe('Flow Validation Operations', () => {
    // Mock for flow validator
    const mockValidateFlow = jest.fn();
    
    beforeEach(() => {
      // Reset mockValidateFlow for each test
      mockValidateFlow.mockReset();
      
      // Mock the flowValidation module
      jest.mock('../../../utils/flowValidation', () => ({
        createFlowValidator: jest.fn().mockReturnValue({
          validateFlow: mockValidateFlow
        })
      }));
    });
    
    it('performs client-side validation and returns results when valid', async () => {
      // Arrange
      const integrationId = 1;
      const flowData = {
        nodes: [{ id: 'node1', type: 'SourceNode' }],
        edges: []
      };
      
      // Setup mock validation results
      mockValidateFlow.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [{ id: 'warning1', message: 'Test warning' }],
        info: [{ id: 'info1', message: 'Test info' }]
      });
      
      // Setup mock server response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          isValid: true,
          errors: [],
          warnings: []
        }
      });
      
      // Act
      const result = await integrationService.validateIntegrationFlow(integrationId, flowData);
      
      // Assert
      expect(mockValidateFlow).toHaveBeenCalledWith(flowData.nodes, flowData.edges);
      expect(mockApiClient.post).toHaveBeenCalledWith(`/api/integrations/flows/${integrationId}/validate`, flowData);
      expect(result).toEqual({
        isValid: true,
        clientErrors: [],
        clientWarnings: [{ id: 'warning1', message: 'Test warning' }],
        clientInfo: [{ id: 'info1', message: 'Test info' }],
        serverErrors: [],
        serverWarnings: [],
        validationSource: 'both'
      });
    });
    
    it('returns client validation errors without calling server when client validation fails', async () => {
      // Arrange
      const integrationId = 1;
      const flowData = {
        nodes: [{ id: 'node1', type: 'SourceNode' }],
        edges: []
      };
      
      // Setup mock validation results with errors
      mockValidateFlow.mockReturnValue({
        isValid: false,
        errors: [{ id: 'error1', message: 'Test error' }],
        warnings: [],
        info: []
      });
      
      // Act
      const result = await integrationService.validateIntegrationFlow(integrationId, flowData);
      
      // Assert
      expect(mockValidateFlow).toHaveBeenCalledWith(flowData.nodes, flowData.edges);
      expect(mockApiClient.post).not.toHaveBeenCalled(); // Should not call server
      expect(result).toEqual({
        isValid: false,
        clientErrors: [{ id: 'error1', message: 'Test error' }],
        clientWarnings: [],
        clientInfo: [],
        serverErrors: [],
        serverWarnings: [],
        validationSource: 'client'
      });
    });
    
    it('handles server validation errors gracefully', async () => {
      // Arrange
      const integrationId = 1;
      const flowData = {
        nodes: [{ id: 'node1', type: 'SourceNode' }],
        edges: []
      };
      
      // Setup mock validation results
      mockValidateFlow.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        info: []
      });
      
      // Setup mock server error
      mockApiClient.post.mockRejectedValueOnce(new Error('Server validation failed'));
      
      // Act
      const result = await integrationService.validateIntegrationFlow(integrationId, flowData);
      
      // Assert
      expect(mockValidateFlow).toHaveBeenCalledWith(flowData.nodes, flowData.edges);
      expect(mockApiClient.post).toHaveBeenCalledWith(`/api/integrations/flows/${integrationId}/validate`, flowData);
      expect(result).toEqual({
        isValid: false,
        clientErrors: [],
        clientWarnings: [],
        clientInfo: [],
        serverErrors: [{
          id: 'server-validation-failed',
          severity: 'error',
          message: 'Server validation failed',
          details: 'Server validation failed',
          recommendation: 'Check server logs for more details'
        }],
        serverWarnings: [],
        validationSource: 'client'
      });
    });
    
    it('shows notification toast on unexpected error', async () => {
      // Arrange
      const integrationId = 1;
      const flowData = {
        nodes: [{ id: 'node1', type: 'SourceNode' }],
        edges: []
      };
      
      // Setup mock to throw error
      mockValidateFlow.mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      
      // Act & Assert
      await expect(integrationService.validateIntegrationFlow(integrationId, flowData))
        .rejects.toThrow('Unexpected error');
      
      expect(mockShowToast).toHaveBeenCalledWith(
        'Flow validation failed', 
        'error', 
        expect.objectContaining({ title: 'Validation Error', duration: 5000 })
      );
    });
  });
});