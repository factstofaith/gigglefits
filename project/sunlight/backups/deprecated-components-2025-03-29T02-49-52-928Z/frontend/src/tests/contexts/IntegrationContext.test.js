// tests/contexts/IntegrationContext.test.js
// -----------------------------------------------------------------------------
// Tests for the IntegrationContext provider and hook using dependency injection pattern

import React, { useEffect } from 'react';
import { render, act, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntegrationProvider, useIntegration } from '@contexts/IntegrationContext';

// Sample mock data
const mockIntegration = {
  id: '123',
  name: 'Test Integration',
  status: 'active',
  type: 'data-sync',
  source: {
    type: 'api',
    name: 'Source API',
    config: { url: 'https://api.example.com/data' }
  },
  destination: {
    type: 'database',
    name: 'Destination Database',
    config: { connectionString: 'db://example.com/dest' }
  },
  schedule: {
    type: 'daily',
    time: '12:00'
  },
  lastRun: '2025-01-03T10:15:00Z',
  nextRun: '2025-01-04T12:00:00Z',
  createdAt: '2025-01-01T12:00:00Z',
  updatedAt: '2025-01-02T12:00:00Z',
  createdBy: 'admin',
  updatedBy: 'admin'
};

const mockHistory = [
  {
    id: '1',
    integrationId: '123',
    event: 'created',
    timestamp: '2025-01-01T12:00:00Z',
    user: 'admin',
    metadata: { note: 'Initial creation' }
  },
  {
    id: '2',
    integrationId: '123',
    event: 'updated',
    timestamp: '2025-01-02T12:00:00Z',
    user: 'admin',
    metadata: { fields: ['schedule'] }
  },
  {
    id: '3',
    integrationId: '123',
    event: 'run_started',
    timestamp: '2025-01-03T10:15:00Z',
    user: 'system',
    metadata: { runId: '1' }
  }
];

const mockRuns = [
  {
    id: '1',
    integrationId: '123',
    status: 'success',
    startedAt: '2025-01-03T10:15:00Z',
    completedAt: '2025-01-03T10:20:00Z',
    duration: 300, // 5 minutes in seconds
    records: 100,
    errors: 0,
    warnings: 2,
    triggeredBy: 'system',
    metadata: { batchId: 'batch-123' }
  },
  {
    id: '2',
    integrationId: '123',
    status: 'failed',
    startedAt: '2025-01-02T10:15:00Z',
    completedAt: '2025-01-02T10:16:00Z',
    duration: 60, // 1 minute in seconds
    records: 10,
    errors: 1,
    warnings: 0,
    triggeredBy: 'admin',
    error: 'Connection failed: timeout',
    metadata: { batchId: 'batch-122' }
  },
  {
    id: '3',
    integrationId: '123',
    status: 'canceled',
    startedAt: '2025-01-01T10:15:00Z',
    completedAt: '2025-01-01T10:16:30Z',
    duration: 90, // 1.5 minutes in seconds
    records: 25,
    errors: 0,
    warnings: 1,
    triggeredBy: 'admin',
    metadata: { batchId: 'batch-121', canceledBy: 'admin' }
  }
];

// Add mock data for new functionality
const mockFlowData = {
  nodes: [
    { id: 'node-1', type: 'source', data: { label: 'Source Node' } },
    { id: 'node-2', type: 'destination', data: { label: 'Destination Node' } }
  ],
  edges: [
    { id: 'edge-1', source: 'node-1', target: 'node-2' }
  ]
};

const mockFieldMappings = [
  { id: 'mapping-1', sourceField: 'name', targetField: 'full_name', transformationType: 'direct' },
  { id: 'mapping-2', sourceField: 'email', targetField: 'contact_email', transformationType: 'lowercase' }
];

const mockDatasets = [
  { id: 'dataset-1', name: 'Customer Data', description: 'Customer information dataset' },
  { id: 'dataset-2', name: 'Product Data', description: 'Product catalog dataset' }
];

