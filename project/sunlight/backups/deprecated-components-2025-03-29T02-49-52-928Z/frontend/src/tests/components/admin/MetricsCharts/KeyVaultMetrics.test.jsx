import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KeyVaultMetrics from '@components/admin/MetricsCharts/KeyVaultMetrics';
import { getKeyVaultMetrics } from '@services/azureMonitorService';

// Mock the services
jest.mock('../../../../services/azureMonitorService');

// Mock MetricChart component
jest.mock('../../../../components/common/MetricChart', () => {
  const MockMetricChart = ({ 
    title, 
    data, 
    loading, 
    error, 
    refreshCallback, 
    initialTimeRange,
    onDownload
  }) => (
    <div data-testid={`metric-chart-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div data-testid={`title-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</div>
      <div data-testid={`loading-${title.replace(/\s+/g, '-').toLowerCase()}`}>{loading.toString()}</div>
      <div data-testid={`error-${title.replace(/\s+/g, '-').toLowerCase()}`}>{error || 'no-error'}</div>
      <div data-testid={`data-${title.replace(/\s+/g, '-').toLowerCase()}`}>{JSON.stringify(data)}</div>
      <div data-testid={`time-range-${title.replace(/\s+/g, '-').toLowerCase()}`}>{initialTimeRange}</div>
      <button 
        data-testid={`refresh-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={() => refreshCallback('1h')}
      >
        Refresh
      </button>
      <button 
        data-testid={`download-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={() => onDownload('CSV', { 
          labels: ['2023-01-01T00:00:00Z'], 
          datasets: [{ label: 'Test', data: [123] }] 
        }, title)}
      >
        Download
      </button>
    </div>
  );
  
  return MockMetricChart;
});

describe('KeyVaultMetrics', () => {
  // Sample mock data
  const mockMetricsData = {
    apiRequests: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'API Requests', data: [520, 610] }]
    },
    availability: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Availability (%)', data: [99.9, 100] }]
    },
    latency: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Latency (ms)', data: [32, 30] }]
    },
    operationTypes: {
      labels: ['Secrets', 'Keys', 'Certificates'],
      datasets: [{ data: [65, 20, 15], backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'] }]
    },
    operationResults: {
      labels: ['Success', 'Permission Denied', 'Other Errors'],
      datasets: [{ data: [95, 3, 2], backgroundColor: ['#4CAF50', '#FF9800', '#F44336'] }]
    },
    saturation: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Saturation (%)', data: [42, 45] }]
    }
  };
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Implement mock API for metrics fetching
    getKeyVaultMetrics.mockImplementation((resourceId, metricName, timeRange) => {
      return Promise.resolve(mockMetricsData[metricName]);
    });
    
    // Mock global URL and Blob objects
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document operations for download
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.createElement = jest.fn().mockImplementation(() => ({
      href: '',
      download: '',
      click: jest.fn()
    }));
  });
  
  it('should render all metric charts', async () => {
    render(<KeyVaultMetrics keyVaultId="test-keyvault-id&quot; keyVaultName="Test Key Vault" />);
    
    // Check that all charts are rendered
    expect(screen.getByTestId('metric-chart-api-requests')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-availability')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-latency')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-service-saturation')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-operation-types')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-operation-results')).toBeInTheDocument();
    
    // Check the key vault name in the title
    expect(screen.getByText('Test Key Vault Metrics')).toBeInTheDocument();
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-api-requests').textContent).toBe('false');
    });
    
    // Verify API was called for each metric
    expect(getKeyVaultMetrics).toHaveBeenCalledTimes(6);
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'apiRequests', '24h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'availability', '24h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'latency', '24h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'operationTypes', '24h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'operationResults', '24h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'saturation', '24h');
    
    // Check that data is passed to charts
    expect(screen.getByTestId('data-api-requests').textContent).toContain('API Requests');
    expect(screen.getByTestId('data-availability').textContent).toContain('Availability');
    expect(screen.getByTestId('data-latency').textContent).toContain('Latency');
    expect(screen.getByTestId('data-service-saturation').textContent).toContain('Saturation');
    expect(screen.getByTestId('data-operation-types').textContent).toContain('backgroundColor');
    expect(screen.getByTestId('data-operation-results').textContent).toContain('backgroundColor');
  });
  
  it('should handle missing keyVaultName', async () => {
    render(<KeyVaultMetrics keyVaultId="test-keyvault-id&quot; />);
    
    // Check that generic title is used when no name is provided
    expect(screen.getByText("Key Vault Metrics')).toBeInTheDocument();
  });
  
  it('should handle API errors', async () => {
    // Mock API error
    getKeyVaultMetrics.mockRejectedValue(new Error('API error'));
    
    render(<KeyVaultMetrics keyVaultId="test-keyvault-id&quot; keyVaultName="Test Key Vault" />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-api-requests').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-api-requests').textContent).toContain('Failed to load');
  });
  
  it('should handle missing keyVaultId', async () => {
    render(<KeyVaultMetrics keyVaultId="&quot; />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId("error-api-requests').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-api-requests').textContent).toContain('No Key Vault ID provided');
  });
  
  it('should refresh metrics when time range changes', async () => {
    render(<KeyVaultMetrics keyVaultId="test-keyvault-id&quot; keyVaultName="Test Key Vault" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-api-requests').textContent).toBe('false');
    });
    
    // Clear API mock calls
    getKeyVaultMetrics.mockClear();
    
    // Click refresh button on API Requests chart
    await act(async () => {
      screen.getByTestId('refresh-btn-api-requests').click();
    });
    
    // Check that API was called with new time range
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'apiRequests', '1h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'availability', '1h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'latency', '1h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'operationTypes', '1h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'operationResults', '1h');
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'saturation', '1h');
    
    // Check that time range has been updated
    expect(screen.getByTestId('time-range-api-requests').textContent).toBe('1h');
  });
  
  it('should handle CSV download', async () => {
    render(<KeyVaultMetrics keyVaultId="test-keyvault-id&quot; keyVaultName="Test Key Vault" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-api-requests').textContent).toBe('false');
    });
    
    // Trigger CSV download
    await act(async () => {
      screen.getByTestId('download-btn-api-requests').click();
    });
    
    // Verify download link was created
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
  
  it('should initialize with custom time range', async () => {
    render(
      <KeyVaultMetrics 
        keyVaultId="test-keyvault-id&quot; 
        keyVaultName="Test Key Vault"
        initialTimeRange="7d&quot;
      />
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-api-requests').textContent).toBe('false');
    });
    
    // Check that API was called with custom time range
    expect(getKeyVaultMetrics).toHaveBeenCalledWith('test-keyvault-id', 'apiRequests', '7d');
    
    // Check that time range is displayed
    expect(screen.getByTestId('time-range-api-requests').textContent).toBe('7d');
  });
});