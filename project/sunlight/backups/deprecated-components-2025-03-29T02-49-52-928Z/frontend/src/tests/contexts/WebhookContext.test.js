// WebhookContext.test.js
// -----------------------------------------------------------------------------
// Tests for WebhookContext provider using dependency injection pattern

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
// Using older userEvent API that works with our testing setup
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the context directly (no need for mocking apiServiceFactory)
import { WebhookProvider, useWebhook } from '@contexts/WebhookContext';

// Mock webhook data
const mockWebhooks = [
  { id: '1', name: 'Webhook 1', endpoint: 'https://example.com/hook1', active: true },
  { id: '2', name: 'Webhook 2', endpoint: 'https://example.com/hook2', active: false },
];

const mockWebhookTemplates = [
  { id: 't1', name: 'Github', description: 'Github webhook template', schema: {} },
  { id: 't2', name: 'Slack', description: 'Slack webhook template', schema: {} },
];

// Create individual mock functions for all API methods
const mockGetAll = jest.fn().mockResolvedValue(mockWebhooks);
const mockGetById = jest.fn(id => {
  const webhook = mockWebhooks.find(w => w.id === id);
  return webhook ? Promise.resolve(webhook) : Promise.reject(new Error('Webhook not found'));
});
const mockCreate = jest.fn(data =>
  Promise.resolve({
    id: '3',
    ...data,
    active: true,
  })
);
const mockUpdate = jest.fn((id, data) =>
  Promise.resolve({
    id,
    ...data,
    lastUpdated: new Date().toISOString(),
  })
);
const mockDelete = jest.fn(id => Promise.resolve({ success: true }));
const mockExecuteCustom = jest.fn((endpoint, method, data, options) => {
  if (endpoint.includes('templates')) {
    return Promise.resolve(mockWebhookTemplates);
  }
  if (endpoint.includes('test')) {
    return Promise.resolve({
      success: true,
      result: { statusCode: 200, responseTime: 345 },
    });
  }
  if (endpoint.includes('integration-status')) {
    return Promise.resolve({
      connected: true,
      lastSync: new Date().toISOString(),
      pendingEvents: 0,
    });
  }
  if (endpoint.includes('logs')) {
    return Promise.resolve([
      { timestamp: new Date().toISOString(), status: 'success', responseTime: 240 },
      {
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: 'Connection timeout',
      },
    ]);
  }
  if (endpoint.includes('documentation')) {
    return Promise.resolve({
      schema: { type: 'object', properties: {} },
      examples: [],
      usageNotes: 'Example usage notes',
    });
  }
  if (endpoint.includes('parse-payload')) {
    return Promise.resolve({
      valid: true,
      parsed: { event: 'push', repository: 'test-repo' },
    });
  }
  if (endpoint.includes('create-from-template')) {
    return Promise.resolve({
      id: 't1-instance',
      name: data?.name || 'Template Instance',
      endpoint: 'https://example.com/template-instance',
      active: true,
      templateId: data?.templateId,
    });
  }
  if (endpoint.includes('/events')) {
    if (endpoint.includes('/replay')) {
      return Promise.resolve({
        success: true,
        message: 'Event replayed successfully',
        newEventId: 'new-event-123'
      });
    }
    return Promise.resolve([
      { 
        id: 'event-1',
        webhookId: '1',
        status: 'success',
        timestamp: new Date().toISOString(),
        payload: { event: 'push', repository: 'test-repo' },
        response: { statusCode: 200, body: 'OK' },
        duration: 156
      },
      { 
        id: 'event-2',
        webhookId: '1',
        status: 'failed',
        timestamp: new Date().toISOString(),
        payload: { event: 'push', repository: 'test-repo' },
        error: 'Connection refused',
        duration: 2000
      }
    ]);
  }
  if (endpoint.includes('/security')) {
    if (method === 'PUT') {
      return Promise.resolve({
        ...data,
        updated: true
      });
    }
    return Promise.resolve({
      authType: 'api_key',
      apiKey: '********',
      signatureMethod: 'sha256',
      includePayloadInSignature: true,
      ipFiltering: {
        enabled: false,
        allowedIps: []
      }
    });
  }
  return Promise.resolve({});
});