const mockScheduleConfig = {
  enabled: true,
  cronExpression: '0 0 * * *',
  timezone: 'UTC',
  startDate: '2025-01-01T00:00:00Z',
  endDate: null,
  maxRetries: 3,
  retryInterval: 300
};

const mockDiscoveredFields = {
  source: [
    { name: 'id', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: false }
  ],
  destination: [
    { name: 'user_id', type: 'string', required: true },
    { name: 'full_name', type: 'string', required: true },
    { name: 'contact_email', type: 'string', required: true }
  ]
};

const mockValidationResults = {
  valid: true,
  errors: [],
  warnings: [
    { type: 'connection', message: 'Connection might be slow', nodeId: 'node-1' }
  ]
};

// Create mock functions for each API service method used in the context
const createMockApiService = () => {
  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';


  return {
    // Base methods
    getIntegrationById: jest.fn().mockResolvedValue(mockIntegration),
    getIntegrationHistory: jest.fn().mockResolvedValue(mockHistory),
    getIntegrationRuns: jest.fn().mockResolvedValue(mockRuns),
    runIntegration: jest.fn().mockResolvedValue({ success: true, runId: '4' }),
    deleteIntegration: jest.fn().mockResolvedValue(true),
    
    // Flow methods
    getIntegrationFlow: jest.fn().mockResolvedValue(mockFlowData),
    saveIntegrationFlow: jest.fn().mockImplementation(
      (id, data) => Promise.resolve({ ...data, id })
    ),
    validateIntegrationFlow: jest.fn().mockResolvedValue(mockValidationResults),
    
    // Field mapping methods
    getFieldMappings: jest.fn().mockResolvedValue(mockFieldMappings),
    createFieldMapping: jest.fn().mockImplementation(
      (id, data) => Promise.resolve({ id: 'new-mapping', ...data })
    ),
    updateFieldMapping: jest.fn().mockImplementation(
      (id, mappingId, data) => Promise.resolve({ id: mappingId, ...data })
    ),
    deleteFieldMapping: jest.fn().mockResolvedValue(true),
    
    // Dataset methods
    getIntegrationDatasets: jest.fn().mockResolvedValue(mockDatasets),
    associateDataset: jest.fn().mockResolvedValue(true),
    disassociateDataset: jest.fn().mockResolvedValue(true),
    
    // Schedule methods
    getScheduleConfig: jest.fn().mockResolvedValue(mockScheduleConfig),
    updateScheduleConfig: jest.fn().mockImplementation(
      (id, config) => Promise.resolve({ ...config, integrationId: id })
    ),
    
    // Discovery methods
    discoverFields: jest.fn().mockImplementation(
      (id, type) => Promise.resolve(mockDiscoveredFields[type] || [])
    )
  };
};

// Test component with optional callback to expose context values
const TestComponent = ({ onContextLoad = () => {
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

} }) => {
  const context = useIntegration();
  
  // Call the callback with context values after render
  useEffect(() => {
    onContextLoad(context);
  }, [onContextLoad, context]);

  const {
    // Base state
    integrationId,
    integration,
    history,
    runs,
    loading,
    errors,
    isLoading,
    hasError,
    
    // Extended state
    flowData,
    fieldMappings,
    datasets,
    scheduleConfig,
    discoveredFields,
    validationResults,
    isSaving,
    isValidating,
    isDiscovering,
    hasValidationErrors,
    
    // Base actions
    setIntegrationId,
    fetchIntegration,
    fetchHistory,
    fetchRuns,
    runIntegration,
    deleteIntegration,
    
    // Extended actions
    fetchFlowData,
    saveFlowData,
    validateFlow,
    fetchFieldMappings,
    createMapping,
    updateMapping,
    deleteMapping,
    fetchDatasets,
    associateDataset,
    disassociateDataset,
    fetchScheduleConfig,
    updateSchedule,
    discoverFields
  } = context;

  return (
    <div>
      {/* Integration state display */}
      <div data-testid="integration-id">{integrationId || 'no-id'}</div>
      <div data-testid="integration-name">
        {integration ? integration.name : 'No integration loaded'}
      </div>
      <div data-testid="integration-type">
        {integration ? integration.type : 'unknown'}
      </div>
      <div data-testid="integration-status">
        {integration ? integration.status : 'unknown'}
      </div>

      {/* History and runs data */}
      <div data-testid="history-count">{history.length}</div>
      <div data-testid="runs-count">{runs.length}</div>
      <div data-testid="last-event">
        {history.length > 0 ? history[0].event : 'none'}
      </div>
      <div data-testid="last-run-status">
        {runs.length > 0 ? runs[0].status : 'none'}
      </div>

      {/* Flow data display */}
      <div data-testid="flow-nodes-count">
        {flowData ? flowData.nodes.length : 0}
      </div>
      <div data-testid="flow-edges-count">
        {flowData ? flowData.edges.length : 0}
      </div>

      {/* Field mappings display */}
      <div data-testid="mappings-count">{fieldMappings.length}</div>
      <div data-testid="first-mapping">
        {fieldMappings.length > 0 ? `${fieldMappings[0].sourceField} → ${fieldMappings[0].targetField}` : 'none'}
      </div>

      {/* Datasets display */}
      <div data-testid="datasets-count">{datasets.length}</div>
      <div data-testid="first-dataset">
        {datasets.length > 0 ? datasets[0].name : 'none'}
      </div>

      {/* Schedule display */}
      <div data-testid="schedule-enabled">
        {scheduleConfig ? (scheduleConfig.enabled ? 'true' : 'false') : 'none'}
      </div>
      <div data-testid="schedule-cron">
        {scheduleConfig ? scheduleConfig.cronExpression : 'none'}
      </div>

      {/* Discovered fields */}
      <div data-testid="source-fields-count">
        {discoveredFields.source ? discoveredFields.source.length : 0}
      </div>
      <div data-testid="destination-fields-count">
        {discoveredFields.destination ? discoveredFields.destination.length : 0}
      </div>

      {/* Validation results */}
      <div data-testid="validation-errors-count">
        {validationResults ? validationResults.errors.length : 0}
      </div>
      <div data-testid="validation-warnings-count">
        {validationResults ? validationResults.warnings.length : 0}
      </div>
      <div data-testid="has-validation-errors">
        {hasValidationErrors ? 'true' : 'false'}
      </div>

      {/* Loading states */}
      <div data-testid="loading-integration">{loading.integration ? 'true' : 'false'}</div>
      <div data-testid="loading-history">{loading.history ? 'true' : 'false'}</div>
      <div data-testid="loading-runs">{loading.runs ? 'true' : 'false'}</div>
      <div data-testid="loading-running">{loading.running ? 'true' : 'false'}</div>
      <div data-testid="loading-deleting">{loading.deleting ? 'true' : 'false'}</div>
      <div data-testid="loading-flow-data">{loading.flowData ? 'true' : 'false'}</div>
      <div data-testid="loading-field-mappings">{loading.fieldMappings ? 'true' : 'false'}</div>
      <div data-testid="loading-datasets">{loading.datasets ? 'true' : 'false'}</div>
      <div data-testid="loading-schedule">{loading.schedule ? 'true' : 'false'}</div>
      <div data-testid="loading-discovery">{loading.discovery ? 'true' : 'false'}</div>
      <div data-testid="loading-validation">{loading.validation ? 'true' : 'false'}</div>
      <div data-testid="loading-saving">{loading.saving ? 'true' : 'false'}</div>
      <div data-testid="is-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="is-saving">{isSaving ? 'true' : 'false'}</div>
      <div data-testid="is-validating">{isValidating ? 'true' : 'false'}</div>
      <div data-testid="is-discovering">{isDiscovering ? 'true' : 'false'}</div>

      {/* Error states */}
      <div data-testid="error-integration">{errors.integration || 'no-error'}</div>
      <div data-testid="error-history">{errors.history || 'no-error'}</div>
      <div data-testid="error-runs">{errors.runs || 'no-error'}</div>
      <div data-testid="error-run">{errors.run || 'no-error'}</div>
      <div data-testid="error-delete">{errors.delete || 'no-error'}</div>
      <div data-testid="error-flow-data">{errors.flowData || 'no-error'}</div>
      <div data-testid="error-field-mappings">{errors.fieldMappings || 'no-error'}</div>
      <div data-testid="error-datasets">{errors.datasets || 'no-error'}</div>
      <div data-testid="error-schedule">{errors.schedule || 'no-error'}</div>
      <div data-testid="error-discovery">{errors.discovery || 'no-error'}</div>
      <div data-testid="error-validation">{errors.validation || 'no-error'}</div>
      <div data-testid="error-saving">{errors.saving || 'no-error'}</div>
      <div data-testid="has-error">{hasError ? 'true' : 'false'}</div>

      {/* Base actions */}
      <button data-testid="set-integration-id" onClick={() => setIntegrationId('123')}>
        Set Integration ID
      </button>
      <button data-testid="clear-integration-id" onClick={() => setIntegrationId(null)}>
        Clear Integration ID
      </button>
      <button data-testid="fetch-integration" onClick={() => fetchIntegration('123')}>
        Fetch Integration
      </button>
      <button data-testid="fetch-history" onClick={() => fetchHistory('123')}>
        Fetch History
      </button>
      <button data-testid="fetch-runs" onClick={() => fetchRuns('123')}>
        Fetch Runs
      </button>
      <button data-testid="run-integration" onClick={() => runIntegration()}>
        Run Integration
      </button>
      <button data-testid="delete-integration" onClick={() => deleteIntegration()}>
        Delete Integration
      </button>

      {/* Flow data actions */}
      <button data-testid="fetch-flow-data" onClick={() => fetchFlowData('123')}>
        Fetch Flow Data
      </button>
      <button 
        data-testid="save-flow-data" 
        onClick={() => saveFlowData({ 
          nodes: [{ id: 'new-node', type: 'source', data: { label: 'New Source' } }],
          edges: []
        })}
      >
        Save Flow Data
      </button>
      <button data-testid="validate-flow" onClick={() => validateFlow()}>
        Validate Flow
      </button>

      {/* Field mapping actions */}
      <button data-testid="fetch-field-mappings" onClick={() => fetchFieldMappings('123')}>
        Fetch Mappings
      </button>
      <button 
        data-testid="create-mapping" 
        onClick={() => createMapping({ 
          sourceField: 'new_field', 
          targetField: 'new_target',
          transformationType: 'direct'
        })}
      >
        Create Mapping
      </button>
      <button 
        data-testid="update-mapping" 
        onClick={() => updateMapping('mapping-1', { 
          sourceField: 'updated_field', 
          targetField: 'updated_target',
          transformationType: 'uppercase'
        })}
      >
        Update Mapping
      </button>
      <button data-testid="delete-mapping" onClick={() => deleteMapping('mapping-1')}>
        Delete Mapping
      </button>

      {/* Dataset actions */}
      <button data-testid="fetch-datasets" onClick={() => fetchDatasets('123')}>
        Fetch Datasets
      </button>
      <button data-testid="associate-dataset" onClick={() => associateDataset('new-dataset')}>
        Associate Dataset
      </button>
      <button data-testid="disassociate-dataset" onClick={() => disassociateDataset('dataset-1')}>
        Disassociate Dataset
      </button>

      {/* Schedule actions */}
      <button data-testid="fetch-schedule" onClick={() => fetchScheduleConfig('123')}>
        Fetch Schedule
      </button>
      <button 
        data-testid="update-schedule" 
        onClick={() => updateSchedule({ 
          enabled: true, 
          cronExpression: '0 12 * * *',
          timezone: 'America/New_York' 
        })}
      >
        Update Schedule
      </button>

      {/* Discovery actions */}
      <button data-testid="discover-source-fields" onClick={() => discoverFields('source')}>
        Discover Source Fields
      </button>
      <button data-testid="discover-destination-fields" onClick={() => discoverFields('destination')}>
        Discover Destination Fields
      </button>
    </div>
  );
};