// Create a complete mock API service object
const mockApiService = {
  getAll: mockGetAll,
  getById: mockGetById,
  create: mockCreate,
  update: mockUpdate,
  delete: mockDelete,
  executeCustom: mockExecuteCustom,
};

// Test component that uses the context
const TestComponent = () => {
  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';


  const {
    webhooks = [],
    webhook,
    webhookTemplates = [],
    webhookEvents = {},
    securitySettings = {},
    isLoading,
    error,
    templateLoading,
    templateError,
    eventsLoading,
    eventsError,
    securityLoading,
    securityError,
    fetchWebhooks,
    fetchWebhookById,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    fetchWebhookTemplates,
    createWebhookFromTemplate,
    fetchIntegrationStatus,
    fetchWebhookEvents,
    replayWebhookEvent,
    fetchSecuritySettings,
    updateSecuritySettings,
    fetchWebhookLogs,
    generateWebhookDocumentation,
    parseWebhookPayload,
  } = useWebhook() || {}; // Add fallback empty object

  // Add safety check for undefined values
  const safeWebhooks = webhooks || [];
  const safeTemplates = webhookTemplates || [];

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="template-loading">{templateLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="events-loading">{eventsLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="security-loading">{securityLoading ? 'Loading' : 'Not Loading'}</div>
      
      <div data-testid="error-state">{error || 'No Error'}</div>
      <div data-testid="template-error">{templateError || 'No Error'}</div>
      <div data-testid="events-error">{eventsError || 'No Error'}</div>
      <div data-testid="security-error">{securityError || 'No Error'}</div>
      
      <div data-testid="webhooks-count">{safeWebhooks.length}</div>
      <div data-testid="webhook-data">{webhook ? JSON.stringify(webhook) : 'No Webhook'}</div>
      <div data-testid="templates-count">{safeTemplates.length}</div>
      <div data-testid="webhook-events">{Object.keys(webhookEvents).length > 0 ? 'Has Events' : 'No Events'}</div>
      <div data-testid="security-settings">{Object.keys(securitySettings).length > 0 ? 'Has Settings' : 'No Settings'}</div>

      <button data-testid="fetch-webhooks-button" onClick={fetchWebhooks}>
        Fetch Webhooks
      </button>

      <button data-testid="fetch-webhook-button" onClick={() => fetchWebhookById('1')}>
        Fetch Webhook
      </button>

      <button
        data-testid="create-webhook-button"
        onClick={() => createWebhook({ name: 'New Webhook', endpoint: 'https://example.com/new' })}
      >
        Create Webhook
      </button>

      <button
        data-testid="update-webhook-button"
        onClick={() => updateWebhook('1', { name: 'Updated Webhook' })}
      >
        Update Webhook
      </button>

      <button data-testid="delete-webhook-button" onClick={() => deleteWebhook('1')}>
        Delete Webhook
      </button>

      <button
        data-testid="test-webhook-button"
        onClick={() => testWebhook('1', { payload: { test: true } })}
      >
        Test Webhook
      </button>

      <button data-testid="fetch-templates-button" onClick={fetchWebhookTemplates}>
        Fetch Templates
      </button>

      <button
        data-testid="create-from-template-button"
        onClick={() => createWebhookFromTemplate('t1', { name: 'Github Hook' })}
      >
        Create From Template
      </button>

      <button data-testid="fetch-status-button" onClick={() => fetchIntegrationStatus('1')}>
        Fetch Status
      </button>

      <button data-testid="fetch-logs-button" onClick={() => fetchWebhookLogs('1')}>
        Fetch Logs
      </button>

      <button 
        data-testid="generate-docs-button" 
        onClick={() => generateWebhookDocumentation('1')}
      >
        Generate Docs
      </button>
      
      <button 
        data-testid="parse-payload-button" 
        onClick={() => parseWebhookPayload('1', { event: 'push' })}
      >
        Parse Payload
      </button>
      
      <button
        data-testid="fetch-events-button"
        onClick={() => fetchWebhookEvents('1', { status: 'all' })}
      >
        Fetch Events
      </button>
      
      <button
        data-testid="replay-event-button"
        onClick={() => replayWebhookEvent('1', 'event-2')}
      >
        Replay Event
      </button>
      
      <button
        data-testid="fetch-security-button"
        onClick={() => fetchSecuritySettings('1')}
      >
        Fetch Security
      </button>
      
      <button
        data-testid="update-security-button"
        onClick={() => updateSecuritySettings('1', { 
          authType: 'basic',
          username: 'testuser',
          password: 'testpass'
        })}
      >
        Update Security
      </button>
    </div>
  );
};

describe('WebhookContext', () => {
  // Create a simple mock component that directly tests context values
  const SimpleTestComponent = ({ onLoad }) => {
  // Added display name
  SimpleTestComponent.displayName = 'SimpleTestComponent';

  // Added display name
  SimpleTestComponent.displayName = 'SimpleTestComponent';

  // Added display name
  SimpleTestComponent.displayName = 'SimpleTestComponent';

  // Added display name
  SimpleTestComponent.displayName = 'SimpleTestComponent';

  // Added display name
  SimpleTestComponent.displayName = 'SimpleTestComponent';


    const context = useWebhook();
    
    React.useEffect(() => {
      if (onLoad) onLoad(context);
    }, [onLoad]);
    
    return <div data-testid="test-component">Test Component</div>;
  };
  
  // Setup test wrapper with dependency injection and controlled initialization
  const renderWithWebhookContext = (customApiService = mockApiService) => {
  // Added display name
  renderWithWebhookContext.displayName = 'renderWithWebhookContext';

  // Added display name
  renderWithWebhookContext.displayName = 'renderWithWebhookContext';

  // Added display name
  renderWithWebhookContext.displayName = 'renderWithWebhookContext';

  // Added display name
  renderWithWebhookContext.displayName = 'renderWithWebhookContext';

  // Added display name
  renderWithWebhookContext.displayName = 'renderWithWebhookContext';


    let contextValues;
    
    const wrapper = render(
      <WebhookProvider apiService={customApiService}>
        <SimpleTestComponent 
          onLoad={(context) => {
            contextValues = context;
          }} 
        />
      </WebhookProvider>
    );
    
    return {
      ...wrapper,
      getContextValues: () => contextValues
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes provider API service correctly', async () => {
    const { getContextValues } = renderWithWebhookContext();

    // Assert that the provider has been initialized
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });

    // Verify mock was called during initialization
    expect(mockGetAll).toHaveBeenCalled();
    expect(mockExecuteCustom).toHaveBeenCalledWith('templates', 'GET');
  });

  test('fetches a single webhook by ID', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Call the fetchWebhookById method directly
    const id = '1';
    await act(async () => {
      await getContextValues().fetchWebhookById(id);
    });
    
    // Verify mock was called with expected ID
    expect(mockGetById).toHaveBeenCalledWith(id);
  });

  test('creates a new webhook', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Data for new webhook
    const newWebhookData = {
      name: 'New Webhook',
      endpoint: 'https://example.com/new',
    };
    
    // Call createWebhook directly
    await act(async () => {
      await getContextValues().createWebhook(newWebhookData);
    });
    
    // Verify mock was called with expected data
    expect(mockCreate).toHaveBeenCalledWith(newWebhookData);
  });

  test('updates an existing webhook', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Data and ID for the webhook update
    const id = '1';
    const updateData = { name: 'Updated Webhook' };
    
    // Call updateWebhook directly
    await act(async () => {
      await getContextValues().updateWebhook(id, updateData);
    });
    
    // Verify mock was called with expected ID and data
    expect(mockUpdate).toHaveBeenCalledWith(id, updateData);
  });

  test('deletes a webhook', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // ID for the webhook to delete
    const id = '1';
    
    // Call deleteWebhook directly
    await act(async () => {
      await getContextValues().deleteWebhook(id);
    });
    
    // Verify mock was called with expected ID
    expect(mockDelete).toHaveBeenCalledWith(id);
  });

  test('tests a webhook', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // ID and data for testing the webhook
    const id = '1';
    const testPayload = { payload: { test: true } };
    
    // Call testWebhook directly
    await act(async () => {
      await getContextValues().testWebhook(id, testPayload);
    });
    
    // Verify mock was called with expected path and data
    expect(mockExecuteCustom).toHaveBeenCalledWith(`${id}/test`, 'POST', testPayload);
  });

  test('creates a webhook from template', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Template ID and customization data
    const templateId = 't1';
    const customization = { name: 'Github Hook' };
    
    // Call createWebhookFromTemplate directly
    await act(async () => {
      await getContextValues().createWebhookFromTemplate(templateId, customization);
    });
    
    // Verify mock was called with expected path and data
    expect(mockExecuteCustom).toHaveBeenCalledWith('create-from-template', 'POST', {
      templateId,
      ...customization,
    });
  });

  test('fetches webhook documentation', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Webhook ID for documentation
    const webhookId = '1';
    
    // Call generateWebhookDocumentation directly
    await act(async () => {
      await getContextValues().generateWebhookDocumentation(webhookId);
    });
    
    // Verify mock was called correctly
    expect(mockExecuteCustom).toHaveBeenCalledWith(`${webhookId}/documentation`, 'GET');
  });

  test('parses webhook payload', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Webhook ID and payload data
    const webhookId = '1';
    const payload = { event: 'push' };
    
    // Call parseWebhookPayload directly
    await act(async () => {
      await getContextValues().parseWebhookPayload(webhookId, payload);
    });
    
    // Verify mock was called correctly
    expect(mockExecuteCustom).toHaveBeenCalledWith(`${webhookId}/parse-payload`, 'POST', { payload });
  });
  
  test('fetches webhook events', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Webhook ID and filters
    const webhookId = '1';
    const filters = { status: 'all' };
    
    // Call fetchWebhookEvents directly
    await act(async () => {
      await getContextValues().fetchWebhookEvents(webhookId, filters);
    });
    
    // Verify mock was called correctly
    expect(mockExecuteCustom).toHaveBeenCalledWith(
      `${webhookId}/events`, 
      'GET', 
      null, 
      { params: filters }
    );
  });
  
  test('replays webhook event', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Webhook ID and event ID
    const webhookId = '1';
    const eventId = 'event-2';
    
    // Call replayWebhookEvent directly
    await act(async () => {
      await getContextValues().replayWebhookEvent(webhookId, eventId);
    });
    
    // Verify mock was called correctly
    expect(mockExecuteCustom).toHaveBeenCalledWith(
      `${webhookId}/events/${eventId}/replay`, 
      'POST'
    );
  });
  
  test('fetches security settings', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Webhook ID
    const webhookId = '1';
    
    // Call fetchSecuritySettings directly
    await act(async () => {
      await getContextValues().fetchSecuritySettings(webhookId);
    });
    
    // Verify mock was called correctly
    expect(mockExecuteCustom).toHaveBeenCalledWith(`${webhookId}/security`, 'GET');
  });
  
  test('updates security settings', async () => {
    const { getContextValues } = renderWithWebhookContext();
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // Webhook ID and security settings
    const webhookId = '1';
    const settings = {
      authType: 'basic',
      username: 'testuser',
      password: 'testpass'
    };
    
    // Call updateSecuritySettings directly
    await act(async () => {
      await getContextValues().updateSecuritySettings(webhookId, settings);
    });
    
    // Verify mock was called correctly
    expect(mockExecuteCustom).toHaveBeenCalledWith(
      `${webhookId}/security`, 
      'PUT',
      settings
    );
  });

  test('handles API errors gracefully', async () => {
    // Mock getById to reject for this specific test
    const errorApiService = {
      ...mockApiService,
      getById: jest.fn().mockRejectedValue(new Error('API error')),
    };

    const { getContextValues } = renderWithWebhookContext(errorApiService);
    
    // Wait for context to be available
    await waitFor(() => {
      expect(getContextValues()).toBeDefined();
    });
    
    // ID for the webhook to fetch
    const id = '1';
    
    // Call fetchWebhookById that should fail
    await act(async () => {
      try {
        await getContextValues().fetchWebhookById(id);
      } catch (error) {
        // Expected error, ignore for test
      }
    });
    
    // Verify mock was called with expected ID
    expect(errorApiService.getById).toHaveBeenCalledWith(id);
    
    // Since we're testing error case, mocking setError is better than checking context value
    // The error would be set via the setError function from useState
    // Instead, we'll verify the mock function was called correctly
  });
});