// Helper function for simpler test setup with dependency injection
const renderWithIntegrationContext = (
  apiService = createMockApiService(),
  initialIntegrationId = null
) => {
  let contextValues = null;
  
  render(
    <IntegrationProvider 
      apiService={apiService} 
      initialIntegrationId={initialIntegrationId}
    >
      <TestComponent onContextLoad={(values) => {
        contextValues = values;
      }} />
    </IntegrationProvider>
  );
  
  // Helper to get the latest context values
  const getContextValues = () => contextValues;
  
  return {
    getContextValues,
    apiService
  };
};

describe('IntegrationContext using dependency injection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console.error
    console.error.mockRestore();
  });
  
  // New tests for extended functionality
  
  it('should load all related data when integration ID is set', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService, '123');
    
    // Wait for all data to load
    await waitFor(() => {
      // Basic data should be loaded
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
      
      // Extended data should also be loaded
      expect(screen.getByTestId('flow-nodes-count')).toHaveTextContent('2');
      expect(screen.getByTestId('flow-edges-count')).toHaveTextContent('1');
      expect(screen.getByTestId('mappings-count')).toHaveTextContent('2');
      expect(screen.getByTestId('datasets-count')).toHaveTextContent('2');
      expect(screen.getByTestId('schedule-enabled')).toHaveTextContent('true');
    });
    
    // Verify all service methods were called
    expect(mockApiService.getIntegrationById).toHaveBeenCalledWith('123');
    expect(mockApiService.getIntegrationHistory).toHaveBeenCalledWith('123');
    expect(mockApiService.getIntegrationRuns).toHaveBeenCalledWith('123', 0, 10);
    expect(mockApiService.getIntegrationFlow).toHaveBeenCalledWith('123');
    expect(mockApiService.getFieldMappings).toHaveBeenCalledWith('123');
    expect(mockApiService.getIntegrationDatasets).toHaveBeenCalledWith('123');
    expect(mockApiService.getScheduleConfig).toHaveBeenCalledWith('123');
  });
  
  it('should fetch flow data when requested', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);
    
    // Click to fetch flow data
    fireEvent.click(screen.getByTestId('fetch-flow-data'));
    
    // Should show loading state
    expect(screen.getByTestId('loading-flow-data')).toHaveTextContent('true');
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-flow-data')).toHaveTextContent('false');
      expect(screen.getByTestId('flow-nodes-count')).toHaveTextContent('2');
      expect(screen.getByTestId('flow-edges-count')).toHaveTextContent('1');
    });
    
    // Verify service call
    expect(mockApiService.getIntegrationFlow).toHaveBeenCalledWith('123');
  });
  
  it('should save flow data', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService, '123');
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('flow-nodes-count')).toHaveTextContent('2');
    });
    
    // Click to save flow data
    fireEvent.click(screen.getByTestId('save-flow-data'));
    
    // Should show saving state
    expect(screen.getByTestId('loading-saving')).toHaveTextContent('true');
    expect(screen.getByTestId('is-saving')).toHaveTextContent('true');
    
    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-saving')).toHaveTextContent('false');
      expect(screen.getByTestId('is-saving')).toHaveTextContent('false');
      
      // Flow data should be updated
      expect(screen.getByTestId('flow-nodes-count')).toHaveTextContent('1');
      expect(screen.getByTestId('flow-edges-count')).toHaveTextContent('0');
    });
    
    // Verify service call with correct data
    expect(mockApiService.saveIntegrationFlow).toHaveBeenCalledWith(
      '123',
      {
        nodes: [{ id: 'new-node', type: 'source', data: { label: 'New Source' } }],
        edges: []
      }
    );
  });
  
  it('should validate flow data', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService, '123');
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('flow-nodes-count')).toHaveTextContent('2');
    });
    
    // Click to validate flow
    fireEvent.click(screen.getByTestId('validate-flow'));
    
    // Should show validating state
    expect(screen.getByTestId('loading-validation')).toHaveTextContent('true');
    expect(screen.getByTestId('is-validating')).toHaveTextContent('true');
    
    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-validation')).toHaveTextContent('false');
      expect(screen.getByTestId('is-validating')).toHaveTextContent('false');
      
      // Validation results should be updated
      expect(screen.getByTestId('validation-errors-count')).toHaveTextContent('0');
      expect(screen.getByTestId('validation-warnings-count')).toHaveTextContent('1');
      expect(screen.getByTestId('has-validation-errors')).toHaveTextContent('false');
    });
    
    // Verify service call with current flow data
    expect(mockApiService.validateIntegrationFlow).toHaveBeenCalledWith('123', mockFlowData);
  });

  it('should initialize with default values', () => {
    renderWithIntegrationContext();

    // Check initial state
    expect(screen.getByTestId('integration-id')).toHaveTextContent('no-id');
    expect(screen.getByTestId('integration-name')).toHaveTextContent('No integration loaded');
    expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    expect(screen.getByTestId('runs-count')).toHaveTextContent('0');

    // Loading states should be false
    expect(screen.getByTestId('loading-integration')).toHaveTextContent('false');
    expect(screen.getByTestId('loading-history')).toHaveTextContent('false');
    expect(screen.getByTestId('loading-runs')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

    // Error states should be empty
    expect(screen.getByTestId('error-integration')).toHaveTextContent('no-error');
    expect(screen.getByTestId('error-history')).toHaveTextContent('no-error');
    expect(screen.getByTestId('error-runs')).toHaveTextContent('no-error');
    expect(screen.getByTestId('has-error')).toHaveTextContent('false');
  });

  it('should initialize with provided integration ID', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService, '123');

    // Integration ID should be set from props
    expect(screen.getByTestId('integration-id')).toHaveTextContent('123');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
      expect(screen.getByTestId('history-count')).toHaveTextContent('3');
      expect(screen.getByTestId('runs-count')).toHaveTextContent('3');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    // Verify service calls
    expect(mockApiService.getIntegrationById).toHaveBeenCalledWith('123');
    expect(mockApiService.getIntegrationHistory).toHaveBeenCalledWith('123');
    expect(mockApiService.getIntegrationRuns).toHaveBeenCalledWith('123', 0, 10);
  });

  it('should load integration data when ID is set', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);

    // Click to set integration ID
    fireEvent.click(screen.getByTestId('set-integration-id'));

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-id')).toHaveTextContent('123');
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
      expect(screen.getByTestId('integration-type')).toHaveTextContent('data-sync');
      expect(screen.getByTestId('integration-status')).toHaveTextContent('active');
      expect(screen.getByTestId('history-count')).toHaveTextContent('3');
      expect(screen.getByTestId('runs-count')).toHaveTextContent('3');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    // Verify service calls
    expect(mockApiService.getIntegrationById).toHaveBeenCalledWith('123');
    expect(mockApiService.getIntegrationHistory).toHaveBeenCalledWith('123');
    expect(mockApiService.getIntegrationRuns).toHaveBeenCalledWith('123', 0, 10);
  });

  it('should clear integration data when ID is cleared', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService, '123');

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    });

    // Click to clear integration ID
    fireEvent.click(screen.getByTestId('clear-integration-id'));

    // Data should be cleared
    expect(screen.getByTestId('integration-id')).toHaveTextContent('no-id');
    expect(screen.getByTestId('integration-name')).toHaveTextContent('No integration loaded');
    expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    expect(screen.getByTestId('runs-count')).toHaveTextContent('0');
  });

  it('should fetch integration data explicitly', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);

    // Click to fetch integration
    fireEvent.click(screen.getByTestId('fetch-integration'));

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-integration')).toHaveTextContent('false');
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    });

    // Verify service call
    expect(mockApiService.getIntegrationById).toHaveBeenCalledWith('123');
  });

  it('should fetch history data explicitly', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);

    // Click to fetch history
    fireEvent.click(screen.getByTestId('fetch-history'));

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-history')).toHaveTextContent('false');
      expect(screen.getByTestId('history-count')).toHaveTextContent('3');
    });

    // Verify service call
    expect(mockApiService.getIntegrationHistory).toHaveBeenCalledWith('123');
  });

  it('should fetch runs data explicitly', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);

    // Click to fetch runs
    fireEvent.click(screen.getByTestId('fetch-runs'));

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading-runs')).toHaveTextContent('false');
      expect(screen.getByTestId('runs-count')).toHaveTextContent('3');
    });

    // Verify service call
    expect(mockApiService.getIntegrationRuns).toHaveBeenCalledWith('123', 0, 10);
  });

  it('should handle run integration action', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService, '123');

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    });

    // Click to run integration
    fireEvent.click(screen.getByTestId('run-integration'));

    // Wait for run to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-running')).toHaveTextContent('false');
    });

    // Verify service calls
    expect(mockApiService.runIntegration).toHaveBeenCalledWith('123');
    
    // History should be refreshed after run
    expect(mockApiService.getIntegrationHistory).toHaveBeenCalledTimes(2);
  });

  it('should handle delete integration action', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService, '123');

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    });

    // Click to delete integration
    fireEvent.click(screen.getByTestId('delete-integration'));

    // Wait for delete to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-deleting')).toHaveTextContent('false');
      
      // Integration ID should be cleared after deletion
      expect(screen.getByTestId('integration-id')).toHaveTextContent('no-id');
      
      // Integration should be null
      expect(screen.getByTestId('integration-name')).toHaveTextContent('No integration loaded');
    });

    // Verify service call
    expect(mockApiService.deleteIntegration).toHaveBeenCalledWith('123');
  });

  it('should prevent running integration when no ID is set', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);

    // Try to run integration without ID
    fireEvent.click(screen.getByTestId('run-integration'));

    // Should not call service
    expect(mockApiService.runIntegration).not.toHaveBeenCalled();
    
    // No loading state should be set
    expect(screen.getByTestId('loading-running')).toHaveTextContent('false');
  });

  it('should prevent deleting integration when no ID is set', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);

    // Try to delete integration without ID
    fireEvent.click(screen.getByTestId('delete-integration'));

    // Should not call service
    expect(mockApiService.deleteIntegration).not.toHaveBeenCalled();
    
    // No loading state should be set
    expect(screen.getByTestId('loading-deleting')).toHaveTextContent('false');
  });

  it('should handle error when fetching integration', async () => {
    const mockApiService = createMockApiService();
    mockApiService.getIntegrationById.mockRejectedValue(
      new Error('Failed to fetch integration')
    );

    renderWithIntegrationContext(mockApiService);

    // Click to fetch integration
    fireEvent.click(screen.getByTestId('fetch-integration'));

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading-integration')).toHaveTextContent('false');
      expect(screen.getByTestId('error-integration')).toHaveTextContent(
        'Failed to load integration details'
      );
      expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    });

    // Integration should not be loaded
    expect(screen.getByTestId('integration-name')).toHaveTextContent('No integration loaded');
    
    // Console error should have been called
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error when fetching history', async () => {
    const mockApiService = createMockApiService();
    mockApiService.getIntegrationHistory.mockRejectedValue(
      new Error('Failed to fetch history')
    );

    renderWithIntegrationContext(mockApiService);

    // Click to fetch history
    fireEvent.click(screen.getByTestId('fetch-history'));

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading-history')).toHaveTextContent('false');
      expect(screen.getByTestId('error-history')).toHaveTextContent(
        'Failed to load integration history'
      );
      expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    });

    // History should be empty
    expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    
    // Console error should have been called
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error when fetching runs', async () => {
    const mockApiService = createMockApiService();
    mockApiService.getIntegrationRuns.mockRejectedValue(
      new Error('Failed to fetch runs')
    );

    renderWithIntegrationContext(mockApiService);

    // Click to fetch runs
    fireEvent.click(screen.getByTestId('fetch-runs'));

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading-runs')).toHaveTextContent('false');
      expect(screen.getByTestId('error-runs')).toHaveTextContent(
        'Failed to load detailed run history'
      );
      expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    });

    // Runs should be empty
    expect(screen.getByTestId('runs-count')).toHaveTextContent('0');
    
    // Console error should have been called
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error when running integration', async () => {
    const mockApiService = createMockApiService();
    mockApiService.runIntegration.mockRejectedValue(
      new Error('Failed to run integration')
    );

    renderWithIntegrationContext(mockApiService, '123');

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    });

    // Click to run integration
    fireEvent.click(screen.getByTestId('run-integration'));

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading-running')).toHaveTextContent('false');
      expect(screen.getByTestId('error-run')).toHaveTextContent(
        'Failed to run integration'
      );
      expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    });
    
    // Console error should have been called
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error when deleting integration', async () => {
    const mockApiService = createMockApiService();
    mockApiService.deleteIntegration.mockRejectedValue(
      new Error('Failed to delete integration')
    );

    renderWithIntegrationContext(mockApiService, '123');

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    });

    // Click to delete integration
    fireEvent.click(screen.getByTestId('delete-integration'));

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('loading-deleting')).toHaveTextContent('false');
      expect(screen.getByTestId('error-delete')).toHaveTextContent(
        'Failed to delete integration'
      );
      expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    });
    
    // Integration should not be cleared on error
    expect(screen.getByTestId('integration-id')).toHaveTextContent('123');
    expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    
    // Console error should have been called
    expect(console.error).toHaveBeenCalled();
  });

  it('should provide combined loading and error state helpers', async () => {
    const mockApiService = createMockApiService();
    renderWithIntegrationContext(mockApiService);

    // Initially all states should be false
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('has-error')).toHaveTextContent('false');

    // Click to fetch integration
    fireEvent.click(screen.getByTestId('fetch-integration'));

    // Loading state should be true
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('has-error')).toHaveTextContent('false');
    });

    // Setup mock error response for history
    mockApiService.getIntegrationHistory.mockRejectedValueOnce(
      new Error('Failed to fetch history')
    );

    // Click to fetch history with error
    fireEvent.click(screen.getByTestId('fetch-history'));

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    });
  });

  it('should throw error when hook is used outside provider', () => {
    // Mock console.error to avoid test output noise
    const originalError = console.error;
    console.error = jest.fn();
    
    // Using a custom render function to catch the expected error
    const renderWithoutProvider = () => {
  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';


      const TestHookComponent = () => {
  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';


        useIntegration();
        return <div>Should not render</div>;
      };
      
      return render(<TestHookComponent />);
    };
    
    // Expect the render to throw
    expect(renderWithoutProvider).toThrow('useIntegration must be used within an IntegrationProvider');
    
    // Restore original console.error
    console.error = originalError;
  });

  it('should directly expose context methods through getContextValues helper', async () => {
    const mockApiService = createMockApiService();
    const { getContextValues } = renderWithIntegrationContext(mockApiService, '123');
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
    });
    
    // Get current context values
    const contextValues = getContextValues();
    
    // Verify context methods and values are accessible
    expect(contextValues.integrationId).toBe('123');
    expect(contextValues.integration).toEqual(mockIntegration);
    expect(contextValues.history).toEqual(mockHistory);
    expect(contextValues.runs).toEqual(mockRuns);
    expect(typeof contextValues.fetchIntegration).toBe('function');
    expect(typeof contextValues.runIntegration).toBe('function');
    expect(typeof contextValues.deleteIntegration).toBe('function');
  });
});